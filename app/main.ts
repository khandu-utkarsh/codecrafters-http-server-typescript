import * as net from "net";
import * as fs from 'fs';
import { gzipSync } from "zlib";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const handleServerCommunication = (socket : net.Socket) => {
  socket.on('data', function (req) {
    const httpReqData = req.toString();
    const allLines = httpReqData.split('\r\n');    
    const requestStatusLine = allLines[0];

    console.log(allLines);

    let headersObj: { [key: string]: string } = {};      
    let requestBody = "";
    for (let i = 1; i < allLines.length; i++) {
      const hv = allLines[i].split(':', 2);
      console.log(hv);
      if(hv.length === 2)
      {
        headersObj[hv[0]] = hv[1].slice(1);      
      }
  }
  if(allLines[allLines.length - 2] == "")
  {
    requestBody = allLines[allLines.length - 1];
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
      socket.write(responseStatusLine);
    }
    else
    {
      const subPaths = statusContent[1].split('/', 3);
      console.log('printing subpaths:')
      console.log(subPaths)
      if(subPaths[1] === 'echo')
      {
        if('Accept-Encoding' in headersObj && headersObj['Accept-Encoding'] === "gzip")
        {
          const zippedContent = gzipSync(subPaths[2]);         
          responseStatusLine = `HTTP/1.1 200 OK\r\nContent-Encoding: gzip\r\nContent-Type: text/plain\r\nContent-Length: ${subPaths[2].length}\r\n\r\n${zippedContent}`;
          socket.write(responseStatusLine);
        }
        else
        {
          //!Generate the response.
          responseStatusLine = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Type: text/plain\r\nContent-Length: ${subPaths[2].length}\r\n\r\n${subPaths[2]}`;
          socket.write(responseStatusLine);       
        }
      }
      else if(subPaths[1] === 'user-agent')
      {
        const userAgentRes = headersObj['User-Agent'];
        responseStatusLine = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Type: text/plain\r\nContent-Length: ${userAgentRes.length}\r\n\r\n${userAgentRes}`;
        socket.write(responseStatusLine);       
        //console.log(responseStatusLine);
      }
      else if(subPaths[1] === 'files')
      {
        const filePath = process.argv[3] + subPaths[2]; //!Absolute paths;
        //console.log(process.argv[2]);

        console.log(`File path it is checking is: ${filePath}`);
        const fileContent = fs.readFile(filePath, (readErr, fileContent) => {
        if(readErr)
        {
          responseStatusLine = "HTTP/1.1 404 Not Found\r\n\r\n";
          socket.write(responseStatusLine);       
        }
        else{
          responseStatusLine = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n${fileContent}`;
          socket.write(responseStatusLine);       
        }

        });
      }
      else
      {
        responseStatusLine = "HTTP/1.1 404 Not Found\r\n\r\n";
        socket.write(responseStatusLine);       
      }
    }
  }
  else if(statusContent[0] === 'POST')
  {
    const subPaths = statusContent[1].split('/', 3);
    console.log('printing subpaths 1:')
    console.log(subPaths)
    const filePath = process.argv[3] + subPaths[2]; //!Absolute paths;
    //console.log(process.argv[2]);




    console.log(`File path it is checking is: ${filePath}`);
    const fileContent = fs.writeFile(filePath, requestBody, (err) => {});
    responseStatusLine = `HTTP/1.1 201 Created\r\n\r\n`;
    socket.write(responseStatusLine);       
  }



  });

  socket.on("close", function () {
      socket.end();
  });
}






// Uncomment this to pass the first stage
const server = net.createServer(handleServerCommunication);

server.listen(4221, "localhost");


//!Check if data is of string type. If yes, then basically do the needful
