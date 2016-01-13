//Lets require/import the HTTP module
var http = require('http');
var parser = require('../intents/parse_intent.js');
var util = require('util');
var url = require('url')

//Lets define a port we want to listen to
const PORT=8080; 

//We need a function which handles requests and send response
function handleRequest(request, response){
    //response.end(JSON.stringify(url.parse(request.url, true)));
    response.end(JSON.stringify(parser.get_full_request("should i take an umbrella in torquay?")));
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});