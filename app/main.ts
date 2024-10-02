import * as net from "net";
import * as fs from 'fs';

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const handleServerCommunication = (socket : net.Socket) => {
  socket.on('data', function (req) {
    const httpReqData = req.toString();
    const allLines = httpReqData.split('\r\n');    
    const requestStatusLine = allLines[0];

    let headersObj: { [key: string]: string } = {};      
    let prevRN = false;
    for (let i = 1; i < allLines.length; i++) {
      if(allLines[i] === '')
      {
        if(prevRN) break;
        prevRN = true;
        continue;
      }
      prevRN = false;
      const hv = allLines[i].split(':', 2);
      headersObj[hv[0]] = hv[1].slice(1);      
  }
  let requestBody : string = ""; 
  if(allLines[-1] !== "")
  {
    requestBody = allLines[-1]; //!Check if I will need clone method or not.
  }

  //!For debugging
  // console.log('new');
  // console.log(requestStatusLine);
  // console.log('new');
  // console.log(headersObj);
  // console.log('new');
  // console.log(requestBody);
  // console.log('end');

  const statusContent = requestStatusLine.split(' ');
  let responseStatusLine: string = '';
  if(statusContent[0] === 'GET' && statusContent[2] === 'HTTP/1.1')
  {
    const reqAdd = statusContent[1];
    if(reqAdd === '/') //!Asking for the root:
    {
      responseStatusLine = "HTTP/1.1 200 OK\r\n\r\n";
    }
    else
    {
      const subPaths = statusContent[1].split('/', 3);
      console.log('printing subpaths:')
      console.log(subPaths)
      if(subPaths[1] === 'echo')
      {
        //!Generate the response.
        responseStatusLine = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Type: text/plain\r\nContent-Length: ${subPaths[2].length}\r\n\r\n${subPaths[2]}`;
      }
      else if(subPaths[1] === 'user-agent')
      {
        const userAgentRes = headersObj['User-Agent'];
        responseStatusLine = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Type: text/plain\r\nContent-Length: ${userAgentRes.length}\r\n\r\n${userAgentRes}`;
        //console.log(responseStatusLine);
      }
      else if(subPaths[1] === 'files')
      {
        const filePath = '/' + subPaths[2]; //!Absolute paths;
        const fileContent = fs.readFileSync(filePath);
        responseStatusLine = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n${fileContent}`;
      }
      else
      {
        responseStatusLine = "HTTP/1.1 404 Not Found\r\n\r\n";
      }
    }
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
