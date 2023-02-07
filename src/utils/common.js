export function debounce(fn, wait) {
  var timer = null;
  return function () {
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, wait);
  };
}

export const getAudioContext = () => {
  const audioContext = window.AudioContext || window.webkitAudioContext;
  var ctx = new audioContext();
  if (ctx === undefined) {
    throw new Error('AudioContext is not supported. :(');
  }
  return ctx;
}
