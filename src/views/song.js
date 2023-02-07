function Track(songName, instrument) {
    // name of the track : bass, guitar, voice, etc.
    this.name = instrument.name;
    // url of the track in the form http://.../track/track_name
    this.url = instrument.url
    // decoded audio buffer
    this.decodedBuffer;
    // current volume
    this.volume = 1;
    // current left/right panning
    this.panning;
    // muted / non muted state
    this.muted = false;
    // solo mode ?
    this.solo = false;
    // the web audio nodes that compose this track
    this.sampleNode;
    // volume for this track
    this.volumeNode;
  }

export default function Song(context,songName) {
  // the web audio context
  var audioContext = context;
  // name of the song
  this.name = songName;
  // list of tracks in that song
  this.tracks = [];
  // master volume of this song
  this.volume = 1;
  // elapsed time (since beginning, in seconds (float))
  this.elapsedTimeSinceStart;
  // end time (since ending, in seconds (float))
  this.playEndTime;

  // song is paused ?
  this.paused = true;

  // song is muted ?
  this.muted = false;
  this.timer
  this.time = 0

  // The web audio graph nodes
  // Master volume
  this.masterVolumeNode = context.createGain();
  this.trackVolumeNodes = [];
  this.analyserNode = context.createAnalyser();
  var recIndex = 0; // for generating name of exorted mix

  // Origin of the web audio graph, useful for start/stop/pause
  this.sampleNodes = [];

  this.addTrack = function (instrument) {
      this.tracks.push(new Track(this.name, instrument));
  };

  // Build the web audio graph
  this.buildGraph = function () {
      var sources = [];
      for (var i = 0; i < this.tracks.length; i++) {
          // each sound sample is the  source of a graph
          sources[i] = context.createBufferSource();
          sources[i].buffer = this.tracks[i].decodedBuffer

          // connect each sound sample to a volume node
          this.trackVolumeNodes[i] = context.createGain();
          // set the volume to 0 or 1 depending on the mute/solo buttons
          if (this.tracks[i].muted) {
              // The track's volume is zero
              this.trackVolumeNodes[i].gain.value = 0;
          } else {
              this.trackVolumeNodes[i].gain.value = this.tracks[i].volume;
          }
          // Connect the sound sample to its volume node
          sources[i].connect(this.trackVolumeNodes[i]);

          // Connects all track volume nodes a single master volume node
          this.trackVolumeNodes[i].connect(this.masterVolumeNode);

          // Connect the master volume to an analyzer
          this.masterVolumeNode.connect(this.analyserNode);
          // connect the analyzer to the speakers
          this.analyserNode.connect(context.destination);
      }
      // samples = the sound samples, it is necessary to store them in a
      // variable in order to be able so start/stop/pause the song
      this.sampleNodes = sources;
  };

  this.play = function (startTime, endTime) {
    console.log(startTime, endTime);
      this.buildGraph();
      this.elapsedTimeSinceStart = startTime;
      this.playEndTime = endTime;
      this.sampleNodes.forEach(function (s) {
          // First parameter is the delay before playing the sample
          // second one is the offset in the song, in seconds, can be 2.3456
          // very high precision !
          s.start(0, startTime);
      });
      this.paused = false;
      const delta = endTime - startTime
      this.timer = setInterval(() => {
        this.time += 50
        console.log(this.time);
        if (this.time / 1000 > delta) {
            this.stop()
            this.time = 0
        }
      }, 50)
  };

  this.stop = function () {
      if (this.paused) return;
      this.sampleNodes.forEach(function (s) {
          s.stop(0);
      });
      this.sampleNodes = []
      this.paused = true;
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
  };

  this.pause = function () {
      if (!this.paused) {
          // if we were not paused, then we stop
          this.stop();
      } else {
          // else we start again from the previous position
          this.play(this.elapsedTimeSinceStart);
      }
  };

  this.setVolume = function (value) {
      this.volume = value;
      this.masterVolumeNode.gain.value = value;
  };

  this.setVolumeOfTrack = function (value, trackNumber) {
      if (this.trackVolumeNodes[trackNumber] !== undefined) {
          this.trackVolumeNodes[trackNumber].gain.value = value;
          this.tracks[trackNumber].volume = value;
      }
  };

  // load all sound samples asyncrhonously
  this.getUrlsOfTracks = function () {
      // the buffer loader class requires an array of urls, let's build
      // this array from all tracks' urls
      var urls = [];
      this.tracks.forEach(function (track) {
          urls.push(track.url);
      });
      return urls;
  };

  this.getDuration = function () {
    const firstTrack = this.tracks[0]
    return firstTrack ? firstTrack.decodedBuffer.duration : undefined;
  };

  this.getNbTracks = function () {
      return this.tracks.length;
  };

  this.setDecodedAudioBuffers = function (buffers) {
      for (var i = 0; i < this.tracks.length; i++) {
          this.tracks[i].decodedBuffer = buffers[i];
      }
  };

  this.toggleMute = function () {
      this.muted = !this.muted;
      if (this.muted) {
          this.masterVolumeNode.gain.value = 0;
      } else {
          // restore volume
          this.masterVolumeNode.gain.value = this.volume;
      }
  };

  this.togglePause = function () {
      this.paused = !this.paused;
  };
}