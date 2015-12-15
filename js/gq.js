//anonymous function that executes automatically
( //wrap anonymous function in parathesis so that you do not have to assign it to a variable and con
  //scope = the browser window or what is passed into the library
  function(scope){

    //version of application
    var version = 1.0001;

    var gQ = function (selector, context){

    };

    gQ.loadJS = function(){

    };

    //returns the version numebr to outside the function without letting people access the version variable
    gQ.version = function(){
      return version;
    };

    //checks if the library exists and if not creates it.
    if(!window.gQ){
      window.gQ = gQ;
    } else {
      //make sure it is only instantiated once or if variable already defined

    }
  //the browser window that is passed into the library or whatever the user passes in.
  }(window)

);
/*
//namespaces
//com.domainName.libraryName

//does com exist else create empty objetc - this acts like a folder
var com = com || {};
    // does com have object inside else create it (o2Geek is the object)
    com.o2GEEK = com.o2GEEK || {};
*/
/*
can use if(com.o2GEEK.gQ) {
                              com.o2GEEK.gQ = function (selector, context){}
                              com.o2GEEK.gQ,loadJS = function(){}
                            }
this asks if library exists and stops from 2 instations of the library
*/
/*
//this protects your code form others code overwriting it
com.o2GEEK.gQ = function (selector, context){

}

com.o2GEEK.gQ,loadJS = function(){

}
*/
