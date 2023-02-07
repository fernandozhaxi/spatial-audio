<template>
  <main role="main" class="container">
    <div id="demo-div">
      <p style="margin-top: 1rem">
        Num. of datapoints:
        <span>
          {{ eventCount }}
        </span>
      </p>
      <h4 style="margin-top: 0.75rem">Orientation</h4>
      <ul>
        <li>
          X-axis (&beta;): <span id="Orientation_b">{{ Orientation_b }}</span
          ><span>&deg;</span>
        </li>
        <li>
          Y-axis (&gamma;): <span id="Orientation_g">{{ Orientation_g }}</span
          ><span>&deg;</span>
        </li>
        <li>
          Z-axis (&alpha;): <span id="Orientation_a">{{ Orientation_a }}</span
          ><span>&deg;</span>
        </li>
      </ul>
      <h4>Accelerometer</h4>
      <ul>
        <li>
          X-axis: <span id="Accelerometer_x">{{ Accelerometer_x }}</span
          ><span> m/s<sup>2</sup></span>
        </li>
        <li>
          Y-axis: <span id="Accelerometer_y">{{ Accelerometer_y }}</span
          ><span> m/s<sup>2</sup></span>
        </li>
        <li>
          Z-axis: <span id="Accelerometer_z">{{ Accelerometer_z }}</span
          ><span> m/s<sup>2</sup></span>
        </li>
        <li>
          Data Interval: <span id="Accelerometer_i">{{ Accelerometer_i }}</span
          ><span> ms</span>
        </li>
      </ul>
      <h4>Accelerometer including gravity</h4>
      <ul>
        <li>
          X-axis: <span id="Accelerometer_gx">{{ Accelerometer_gx }}</span
          ><span> m/s<sup>2</sup></span>
        </li>
        <li>
          Y-axis: <span id="Accelerometer_gy">{{ Accelerometer_gy }}</span
          ><span> m/s<sup>2</sup></span>
        </li>
        <li>
          Z-axis: <span id="Accelerometer_gz">{{ Accelerometer_gz }}</span
          ><span> m/s<sup>2</sup></span>
        </li>
      </ul>
      <h4>Gyroscope</h4>
      <ul>
        <li>
          X-axis: <span id="Gyroscope_x">{{ Gyroscope_x }}</span
          ><span>&deg;/s</span>
        </li>
        <li>
          Y-axis: <span id="Gyroscope_y">{{ Gyroscope_y }}</span
          ><span>&deg;/s</span>
        </li>
        <li>
          Z-axis: <span id="Gyroscope_z">{{ Gyroscope_z }}</span
          ><span>&deg;/s</span>
        </li>
      </ul>
    </div>
    <button
      id="start_demo"
      class="btn"
      href="#"
      role="button"
      @click="start"
    >
      {{ startText }}
    </button>
  </main>
</template>
<script setup>
import axios from "axios";
import { reactive, toRefs } from "vue";
import { debounce } from "@/utils/common";
import { getAudioContext } from "@/utils/common";
import Song from "./song.js";
import BufferLoader from "./buffer-loader.js";
const state = reactive({
  eventCount: 0,
  Orientation_a: 0,
  Orientation_b: 0,
  Orientation_g: 0,
  Accelerometer_gx: 0,
  Accelerometer_gy: 0,
  Accelerometer_gz: 0,
  Accelerometer_x: 0,
  Accelerometer_y: 0,
  Accelerometer_z: 0,
  Accelerometer_i: 0,
  Gyroscope_z: 0,
  Gyroscope_x: 0,
  Gyroscope_y: 0,
  isRunning: false,
  startText: "Start",
});

let context = getAudioContext();
window.dd = context
let currentSong;


const  handleOrientation = (event) => {
  updateFieldIfNotNull("Orientation_a", event.alpha);
  updateFieldIfNotNull("Orientation_b", event.beta);
  updateFieldIfNotNull("Orientation_g", event.gamma);
  incrementEventCount();
  sendRequest();
}

const updateFieldIfNotNull = (key, value, precision = 10) => {
  if (value) state[key] = value.toFixed(precision);
};

const handleMotion = (event) => {
  updateFieldIfNotNull(
    "Accelerometer_gx",
    event.accelerationIncludingGravity.x
  );
  updateFieldIfNotNull(
    "Accelerometer_gy",
    event.accelerationIncludingGravity.y
  );
  updateFieldIfNotNull(
    "Accelerometer_gz",
    event.accelerationIncludingGravity.z
  );
  updateFieldIfNotNull("Accelerometer_x", event.acceleration.x);
  updateFieldIfNotNull("Accelerometer_y", event.acceleration.y);
  updateFieldIfNotNull("Accelerometer_z", event.acceleration.z);
  updateFieldIfNotNull("Accelerometer_i", event.interval, 2);
  updateFieldIfNotNull("Gyroscope_z", event.rotationRate.alpha);
  updateFieldIfNotNull("Gyroscope_x", event.rotationRate.beta);
  updateFieldIfNotNull("Gyroscope_y", event.rotationRate.gamma);
  incrementEventCount();
  sendRequest();
};
let timer
const start = (e) => {
  e.preventDefault();
  // Request permission for iOS 13+ devices
  if (
    window.DeviceMotionEvent &&
    typeof window.DeviceMotionEvent.requestPermission === "function"
  ) {
    window.DeviceMotionEvent.requestPermission();
  }
  if (state.isRunning) {
    window.removeEventListener("devicemotion", handleMotion);
    window.removeEventListener("deviceorientation", handleOrientation);
    state.startText = "Start";
    state.isRunning = false;
    currentSong?.stop()
    clearInterval(timer)
  } else {
    console.log('开始监听');
    window.addEventListener("devicemotion", handleMotion);
    window.addEventListener("deviceorientation", handleOrientation);
    state.startText = "Stop";
    state.isRunning = true;
    timer = setInterval(() => {
      state.Accelerometer_x += 1
      state.Accelerometer_gx += 1
      state.Orientation_a += 1
      state.Gyroscope_z += 1
      sendRequest()
    }, 8000)
  }
};


function incrementEventCount() {
  state.eventCount++;
}



const sendRequest = debounce(() => {
  console.log('发送请求');
  axios.post("/api/getInfo").then((res) => {
    const songInfo = res.data;
    loadSong(songInfo);
  });
}, 500);
let startTime, endTime
const loadSong = (song) => {
  resetAllBeforeLoadingANewSong();
  // This function builds the current
  // song and resets all states to default, volumes set to 1, start at 0 second, etc.)
  currentSong = new Song(context, song.songName);
  startTime = song.startTime
  endTime = song.endTime
  song.tracks.forEach((track) => {
    currentSong.addTrack(track);
  });
  // Loads all track for the currentSong
  loadAllSoundTracks();
};

const resetAllBeforeLoadingANewSong = () => {
  stopAllTracks();
};

function pauseAllTracks() {
  currentSong.pause();
  lastTime = context.currentTime;
}

const stopAllTracks = () => {
  if (!currentSong) return;
  // Stop the song
  currentSong.stop();
  // reset the elapsed time
  currentSong.elapsedTimeSinceStart = 0;
};

const finishedLoading = (bufferList) => {
  currentSong.setDecodedAudioBuffers(bufferList);
  currentSong.play(startTime, endTime);
};

var bufferLoader;
const loadAllSoundTracks = () => {
  bufferLoader = new BufferLoader(
    context,
    currentSong.getUrlsOfTracks(),
    finishedLoading
  );
  bufferLoader.load();
};

const {
  eventCount,
  startText,
  Orientation_a,
  Orientation_b,
  Orientation_g,
  Accelerometer_gx,
  Accelerometer_gy,
  Accelerometer_gz,
  Accelerometer_x,
  Accelerometer_y,
  Accelerometer_z,
  Accelerometer_i,
  Gyroscope_z,
  Gyroscope_x,
  Gyroscope_y,
} = toRefs(state);
</script>

<style scoped>
.btn {
    background-color: white;
    color: #008CBA;
    cursor: pointer;
    height: 30px;
    width: 100%;
}

.btn:hover {
    background-color: #008CBA;
    color: white;
}
#demo-div {
  color: lightgrey;
  border-radius: 0.3rem;
}

#demo-div span,
#demo-div #num-observed-events {
  color: black;
}

h1 {
  margin-top: 0.5rem;
}

h4 {
  margin-top: 0.66rem;
  font-size: 1.33rem;
}

#demo-div li {
  line-height: 21px;
}

#demo-div ul {
  margin-bottom: 0.66rem;
}
</style>
