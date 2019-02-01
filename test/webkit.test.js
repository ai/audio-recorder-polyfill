require('./browser.js')
global.webkitAudioContext = global.AudioContext
delete global.AudioContext
let MediaRecorder = require('../')

it('detects support', () => {
  expect(MediaRecorder.notSupported).toBeFalsy()
})

it('uses audio context with prefix', () => {
  expect(() => {
    let recorder = new MediaRecorder(new MediaStream())
    recorder.start()
  }).not.toThrow()
})
