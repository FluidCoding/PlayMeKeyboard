var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()
var port = process.env.PORT || 5000

app.use(express.static(__dirname + "/"))

var server = http.createServer(app)
server.listen(port)
var clients = [];
console.log("http server listening on %d", port)

var wss = new WebSocketServer({server: server})
console.log("websocket server created")

wss.on("connection", function(ws) {
  clients.push(ws);
/*  var id = setInterval(function() {
    ws.send(JSON.stringify("Hello USER"))
  }, 1000)
*/
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    for(var i =0; i<clients.length;i++)
    try{
      clients[i].send(JSON.stringify(message));
    }catch(e){}
  });



  console.log("websocket connection open")

  ws.on("close", function() {
    console.log("websocket connection close")

  })
})

function encMsg(str, key){
  var c = '';
  for(i=0; i<str.length; i++) {
    c += String.fromCharCode(str[i].charCodeAt(0).toString(10) ^ key.charCodeAt(0).toString(10)); // XORing with letter 'K'
  }
  return c;
}
