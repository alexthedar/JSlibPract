//anonymous function that executes automatically
( //wrap anonymous function in parathesis so that you do not have to assign it to a variable and con
  //scope = the browser window or what is passed into the library
  //isForgiving = adds the possibility of overiding the error in order to load more than once
  function(scope, isForgiving){

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

    //checks if the library exists and if not creates it and does version control.
    if(!window.gQ){
      window.gQ = gQ;
    } else {
      //asks if can allow duplicate instances and checks to make sure that gQ is not a user defined variable
      if(isForgiving && window,gQ.version){
        //checks if the duplicate library version is larger than the current library version
        //if it is larger than sets window.gQ by itself else sets window.gQ as the new larger version gQ
        window.gQ = window.gQ.version()>version ? window.gQ : gQ;
      } else {
      //make sure it is only instantiated once or if variable already defined
      //throw error if loaded more than once
        throw new Error("The variable window.gQ already exists.")
      }
    }
  //the browser window that is passed into the library or whatever the user passes in.
  //allows forgiveness
}(window, true)

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
