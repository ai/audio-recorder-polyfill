navigator.mediaDevices = { }
function AudioContext () { }
AudioContext.prototype = {
  createGain: function () {
    return { gain: { value: 1 } }
  },
  createScriptProcessor: function () { }
}
global.webkitAudioContext = AudioContext

var MediaRecorder = require('../')

it('detects support', function () {
  expect(MediaRecorder.notSupported).toBeFalsy()
})

it('uses audio context with prefix', function () {
  new MediaRecorder()
})
