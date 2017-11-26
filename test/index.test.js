var delay = require('nanodelay')

navigator.mediaDevices = { }
function AudioContext () { }
AudioContext.prototype = {
  createGain: function () {
    return { gain: { value: 1 } }
  },
  createScriptProcessor: function () { }
}
global.AudioContext = AudioContext

var MediaRecorder = require('../')

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
  expect(MediaRecorder.notSupported).toBeFalsy()
})

it('allow to request captured data', function () {
  var recorder = new MediaRecorder()
  var events = listen(recorder)

  recorder.requestData()
  expect(events).toEqual([])

  recorder.start()
  recorder.requestData()
  expect(events).toEqual(['start', 'dataavailable'])
})

it('supports slicing in start method', function () {
  var recorder = new MediaRecorder()
  var calls = 0
  recorder.addEventListener('dataavailable', function (e) {
    expect(e.data).toBeInstanceOf(Blob)
    expect(e.data.type).toEqual('audio/wav')
    calls += 1
  })

  recorder.start(500)
  return delay(10).then(function () {
    expect(calls).toEqual(0)
    return delay(500)
  }).then(function () {
    expect(calls).toEqual(1)
    return delay(510)
  }).then(function () {
    expect(calls).toEqual(2)
    recorder.pause()
    return delay(510)
  }).then(function () {
    expect(calls).toEqual(2)
    return delay(250)
  }).then(function () {
    recorder.resume()
    return delay(250)
  }).then(function () {
    expect(calls).toEqual(3)
    recorder.stop()
    expect(calls).toEqual(4)
    return delay(510)
  }).then(function () {
    expect(calls).toEqual(4)
  })
})
