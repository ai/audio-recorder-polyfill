navigator.mediaDevices = { }

function AudioContext () { }

AudioContext.prototype = {
  createScriptProcessor: function () {
    return { connect: function () { } }
  },
  createMediaStreamSource: function () {
    return { connect: function () { } }
  }
}

global.AudioContext = AudioContext

function Worker (url) {
  this.url = url
}

Worker.prototype = {
  addEventListener: function (type, cb) {
    this.listener = cb
  },
  postMessage: function () { }
}

global.Worker = Worker

URL.createObjectURL = function (blob) {
  return blob
}
