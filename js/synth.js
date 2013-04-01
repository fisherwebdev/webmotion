//////////// synth //////////////


var Synth = function () {

  var scales = this.scales = {
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    ionic: [0, 2, 4, 5, 7, 9, 11, 12],
    dorian: [0, 2, 3, 5, 7, 9, 10, 12],
    mixolydian: [0, 2, 4, 5, 7, 9, 10, 12],
    aeolian: [0, 2, 3, 5, 7, 8, 10, 12],
    majorPentatonic: [0, 2, 4, 7, 9, 12],
    minorPentatonic: [0, 3, 5, 7, 10, 12]
  }
  var scale = this.scale = this.getScale(scales.minorPentatonic);

  var context = this.context = new webkitAudioContext();

  var envelope = this.envelope = context.createGainNode();
  envelope.gain.value = 0;

  var filter = this.filter = context.createBiquadFilter();
  filter.type = 2;

  var compressor = this.compressor = context.createDynamicsCompressor();

  var outputGain = this.outputGain = context.createGainNode();

  var delay = this.delay = context.createDelay();
  delay.delayTime.value = 0.2;

  var delayRegenGain = this.delayRegenGain = context.createGainNode();
  delayRegenGain.gain.value = 0.5;

  // primary chain.  the oscillator will get connected in front of this.
  envelope.connect(filter);
  filter.connect(compressor);
  compressor.connect(outputGain);
  outputGain.connect(context.destination);

  // delay loop
  outputGain.connect(delay);
  delay.connect(delayRegenGain);
  delayRegenGain.connect(compressor);

}

// getScale
//
// @param {Array} arr An array of indexes describing which notes of the chromatic scale to use.
// @param {Integer} octave A zero-indexed indicator of which octave to use, relative to the base frequency of the oscillator.
// @returns {array} An array of cents with which one may detune an oscillator into the notes of a scale
Synth.prototype.getScale = function (arr, octave) {
  var octave = octave || 0,
      chromatic = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200];
  return compact(chromatic.map(function (val, index) {
    if (arr.indexOf(index) > -1) {
      return val * (octave + 1);
    }
  }), "falsyExceptZero");
};


// getFrequencyFromLinear
//
// turn a linear value between 0 and 1 into an audio frequency
//
//
// @param value a value between 0 and 1
// @param minFreq the bottom of the desired frequency range
// @param maxFreq the top of the desired frequency range
Synth.prototype.getFrequencyFromLinear = function (value, minFreq, maxFreq) {
  var minValue = minFreq || 40,
      maxValue = maxFreq || this.context.sampleRate / 2,
      numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2,
      multiplier = Math.pow(2, numberOfOctaves * (value - 1.0));
  return maxValue * multiplier;
};

// changePitch
//
// @param position
Synth.prototype.changePitch = function (value) {
  var cents = closest(value, this.scale)
  this.osc.detune.value = cents;
};

// changeGain
//
Synth.prototype.changeGain = function (value) {
  this.outputGain.gain.value = value;
};

// changeFilter
//
Synth.prototype.changeFilter = function (value) {
  this.filter.frequency.value = this.getFrequencyFromLinear(value);
};

// changeDelay
//
Synth.prototype.changeDelay = function (value) {
  this.delayRegenGain.gain.value = value;
};

// start
//
Synth.prototype.start = function () {
  if (this.osc && this.osc.playbackState === 2) return; // do nothing if already playing
  var osc = this.osc = this.context.createOscillator();
  osc.type = 2;
  osc.connect(this.envelope);
  osc.noteOn(0);
  this.playing = true;
  this.envelope.gain.linearRampToValueAtTime(1.0, this.context.currentTime + 0.1);
};

// stop
//
Synth.prototype.stop = function () {
    this.osc && this.osc.noteOff(0);
    this.envelope.gain.setValueAtTime(0.0, this.context.currentTime);
    this.playing = false;
}



