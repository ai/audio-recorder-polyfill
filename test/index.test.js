var MediaRecorder = require('../')

function AudioContext () { }
AudioContext.prototype = {
  createGain: function () {
    return { gain: { value: 1 } }
  },
  createScriptProcessor: function () { }
}

beforeEach(function () {
  global.AudioContext = AudioContext
})

function listen (recorder) {
  var events = []
  var names = ['start', 'stop', 'pause', 'resume', 'dataavailable']
  names.forEach(function (i) {
    recorder.addEventListener(i, function () {
      events.push(i)
    })
  })
  return events
}

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

it('has state and state events', function () {
  var recorder = new MediaRecorder()
  var events = listen(recorder)
  expect(recorder.state).toEqual('inactive')

  recorder.start()
  expect(recorder.state).toEqual('recording')

  recorder.pause()
  expect(recorder.state).toEqual('paused')

  recorder.resume()
  expect(recorder.state).toEqual('recording')

  recorder.stop()
  expect(recorder.state).toEqual('inactive')

  expect(events).toEqual(['start', 'pause', 'resume', 'dataavailable', 'stop'])
})

it('ignores command in wrong state', function () {
  var recorder = new MediaRecorder()
  var events = listen(recorder)

  recorder.stop()
  recorder.pause()
  recorder.resume()
  expect(recorder.state).toEqual('inactive')
  expect(events).toEqual([])

  recorder.start()
  recorder.start()
  recorder.resume()
  expect(recorder.state).toEqual('recording')
  expect(events).toEqual(['start'])
})

it('allows to stop paused recording', function () {
  var recorder = new MediaRecorder()
  var events = listen(recorder)
  recorder.start()
  recorder.pause()
  recorder.stop()
  expect(recorder.state).toEqual('inactive')
  expect(events).toEqual(['start', 'pause', 'dataavailable', 'stop'])
})

it('shows used MIME type', function () {
  var recorder = new MediaRecorder()
  expect(recorder.mimeType).toEqual('audio/wav')
})

it('detects support', function () {
  expect(MediaRecorder).toBeTruthy()
})

it('supports webkit prefix', function () {
  delete window.AudioContext
  window.webkitAudioContext = AudioContext
  new MediaRecorder()
})
