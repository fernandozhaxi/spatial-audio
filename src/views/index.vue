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
import * as Tone from 'tone'

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
    // 为每个音频创建一个节点，代表输入源
    sources[i] = context.createBufferSource();
    sources[i].buffer = state.tracks[i].decodedBuffer;
    // 创建处理节点，用于控制音频振幅
    state.trackVolumeNodes[i] = context.createGain();
    state.trackVolumeNodes[i].gain.value = state.tracks[i].volume;
    // 输入源节点通过 connect 方法将音频数据传输给处理节点
    sources[i].connect(state.trackVolumeNodes[i]);
    // Connects all track volume nodes a single master volume node
    state.trackVolumeNodes[i].connect(state.analyserNode);
  }
  // 处理节点通过 connect 方法将处理后的音频数据输出给输出节点进行效果输出
  // destination 为当前使用的扬声器
  state.analyserNode.connect(context.destination);

  // 为 listener 设置 position
  const listener = audioCtx.listener;
  // listener.positionX = camera.position.x;
  // listener.positionY = camera.position.y;
  // listener.positionZ = camera.position.z;

  // 开始播放
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
  const synth = new Tone.Synth().toDestination();
  synth.triggerAttackRelease("C4", "8n");
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
