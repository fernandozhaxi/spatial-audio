export function debounce(fn, wait) {
  let callback = fn;
  let timerId = null;

  function debounced() {
    let context = this;
    let args = arguments;
    clearTimeout(timerId);
    timerId = setTimeout(function () {
      callback.apply(context, args);
    }, wait);
  }

  return debounced;
}

export function throttle(fn, wait) {
  let callback = fn;
  let timerId = null;
  let firstInvoke = true;
  function throttled() {
    let context = this;
    let args = arguments;
    if (firstInvoke) {
      callback.apply(context, args);
      firstInvoke = false;
      return;
    }
    if (timerId) {
      return;
    }
    timerId = setTimeout(function () {
      clearTimeout(timerId);
      timerId = null;

      callback.apply(context, args);
    }, wait);
  }
  return throttled;
}

export const getAudioContext = () => {
  const audioContext = window.AudioContext || window.webkitAudioContext;
  var ctx = new audioContext();
  if (ctx === undefined) {
    throw new Error("AudioContext is not supported. :(");
  }
  return ctx;
};
