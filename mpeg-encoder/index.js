module.exports = () => {
  importScripts(
    'https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.0/lame.min.js'
  )

  let CHANNELS = 1
  let KBPS = 128
  let DEFAULT_SAMPLE_RATE = 44100

  let encoder
  let recorded = new Int8Array()

  function concat (a, b) {
    if (b.length === 0) {
      return a
    }
    let c = new Int8Array(a.length + b.length)
    c.set(a)
    c.set(b, a.length)
    return c
  }

  function init (sampleRate) {
    encoder = new lamejs.Mp3Encoder(
      CHANNELS,
      sampleRate || DEFAULT_SAMPLE_RATE,
      KBPS
    )
  }

  function encode (buffer) {
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = buffer[i] * 32767.5
    }

    let buf = encoder.encodeBuffer(buffer)
    recorded = concat(recorded, buf)
  }

  function dump () {
    let buf = encoder.flush()
    recorded = concat(recorded, buf)
    let buffer = recorded.buffer
    recorded = new Int8Array()
    postMessage(buffer, [buffer])
  }

  onmessage = e => {
    if (e.data[0] === 'init') {
      init(e.data[1])
    } else if (e.data[0] === 'encode') {
      encode(e.data[1])
    } else {
      dump(e.data[1])
    }
  }
}
