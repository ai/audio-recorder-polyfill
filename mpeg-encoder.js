module.exports = function () {
  importScripts(
    'https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.0/lame.min.js'
  )

  var CHANNELS = 1
  var KBPS = 128
  var SAMPLE_RATE = 44100

  var encoder = new lamejs.Mp3Encoder(CHANNELS, SAMPLE_RATE, KBPS)
  var recorded = new Int8Array()

  function concat (a, b) {
    if (b.length === 0) {
      return a
    }
    var c = new Int8Array(a.length + b.length)
    c.set(a)
    c.set(b, a.length)
    return c
  }

  function encode (buffer) {
    for (var i = 0; i < buffer.length; i++) {
      buffer[i] = buffer[i] * 32767.5
    }

    var buf = encoder.encodeBuffer(buffer)
    recorded = concat(recorded, buf)
  }

  function dump () {
    var buf = encoder.flush()
    recorded = concat(recorded, buf)
    var buffer = recorded.buffer
    recorded = new Int8Array()
    postMessage(buffer, [buffer])
  }

  onmessage = function (e) {
    if (e.data[0] === 'encode') {
      encode(e.data[1])
    } else {
      dump(e.data[1])
    }
  }
}
