const ll = require("lazylines");
process.stdin.resume();
var input = new ll.LineReadStream(process.stdin);

var first = true;

input.on("line", function (line) {
  if (first) {
    first = false;
    return;
  }
  var pair = ll.chomp(line).split(" ");
  var index = +pair[0];
  var word = pair[1];
  console.log(word[index - 1]);
});

//input.on("end", function (){
//		console.log("done");
//});
