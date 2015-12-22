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
        console.log(q, q.query);

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

    			// console.log("DOM is loaded");

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

    //exposing ticker to user through gQ
    gQ.ticker = function(){
      return Ticker.getInstance();
    };

    //allows you to use querySelector or Sizzle or jquery to grab DOM elements
  gQ.ready(function(){
    //check for jquery in scope
    if('jQuery' in scope){
      //create new jquery adapter pasing jquery in
      //context is document
      //create adapter through queryfacade creat by sending in jquery adapter, jquery lib, and the document)
      q = QueryFacade.create(JQueryAdapter,scope.jQuery, doc);
      gQ.start();
    } else if(doc.querySelectorAll && doc.querySelectorAll('body:first-of-type')){
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
    //create methods inside of function to make adapters inaccesible to the outside
    //this allows the methods acces to th eadpater but the user has no access to the adapters

    //expose the dom element
    var dom = function(){
      //returns the context of any adapter
      return adapter.context;
    },

      //mimicking the query functions of the adapters
      query = function(selector, context){
        //return the value returned from the adapter when sending in same information sent in function constructor
        // wrap in new query facade to insure the returned value is a query facade
        return QueryFacade(adapter.query(selector, context));
      },

      //mimicking the text function of the adapters
        text = function (value){
        //returning string
        return adapter.text(value);
        };

    //what is being returned and exposed to user - these are the methods i am exposing
    return {dom: dom, query: query, text:text};
  };

  //method to eliminate the hardcoding of initial construction that assigns jquery native and sizzle
  //insures queryfacade is used from the start
  QueryFacade.create = function(adapter, lib, context){
    //create any new adapter by passing making new adapter.  only possible because all queries have same design.
    return QueryFacade(new adapter(lib, context));
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

  //creation of a javascript timer without allowing any memory leaks
  //anonymous self instatiating function
  //only be able to create one instance of this
  //working with singleton design wihtin javascript
  //singletons can make hard to maintain and manage code
  var Ticker = (function(){
    //this stores the instance of the ticker function
    var instance;
    //this is the creation of an instance method and will hold all the methods that will be exposed
    function create(){
      //static index variable to help with name and counting
          //create an id for each interval
      var intervalID,
          //how much time has passed since last interval
          currentInterval=0,
          maxInterval=0,
          index = 0,
          //how often does the interval run
          sensitivity = 100,
          //create a dictionary of methods
          methods = {},
          //api object that holds what is returned from ticker
          api;

      //public methods
      function add(interval, times, callback, name){
        //local variable that stores that gives the interval based on the sensitivity
        var realInterval = interval - interval%sensitivity;
        //what is the largest interval that can exist
        maxInterval = Math.max(realInterval, maxInterval);

        name = name || (++index);
        //what if name already exists?
        //check if realInterval exists in methods dictionary and if not define it
        if(!methods[realInterval]){
                                  methods[realInterval] = {};
                                }
          //reference object to contain info passed in
          methods[realInterval][name] = {times: times,
                                    callback: callback,
                                    //added in case we make it so user can change sensitivity and to keep a reference to original entry
                                    interval: interval};
          start();
      };
      //private methods
      function start(){
        //if intervalID does not exist set setintervalID into it.
        //setinterval uses runInterval function and sensitivity
        if(!intervalID){
          intervalID = setInterval(runInterval, sensitivity);
        }
      };

      function runInterval(){

        api.dispatchEvent({type:'pretick',target:api});

        //get rid of any number larger than the max amount
        currentInterval = currentInterval%maxInterval;
        //increase current interval by the sensitivity value creating refernec to where we ar in time
        currentInterval += sensitivity;

        //test all intervals in methods object based on current time to see which need to run
        for(var interval in methods){
          //if there is no remainder when you take current time and divide it by the interval time then it means this is the time to call element
          if(currentInterval%interval==0){
            //function to process all the intervals within the methods object
            processIntervalGroup(methods[interval]);
          }
        }
        api.dispatchEvent({type:'tick', target: api});

      };

      //pass in group of methods to run
      function processIntervalGroup(group){
        //local variable to hold group[name]
        var item;
        //loop through each element in the group
        for(var name in group){
          item = group[name];

          //run callback
          item.callback();

          //check how many times this needs to be run
          //if the times = 0 then remove from the group
          if(item.times==0){
            delete group[name];

          //else we reduce the number of times this needs to be run.
          }else{
            --item.times;
          }
        }
      };


      //api object that holds what is returned from ticker
      api = {add:add};
      //wrap returned object in an event dispatcher
      EventDispatcher(api);

      // this is the methods that will be return and expposed to the user
      return api;
    }

    //ticker returns getinstance which, if no instance exist will create and instance or return the one already created
    return {getInstance:function(){
      //if no instance then create one
      if(!instance){instance = create();};
      //return instance created
      return instance;
    }}
  }());

  //a function that will accept an object
  function EventDispatcher(o){
    //private variable that stores all the different events
    var list = {};
    //
    //funtion that take in the type and a listener[or function] (similar to call back except can accept list)
    //type is string the user sends in  like a click, tick
    o.addEvent = function(type, listener){
      //does type exist in the list object, if not then create array type in list object
      if(!list[type]){
        list[type] = [];
      }
      //check to see if listener already exists, if the listener does not exist then it will return -1
      if(list[type].indexOf(listener) == -1){
        //if listener does not exist then push the item into element
        list[type].push(listener);
      }
    }

    //function to remove events
    o.removeEvent = function(type, listener){
      //shortcut for name
      var lt = list[type],
          index;

      //if type exists then find index of it in the list array
      if(lt){
        index = lt.indexOf(listener);

        //if index is greater than -1 then take the index out of the array
        if(index>-1){
          lt.splice(index, 1);
        }
      }
    };


    //enables you to broadcast that the event has just happened
    //send in event object
    o.dispatchEvent = function(e){
      //check to see if we have thet e.type which is th etype that has been run
      var a = list[e.type];
      //if the array is returned with a value
      if(a){
        //if no target exists then set target as object that is dispatch the event
        if(!e.target) {
          e.target = this;
        };
        //now loop through all the items and exceute the function
        for(var index in a){
          a[index].call(e.target, e);
        };
      };
    }
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
