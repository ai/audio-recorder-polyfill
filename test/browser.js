navigator.mediaDevices = { }

class AudioContext {
  createScriptProcessor () {
    return { connect () { } }
  }

  createMediaStreamSource () {
    return { connect () { } }
  }
}
global.AudioContext = AudioContext

class MediaStream {
  clone () {
    return this
  }

  getTracks () {
    return [
      { stop () { } }
    ]
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

  postMessage () { }
}
global.Worker = Worker

URL.createObjectURL = blob => blob
