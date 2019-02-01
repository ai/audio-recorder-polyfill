let MediaRecorder = require('../')

it('detects support', () => {
  expect(MediaRecorder.notSupported).toBeTruthy()
})
