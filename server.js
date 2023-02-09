// Developed by Michel Buffa

const fs = require("fs");
// We need to use the express framework: have a real web server that knows how to send mime types etc.
const express = require("express");
const path = require("path");
var http = require('http');
var https = require('https');

var privateKey  = fs.readFileSync('./private.pem', 'utf8');
var certificate = fs.readFileSync('./file.crt', 'utf8');
var credentials = { key: privateKey, cert: certificate };

// Init globals variables for each module required
const app = express()
// Config
app.use(express.json())
app.use(express.static(path.resolve(__dirname, "client")));

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
// launch the http server
const PORT = 9998
const SSLPORT = 9999
httpServer.listen(PORT, function() {
  console.log('HTTP Server is running on: http://localhost:%s', PORT);
});
httpsServer.listen(SSLPORT, function() {
  console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});

app.get("/", (req, res) => res.sendfile(__dirname + "/client/index.html"));

// TODO dynamic calculation
app.post("/api/getInfo", async (req, res) => {
  const params = req.body
  console.log('params:', params);
  const soneName = 'Hells_Bells'
  const fileNames = await getFiles(`./client/multitrack/${soneName}`);
  res.writeHead(200, { "Content-Type": "application/json" });
  const tracks = fileNames
    .filter(fileName => isASoundFile(fileName))
    .map((fileName, index) => {
      return {
        name: fileName.match(/(.*)\.[^.]+$/, "")[1],
        sound: fileName,
        url: 'multitrack' +`/${soneName}/${fileName}`,
        volume: 1,
        startTime: 0, // s
        endTime: 1// s
      }
    })
  res.write(JSON.stringify(tracks));
  res.end();
});

const endsWith = (str, suffix) => str.indexOf(suffix, str.length - suffix.length) !== -1;

isASoundFile = fileName => {
  if (endsWith(fileName, ".mp3")) return true;
  if (endsWith(fileName, ".ogg")) return true;
  if (endsWith(fileName, ".wav")) return true;
  if (endsWith(fileName, ".m4a")) return true;
  return false;
};

const getFiles = async dirName =>
  new Promise((resolve, reject) =>
    fs.readdir(dirName, function(error, directoryObject) {
      if (error) {
        reject(error);
      }
      if (directoryObject !== undefined) {
        directoryObject.sort();
      }
      resolve(directoryObject);
    })
  );