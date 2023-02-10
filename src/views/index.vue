<template>
  <main role="main" class="container">
    <Sensor @change="sensorChange" />
  </main>
</template>
<script setup>
import axios from "axios";
import { reactive } from "vue";
import { getAudioContext } from "@/utils/common";
import BufferLoader from "./buffer-loader.js";
import Track from "./track.js";
import Sensor from "./Sensor/Sensor.vue";

console.log(Track);
const sensorChange = (params) => {
  if (params) {
    sendRequest(params);
  } else {
    stopAllTracks()
  }
};

let context = getAudioContext();
let lastTime
const sendRequest = (params) => {
  const now = new Date().getTime()
  if (now - lastTime < 3000) return
  axios.post("/api/getInfo", params).then((res) => {
    const list = res.data
    if (list.length) {
      loadAllTracks(res.data);
      lastTime = new Date().getTime()
    }
  });
};

const state = reactive({
  tracks: [],
  sampleNodes: [],
  trackVolumeNodes: [],
  analyserNode: null,
});


const loadAllTracks = (tracks) => {
  stopAllTracks()
  const trackList = [];
  tracks.forEach((track) => {
    trackList.push(new Track(track));
  });
  state.tracks = trackList;
  loadTrackSound(trackList);
};

const finishedLoading = (bufferList) => {
  bufferList.forEach((item, index) => {
    state.tracks[index].decodedBuffer = item;
  });
  state.analyserNode = context.createAnalyser();
  var sources = [];
  for (var i = 0; i < state.tracks.length; i++) {
    // each sound sample is the  source of a graph
    sources[i] = context.createBufferSource();
    sources[i].buffer = state.tracks[i].decodedBuffer;
    // connect each sound sample to a volume node
    state.trackVolumeNodes[i] = context.createGain();
    state.trackVolumeNodes[i].gain.value = state.tracks[i].volume;
    // Connect the sound sample to its volume node
    sources[i].connect(state.trackVolumeNodes[i]);
    // Connects all track volume nodes a single master volume node
    state.trackVolumeNodes[i].connect(state.analyserNode);
  }
  // connect the analyzer to the speakers
  state.analyserNode.connect(context.destination);
  sources.forEach((node, index) => {
    // First parameter is the delay before playing the sample
    // second one is the offset in the song, in seconds, can be 2.3456
    const track = state.tracks[index]
    const VolumeNodes = state.trackVolumeNodes[index]
    startTask(track, node, VolumeNodes)
  });
  state.sampleNodes = sources;
};

const startTask = (track, node, vNode) => {
  vNode.gain.value = track.volume
  node.start(0, track.startTime);
  const start = track.startTime
  const end = track.endTime
  const offsetTime = end - start
  setTimeout(() => {
    node.stop()
  }, offsetTime * 1000)
}

var bufferLoader;
const loadTrackSound = (list) => {
  bufferLoader = new BufferLoader(context, list, finishedLoading);
  bufferLoader.load();
};

const stopAllTracks = () => {
  state.sampleNodes.forEach((node) => {
    node.stop();
  });
  state.sampleNodes = [];
};
</script>

<style scoped></style>
