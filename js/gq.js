//anonymous function that executes automatically
( //wrap anonymous function in parathesis so that you do not have to assign it to a variable and con
  //scope = the browser window or what is passed into the library
  //isForgiving = adds the possibility of overiding the error in order to load more than once
  function(scope, isForgiving){

    //version of application
    var version = 1.0001;


    //creates global document variable via window passed in
    var doc = scope.document;

    //stores the query language we are working with
    var q;

    var gQ = function (selector, context){
      return q.query(selector,context);
    };


    //loads a script to the head tag dynamically
    gQ.loadJS = function(path, callback){

    	var js = doc.createElement('script');

    			js.src = path;

    			js.type = 'text/javascript';

    			js.onload = function(){
    				callback();
    				this.onload = this.onreadystatechange = null;
    			};

    			js.onreadystatechange = function(){
    				if(this.readState == 'complete'){
    					this.onload();
    				}
    			}

    			doc.getElementsByTagName('head')[0].appendChild(js);

    };

    gQ.ready = function(fun){

    	var last = window.onload;

    	var isReady= false;

    	if(doc.addEventListener){
    		doc.addEventListener('DOMContentLoaded',function(){

    			console.log("DOM is loaded");

    			isReady = true;

    			fun();
    		});
    	}

    	window.onload = function(){
    		if(last) { last() };

    		if(isReady){ fun() };
    	}
    };

    //return as array in order to return similar across all adapters
    gQ.toArray = function(item){
      //grab length
  		var len = item.length;
  		var out = [];
      //if len is greater than 0 then iterate and create array in item order
  		if(len>0){
  			for(var i=0; i<len; i++)
  				out[i] = item[i];
  		}else{
        //else return item 0
  			out[0] = item;
  		}
      //return array
  		return out;
  	};


    //makes sure the document is loaded
    gQ.start = function(){};

    //returns the version numebr to outside the function without letting people access the version variable
    gQ.version = function(){
      return version;
    };

    //allows you to use querySelector or Sizzle or jquery to grab DOM elements
  gQ.ready(function(){
    //check for jquery in scope
    if(false && 'jQuery' in scope){
      //create new jquery adapter pasing jquery in
      //context is document
      //create adapter through queryfacade creat by sending in jquery adapter, jquery lib, and the document)
      q = QueryFacade.create(JQueryAdapter,scope.jQuery, doc);
      gQ.start();
    } else if(false && doc.querySelectorAll && doc.querySelectorAll('body:first-of-type')){
      //create new natuve adapter for neweer browsers
      //send in document
      //use query facade create to make adapter by sending in adapter, null and document
  		q = QueryFacade.create(NativeQuery, null, doc);
      gQ.start();
  	}else{
  		gQ.loadJS('js/sizzle.min.js', function(){
        //create new sizzle adapter in case of older browser
  			//makes q = sizzle
        //use query facade to create adapter using adapter sizle lib and doc.
  			q = QueryFacade.create(SizzleAdapter, Sizzle, doc);

        gQ.start();
  		});
  	}
  });

  //global facade object.  Pass in adapter
  QueryFacade = function(adapter){
    this.adapater = adapter;
  };

  //mimicking the query functions of the adapters
  QueryFacade.prototype.query = function(selector, context){
    //return the value returned from the adapter when sending in same information sent in function constructor
    // wrap in new query facade to insure the returned value is a query facade
    return new QueryFacade(this.adapter.query(selector, context));
  };

  //mimicking the text function of the adapters
  QueryFacade.prototype.text = function (value){
    //returning string
    return this.adapter.text(value);
  };

  //method to eliminate the hardcoding of initial construction that assigns jquery native and sizzle
  //insures queryfacade is used from the start
  QueryFacade.create = function(adapter, lib, context){
    //create any new adapter by passing making new adapter.  only possible because all queries have same design.
    return new QueryFacade(new adapter(lib, context));
  };

  //simple adapters for native and sizzle
  //translates an objhects properties and methods to another.  allow programming elements to work together
  //
  //constructor function to create a native solution
  //context is html element
  NativeQuery = function(lib, context){
    this.lib=lib;
    this.context=context;
  };

  //method to replace the doc.queryselectall
  NativeQuery.prototype.query = function(selector, context){

    //the context being sent currently or the context saved previously
    context = context || this.context;
    //self referential returns object with html element
    return new NativeQuery(gQ.toArray(context.querySelectorAll(selector)));
  };

  NativeQuery.prototype.text = function (value){
    //choosing innertext or text content to protect against firefox by testing first item
    innerText = (this.context[0].innerText===undefined) ? 'textContent':'innerText';
    //update element
    for(var item in this.context){
      //loop through and set values for each item
      this.context[item][innerText]=value;
    }
    //return changed items
    return value;
  };


  //sizzle adapter - create sizzle library
  SizzleAdapter = function(lib, context){
    this.lib=lib;
    //html element
    this.context=context;
  };

  //define every public method in the library
  SizzleAdapter.prototype.query = function(selector,context){

    //if not context use document
    context = context || doc;

    //returns a function similar to our query
    return new SizzleAdapter(this.lib, gQ.toArray(this.lib(selector, context)));
  };

  SizzleAdapter.prototype.text = function (value){
    //choosing innertext or text content to protect against firefox by testing first item
    innerText = (this.context[0].innerText===undefined) ? 'textContent':'innerText';
    //update element
    for(var item in this.context){
      //loop through and set values for each item
      this.context[item][innerText]=value;
    }
    //return changed items
    return value;
  };


  //using sizzle adapter design to create jquery adapter
  //jquery adapter - create jquey library
  JQueryAdapter = function(lib, context){
    //jquery library
    this.lib=lib;
    //html element
    this.context=context;
    //target for the library with the context already configured
    this.target = lib(context);
  };

  //define every public method in the library
  JQueryAdapter.prototype.query = function(selector,context){

    //if not context use document
    context = context || doc;

    //returns the dom element inside an array
    //create new jquery adapter with jquery library and context as the dom element returned as an array
    //refers to itself
    return new JQueryAdapter(this.lib,this.lib(selector, context).get());

  };

  //
  JQueryAdapter.prototype.text = function (value){
    return this.target.text(value);
  };

    //checks if the library exists and if not creates it and does version control.
    if(!scope.gQ){
      scope.gQ = gQ;

    } else {
      //asks if can allow duplicate instances and checks to make sure that gQ is not a user defined variable
      if(isForgiving && scope,gQ.version){
        //checks if the duplicate library version is larger than the current library version
        //if it is larger than sets window.gQ by itself else sets window.gQ as the new larger version gQ
        scope.gQ = scope.gQ.version()>version ? scope.gQ : gQ;

      } else {
      //make sure it is only instantiated once or if variable already defined
      //throw error if loaded more than once
        throw new Error("The variable window.gQ already exists.");

      }
    };


  //the browser window that is passed into the library or whatever the user passes in.
  //true allows forgiveness
}(window, true)

);
