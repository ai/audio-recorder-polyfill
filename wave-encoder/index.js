// Copied from https://github.com/chris-rudmin/Recorderjs

module.exports = () => {
  let BYTES_PER_SAMPLE = 2

  let recorded = []

  function encode (buffer) {
    let length = buffer.length
    let data = new Uint8Array(length * BYTES_PER_SAMPLE)
    for (let i = 0; i < length; i++) {
      let index = i * BYTES_PER_SAMPLE
      let sample = buffer[i]
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
    let bufferLength = recorded.length ? recorded[0].length : 0
    let length = recorded.length * bufferLength
    let wav = new Uint8Array(44 + length)
    let view = new DataView(wav.buffer)

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

    // eslint-disable-next-line unicorn/no-for-loop
    for (let i = 0; i < recorded.length; i++) {
      wav.set(recorded[i], i * bufferLength + 44)
    }

    recorded = []
    postMessage(wav.buffer, [wav.buffer])
  }

  onmessage = e => {
    if (e.data[0] === 'encode') {
      encode(e.data[1])
    } else if (e.data[0] === 'dump') {
      dump(e.data[1])
    }
  }
}
