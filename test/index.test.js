var MediaRecorder = require('../')

it('checks audio format support', function () {
  expect(MediaRecorder.isTypeSupported('audio/wav')).toBeTruthy()
  expect(MediaRecorder.isTypeSupported('audio/wave')).toBeTruthy()
  expect(MediaRecorder.isTypeSupported('audio/webm')).toBeFalsy()
})

it('saves stream', function () {
  var stream = { }
  var recorder = new MediaRecorder(stream)
  expect(recorder.stream).toBe(stream)
})
