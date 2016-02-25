var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
    port = process.argv[2] || 8888;

http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), "/public", uri);
  console.log("Request URI: \t" + uri);

  var contentTypesByExtension = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js':   "text/javascript",
    '.json': "application/json"
  };

  fs.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      console.log("Not Found File: \t" + filename);
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += 'index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      var headers = {};
      var contentType = contentTypesByExtension[path.extname(filename)];
      if (contentType) headers["Content-Type"] = contentType;
      response.writeHead(200, headers);
      response.write(file, "binary");
      console.log("Response File: \t" + filename.replace(/\\/g, "/"));
      response.end();
    });
  });
}).listen(parseInt(port, 10));

console.log("Content server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");