var MediaRecorder = require('../')

it('detects support', function () {
  expect(MediaRecorder.notSupported).toBeTruthy()
})
