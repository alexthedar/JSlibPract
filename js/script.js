console.log(gQ.version());

gQ.start = function(){
//test for text
gQ('#msg').text('change my copy');

//test for ticker
var ticker = gQ.ticker();
ticker.add(100,4,function(){
  console.log('im called 4 times at 100 ms');
});
ticker.add(500,2,function(){
  console.log('im called 2 times at 500 ms');
});
ticker.add(1000,3,function(){
  console.log('im called 3 times at 1000 ms');
});

}
