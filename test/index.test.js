var MediaRecorder = require('../')

it('checks audio format support', function () {
  expect(MediaRecorder.isTypeSupported('audio/wav')).toBeTruthy()
  expect(MediaRecorder.isTypeSupported('audio/wave')).toBeTruthy()
  expect(MediaRecorder.isTypeSupported('audio/webm')).toBeFalsy()
})
