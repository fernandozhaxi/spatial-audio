<template>
  <div id="demo-div">
      <h4 style="margin-top: 0.75rem">Orientation</h4>
      <ul>
        <li>
          X-axis (&beta;): <span id="Orientation_b">{{ data.Orientation_b }}</span
          ><span>&deg;</span>
        </li>
        <li>
          Y-axis (&gamma;): <span id="Orientation_g">{{ data.Orientation_g }}</span
          ><span>&deg;</span>
        </li>
        <li>
          Z-axis (&alpha;): <span id="Orientation_a">{{ data.Orientation_a }}</span
          ><span>&deg;</span>
        </li>
      </ul>
      <h4>Gyroscope</h4>
      <ul>
        <li>
          X-axis: <span id="Gyroscope_x">{{ data.Gyroscope_x }}</span
          ><span>&deg;/s</span>
        </li>
        <li>
          Y-axis: <span id="Gyroscope_y">{{ data.Gyroscope_y }}</span
          ><span>&deg;/s</span>
        </li>
        <li>
          Z-axis: <span id="Gyroscope_z">{{ data.Gyroscope_z }}</span
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
import { throttle } from '@/utils/common.js'
const state = reactive({
  data: {
    Orientation_a: 0,
    Orientation_b: 0,
    Orientation_g: 0,
    Gyroscope_z: 0,
    Gyroscope_x: 0,
    Gyroscope_y: 0,
  }
});

const isRunning = ref(false)
const startText = ref("Start")

const  handleOrientation = throttle((event) => {
  updateField("Orientation_a", event.alpha);
  updateField("Orientation_b", event.beta);
  updateField("Orientation_g", event.gamma);
  notify()
}, 200)

const updateField = (key, value, precision = 10) => {
  if (value) state.data[key] = value.toFixed(precision);
};

const handleMotion = throttle((event) => {
  updateField("Gyroscope_z", event.rotationRate.alpha);
  updateField("Gyroscope_x", event.rotationRate.beta);
  updateField("Gyroscope_y", event.rotationRate.gamma);
  notify()
}, 200)
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
  } else {
    window.addEventListener("devicemotion", handleMotion);
    window.addEventListener("deviceorientation", handleOrientation);
    startText.value = "Stop";
    isRunning.value = true;
    notify()
  }
};

const notify = throttle(() => {
  emits('change', {
      ...state.data
    })
})

const {
 data
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