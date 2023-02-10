
export default class Track {
  constructor(instrument) {
  this.name = instrument.name;
  this.url = instrument.url;
  this.startTime = instrument.startTime;
  this.endTime = instrument.endTime;
  this.decodedBuffer;
  this.volume = 1;
  this.sampleNode;
  this.volumeNode;
  }
}