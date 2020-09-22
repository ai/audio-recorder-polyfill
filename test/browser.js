navigator.mediaDevices = {}

class AudioNode {
  connect () {}

  disconnect () {}
}

class ScriptProcessorNode extends AudioNode {}
class MediaStreamAudioSourceNode extends AudioNode {}

class AudioContext {
  createScriptProcessor () {
    return new ScriptProcessorNode()
  }

  createMediaStreamSource () {
    return new MediaStreamAudioSourceNode()
  }
}
global.AudioContext = AudioContext

class MediaStream {
  clone () {
    return this
  }

  getTracks () {
    return [{ stop () {} }]
  }
}
global.MediaStream = MediaStream

class Worker {
  constructor (url) {
    this.url = url
  }

  addEventListener (type, cb) {
    this.listener = cb
  }

  postMessage () {}
}
global.Worker = Worker

URL.createObjectURL = blob => blob
