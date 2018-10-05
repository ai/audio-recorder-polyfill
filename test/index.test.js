var delay = require('nanodelay')

require('./browser.js')
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

function fakeEncoder (recorder) {
  recorder.encoder.postMessage = function (data) {
    if (data[0] === 'dump') {
      Promise.resolve().then(function () {
        recorder.encoder.listener('sound')
      })
    }
  }
}

function waitForData (recorder) {
  return new Promise(function (resolve) {
    recorder.addEventListener('dataavailable', resolve)
  })
}

var originEncoder = MediaRecorder.encoder
var originCreate = AudioContext.prototype.createScriptProcessor
beforeEach(function () {
  MediaRecorder.encoder = originEncoder
  AudioContext.prototype.createScriptProcessor = originCreate
})

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
  expect(recorder.state).toEqual('inactive')

  var events = listen(recorder)
  fakeEncoder(recorder)

  recorder.start()
  expect(recorder.state).toEqual('recording')

  recorder.pause()
  expect(recorder.state).toEqual('paused')

  recorder.resume()
  expect(recorder.state).toEqual('recording')

  recorder.stop()
  expect(recorder.state).toEqual('inactive')
  expect(events).toEqual(['start', 'pause', 'resume'])

  return waitForData(recorder).then(function () {
    expect(events).toEqual([
      'start', 'pause', 'resume', 'dataavailable', 'stop'
    ])
  })
})

it('dispatches error command in wrong state', function () {
  var recorder = new MediaRecorder()
  var events = listen(recorder)

  var errors = []
  recorder.addEventListener('error', function (event) {
    errors.push(event.data.message)
  })

  recorder.stop()
  recorder.pause()
  recorder.resume()
  expect(recorder.state).toEqual('inactive')
  expect(events).toEqual([])
  expect(errors).toEqual([
    'Wrong state for stop',
    'Wrong state for pause',
    'Wrong state for resume'
  ])

  recorder.start()
  recorder.start()
  recorder.resume()
  expect(recorder.state).toEqual('recording')
  expect(events).toEqual(['start'])
})

it('allows to stop paused recording', function () {
  var recorder = new MediaRecorder()
  recorder.start()
  recorder.pause()
  recorder.stop()
  expect(recorder.state).toEqual('inactive')
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
  fakeEncoder(recorder)

  recorder.requestData()
  expect(events).toEqual([])

  recorder.start()
  recorder.requestData()
  return waitForData(recorder).then(function () {
    expect(events).toEqual(['start', 'dataavailable'])
  })
})

it('sends every data chunk to encoder', function () {
  var event = {
    inputBuffer: {
      getChannelData: function (channel) {
        return [channel]
      }
    }
  }
  var processor = { connect: function () { }, a: 1 }
  AudioContext.prototype.createScriptProcessor = function () {
    return processor
  }

  var recorder = new MediaRecorder()
  var calls = 0
  recorder.encoder.postMessage = function (data) {
    if (data[0] === 'encode') {
      expect(data[1]).toEqual([0])
      calls += 1
    }
  }

  recorder.start()
  processor.onaudioprocess(event)
  expect(calls).toEqual(1)

  processor.onaudioprocess(event)
  expect(calls).toEqual(2)

  recorder.pause()
  processor.onaudioprocess(event)
  expect(calls).toEqual(2)

  recorder.resume()
  processor.onaudioprocess(event)
  expect(calls).toEqual(3)

  recorder.stop()
  processor.onaudioprocess(event)
  expect(calls).toEqual(3)
})

it('supports slicing in start method', function () {
  var recorder = new MediaRecorder()
  fakeEncoder(recorder)

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
    return delay(1)
  }).then(function () {
    expect(calls).toEqual(4)
    return delay(510)
  }).then(function () {
    expect(calls).toEqual(4)
  })
})

it('allows to change encoder', function () {
  var recorder = new MediaRecorder()
  expect(recorder.encoder.url.size).toBeGreaterThan(9)

  MediaRecorder.encoder = function () {
    return 1
  }

  recorder = new MediaRecorder()
  expect(recorder.encoder.url.size).toEqual(17)
})
