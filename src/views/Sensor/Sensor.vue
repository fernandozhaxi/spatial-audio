<template>
  <div id="demo-div">
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
      <button
        id="start_demo"
        class="btn"
        href="#"
        role="button"
        @click="start"
      >
        {{ startText }}
      </button>
    </div>
</template>
<script setup>
import { ref, reactive, toRefs } from "vue";
const state = reactive({
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
});


const isRunning = ref(false)
const startText = ref("Start")

const  handleOrientation = (event) => {
  updateField("Orientation_a", event.alpha);
  updateField("Orientation_b", event.beta);
  updateField("Orientation_g", event.gamma);
  emits('change', {
    ...state
  })
}

const updateField = (key, value, precision = 10) => {
  if (value) state[key] = value.toFixed(precision);
};

const handleMotion = (event) => {
  updateField(
    "Accelerometer_gx",
    event.accelerationIncludingGravity.x
  );
  updateField(
    "Accelerometer_gy",
    event.accelerationIncludingGravity.y
  );
  updateField(
    "Accelerometer_gz",
    event.accelerationIncludingGravity.z
  );
  updateField("Accelerometer_x", event.acceleration.x);
  updateField("Accelerometer_y", event.acceleration.y);
  updateField("Accelerometer_z", event.acceleration.z);
  updateField("Accelerometer_i", event.interval, 2);
  updateField("Gyroscope_z", event.rotationRate.alpha);
  updateField("Gyroscope_x", event.rotationRate.beta);
  updateField("Gyroscope_y", event.rotationRate.gamma);
  emits('change', {
    ...state
  })
};
const emits = defineEmits(['change'])
const start = (e) => {
  e.preventDefault();
  // Request permission for iOS 13+ devices
  if (
    window.DeviceMotionEvent &&
    typeof window.DeviceMotionEvent.requestPermission === "function"
  ) {
    window.DeviceMotionEvent.requestPermission();
  }
  if (isRunning.value) {
    window.removeEventListener("devicemotion", handleMotion);
    window.removeEventListener("deviceorientation", handleOrientation);
    startText.value = "Start";
    isRunning.value = false;
    emits('change', null)
  } else {
    window.addEventListener("devicemotion", handleMotion);
    window.addEventListener("deviceorientation", handleOrientation);
    startText.value = "Stop";
    isRunning.value = true;
    emits('change', {
      ...state
    })
  }
};



const {
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