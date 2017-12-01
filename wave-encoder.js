// Copied from https://github.com/chris-rudmin/Recorderjs

module.exports = function () {
  var BYTES_PER_SAMPLE = 2

  var recorded = []

  function encode (buffer) {
    var length = buffer.length
    var data = new Uint8Array(length * BYTES_PER_SAMPLE)
    for (var i = 0; i < length; i++) {
      var index = i * BYTES_PER_SAMPLE
      var sample = buffer[i]
      if (sample > 1) {
        sample = 1
      } else if (sample < -1) {
        sample = -1
      }
      sample = sample * 32768
      data[index] = sample
      data[index + 1] = sample >> 8
    }
    recorded.push(data)
  }

  function dump (sampleRate) {
    var bufferLength = recorded.length ? recorded[0].length : 0
    var length = recorded.length * bufferLength
    var wav = new Uint8Array(44 + length)
    var view = new DataView(wav.buffer)

    // RIFF identifier 'RIFF'
    view.setUint32(0, 1380533830, false)
    // file length minus RIFF identifier length and file description length
    view.setUint32(4, 36 + length, true)
    // RIFF type 'WAVE'
    view.setUint32(8, 1463899717, false)
    // format chunk identifier 'fmt '
    view.setUint32(12, 1718449184, false)
    // format chunk length
    view.setUint32(16, 16, true)
    // sample format (raw)
    view.setUint16(20, 1, true)
    // channel count
    view.setUint16(22, 1, true)
    // sample rate
    view.setUint32(24, sampleRate, true)
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * BYTES_PER_SAMPLE, true)
    // block align (channel count * bytes per sample)
    view.setUint16(32, BYTES_PER_SAMPLE, true)
    // bits per sample
    view.setUint16(34, 8 * BYTES_PER_SAMPLE, true)
    // data chunk identifier 'data'
    view.setUint32(36, 1684108385, false)
    // data chunk length
    view.setUint32(40, length, true)

    for (var i = 0; i < recorded.length; i++) {
      wav.set(recorded[i], i * bufferLength + 44)
    }

    recorded = []
    postMessage(wav.buffer, [wav.buffer])
  }

  onmessage = function (e) {
    if (e.data[0] === 'encode') {
      encode(e.data[1])
    } else {
      dump(e.data[1])
    }
  }
}
