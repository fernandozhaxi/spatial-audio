// Developed by Michel Buffa

const fs = require("fs");
// We need to use the express framework: have a real web server that knows how to send mime types etc.
const express = require("express");
const path = require("path");

// Init globals variables for each module required
const app = express(),
  http = require("http"),
  server = http.createServer(app);

// Config
const TRACKS_PATH = "./multitrack"
app.use(express.json())
app.use(express.static(path.resolve(__dirname, "public")));
// launch the http server on given port
server.listen(9999, "192.168.31.68", () => {
  const addr = server.address();
  console.log("server listening at", addr.address + ":" + addr.port);
});

app.get("/", (req, res) => res.sendfile(__dirname + "/client/index.html"));

// TODO dynamic calculation
app.post("/api/getInfo", async (req, res) => {
  const params = req
  const soneName = 'Hells_Bells'
  const fileNames = await getFiles(`${TRACKS_PATH}/${soneName}`);
  res.writeHead(200, { "Content-Type": "application/json" });
  const tracks = fileNames
    .filter(fileName => isASoundFile(fileName))
    .map(fileName => ({
      name: fileName.match(/(.*)\.[^.]+$/, "")[1],
      sound: fileName,
      url: TRACKS_PATH +`/${soneName}/${fileName}`,
      volume: 100
    }))
  res.write(JSON.stringify({
    songName: 'Hells_Bells',
    startTime: 107,
    endTime: 110,
    tracks
  }));
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