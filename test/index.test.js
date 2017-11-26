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

it('saves event listeners', function () {
  var recorder = new MediaRecorder()
  var event = new Event('stop')
  var cb = jest.fn()

  recorder.addEventListener('stop', cb)
  recorder.dispatchEvent(event)
  expect(cb).toHaveBeenCalledWith(event)

  recorder.removeEventListener('stop', cb)
  recorder.dispatchEvent(event)
  expect(cb).toHaveBeenCalledTimes(1)
})
