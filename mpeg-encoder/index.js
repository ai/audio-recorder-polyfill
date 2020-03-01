module.exports = () => {
  importScripts(
    'https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.0/lame.min.js'
  )

  let CHANNELS = 1
  let KBPS = 128
  let SAMPLE_RATE = 44100

  let encoder = new lamejs.Mp3Encoder(CHANNELS, SAMPLE_RATE, KBPS)
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
    if (e.data[0] === 'encode') {
      encode(e.data[1])
    } else {
      dump(e.data[1])
    }
  }
}
