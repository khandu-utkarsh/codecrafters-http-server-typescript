import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const handleServerCommunication = (socket : net.Socket) => {
  socket.on('data', function (req) {
    const req_str = req.toString();
    console.log(req_str);
    const arrays = req_str.split(' ');
    let responseStatusLine;
    if(arrays[1].length === 1 && arrays[1] === '/')
    {
      responseStatusLine = "HTTP/1.1 200 OK\r\n\r\n";

    }
    else
    {
      responseStatusLine = "HTTP/1.1 404 Not Found\r\n\r\n";
    }
    socket.write(responseStatusLine);       
  });

  socket.on("close", function () {
      socket.end();
  });
}






// Uncomment this to pass the first stage
const server = net.createServer(handleServerCommunication);

server.listen(4221, "localhost");


//!Check if data is of string type. If yes, then basically do the needful
