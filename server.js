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
const app = express(),
  http = require("http"),
  server = http.createServer(app);

// Config
const TRACKS_PATH = "./client/multitrack"
app.use(express.json())
app.use(express.static(path.resolve(__dirname, "client")));
// launch the http server on given port
server.listen(9999, "172.16.8.66", () => {
  const addr = server.address();
  console.log("server listening at", addr.address + ":" + addr.port);
});

app.get("/", (req, res) => res.sendfile(__dirname + "/client/index.html"));

// TODO dynamic calculation
app.post("/api/getInfo", async (req, res) => {
  const params = req.body
  console.log('params:', params);
  const soneName = 'Hells_Bells'
  const fileNames = await getFiles(`${TRACKS_PATH}/${soneName}`);
  res.writeHead(200, { "Content-Type": "application/json" });
  const tracks = fileNames
    .filter(fileName => isASoundFile(fileName))
    .map(fileName => ({
      name: fileName.match(/(.*)\.[^.]+$/, "")[1],
      sound: fileName,
      url: 'multitrack' +`/${soneName}/${fileName}`,
      volume: 100,
      startTime: 10, // s
      endTime: 15 // s
    }))
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