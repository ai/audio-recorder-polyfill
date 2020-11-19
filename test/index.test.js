let { delay } = require('nanodelay')

require('./browser.js')
let MediaRecorder = require('../')

function listen (recorder) {
  let events = []
  let names = ['start', 'stop', 'pause', 'resume', 'dataavailable']
  names.forEach(i => {
    recorder.addEventListener(i, () => {
      events.push(i)
    })
  })
  return events
}

function fakeEncoder (recorder) {
  recorder.encoder.postMessage = data => {
    if (data[0] === 'dump') {
      Promise.resolve().then(() => {
        recorder.encoder.listener('sound')
      })
    }
  }
}

function waitForData (recorder) {
  return new Promise(resolve => {
    recorder.addEventListener('dataavailable', resolve)
  })
}

let processor = { connect () {}, disconnect () {}, a: 1 }
AudioContext.prototype.createScriptProcessor = () => {
  return processor
}

let originEncoder = MediaRecorder.encoder
beforeEach(() => {
  MediaRecorder.encoder = originEncoder
})

it('checks audio format support', () => {
  expect(MediaRecorder.isTypeSupported('audio/wav')).toBe(true)
  expect(MediaRecorder.isTypeSupported('audio/webm')).toBe(false)
})

it('saves stream', () => {
  let stream = new MediaStream()
  let recorder = new MediaRecorder(stream)
  expect(recorder.stream).toBe(stream)
})

it('saves event listeners', () => {
  let recorder = new MediaRecorder()
  let event = new Event('stop')
  let cb = jest.fn()

  recorder.addEventListener('stop', cb)
  recorder.dispatchEvent(event)
  expect(cb).toHaveBeenCalledWith(event)

  recorder.removeEventListener('stop', cb)
  recorder.dispatchEvent(event)
  expect(cb).toHaveBeenCalledTimes(1)
})

it('has state and state events', async () => {
  let recorder = new MediaRecorder(new MediaStream())
  expect(recorder.state).toEqual('inactive')

  let events = listen(recorder)
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

  await waitForData(recorder)
  expect(events).toEqual(['start', 'pause', 'resume', 'dataavailable', 'stop'])
})

it('dispatches error command in wrong state', () => {
  let recorder = new MediaRecorder(new MediaStream())
  let events = listen(recorder)

  let errors = []
  recorder.addEventListener('error', event => {
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

it('allows to stop paused recording', () => {
  let recorder = new MediaRecorder(new MediaStream())
  recorder.start()
  recorder.pause()
  recorder.stop()
  expect(recorder.state).toEqual('inactive')
})

it('shows used MIME type', () => {
  let recorder = new MediaRecorder()
  expect(recorder.mimeType).toEqual('audio/wav')
})

it('detects support', () => {
  expect(MediaRecorder.notSupported).toBe(false)
})

it('allow to request captured data', async () => {
  let recorder = new MediaRecorder(new MediaStream())
  let events = listen(recorder)
  fakeEncoder(recorder)

  recorder.requestData()
  expect(events).toEqual([])

  recorder.start()
  recorder.requestData()
  await waitForData(recorder)
  expect(events).toEqual(['start', 'dataavailable'])
})

it('sends every data chunk to encoder', () => {
  let event = {
    inputBuffer: {
      getChannelData (channel) {
        return [channel]
      }
    }
  }

  let recorder = new MediaRecorder(new MediaStream())
  let calls = 0
  recorder.encoder.postMessage = data => {
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

it('supports slicing in start method', async () => {
  let recorder = new MediaRecorder(new MediaStream())
  fakeEncoder(recorder)

  let calls = 0
  recorder.addEventListener('dataavailable', e => {
    expect(e.data).toBeInstanceOf(Blob)
    expect(e.data.type).toEqual('audio/wav')
    calls += 1
  })

  recorder.start(500)
  await delay(10)
  expect(calls).toEqual(0)
  await delay(500)
  expect(calls).toEqual(1)
  await delay(510)
  expect(calls).toEqual(2)
  recorder.pause()
  await delay(510)
  expect(calls).toEqual(2)
  await delay(250)
  recorder.resume()
  await delay(250)
  expect(calls).toEqual(3)
  recorder.stop()
  await delay(1)
  expect(calls).toEqual(4)
  await delay(510)
  expect(calls).toEqual(4)
})

it('allows to change encoder', () => {
  let recorder = new MediaRecorder()
  expect(recorder.encoder.url.size).toBeGreaterThan(9)

  MediaRecorder.encoder = () => 1

  recorder = new MediaRecorder()
  expect(recorder.encoder.url.size).toEqual(7)
})

it('sends the AudioContext sample rate in the initialize method', () => {
  AudioContext.prototype.sampleRate = 8000
  let recorder = new MediaRecorder(new MediaStream())
  let calls = 0
  recorder.encoder.postMessage = data => {
    if (data[0] === 'init') {
      expect(data[1]).toEqual(8000)
      calls += 1
    }
  }
  recorder.start()
  expect(calls).toEqual(1)
})
