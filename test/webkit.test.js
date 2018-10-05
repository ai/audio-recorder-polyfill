require('./browser.js')
global.webkitAudioContext = global.AudioContext
delete global.AudioContext
var MediaRecorder = require('../')

it('detects support', function () {
  expect(MediaRecorder.notSupported).toBeFalsy()
})

it('uses audio context with prefix', function () {
  expect(function () {
    var recorder = new MediaRecorder()
    recorder.start()
  }).not.toThrow()
})
