var recorder, record, stop, events

window.onload = function () {
  events = document.getElementById('events')
  record = document.getElementById('record')
  stop = document.getElementById('stop')

  if (typeof MediaRecorder === 'undefined') {
    document.getElementById('demo').style.display = 'none'
    document.getElementById('support').style.display = 'block'
    return
  }

  record.addEventListener('click', startRecording)
  stop.addEventListener('click', stopRecording)

  record.disabled = false
}

function startRecording () {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
    recorder = new MediaRecorder(stream)
    recorder.start()
    record.disabled = true
    stop.disabled = false
    recorder.addEventListener('dataavailable', saveRecord)
  })
}

function stopRecording () {
  recorder.stop()
  recorder.stream.getTracks().forEach(function (track) {
    track.stop()
  })
  record.disabled = false
  stop.disabled = true
}

function saveRecord (e) {
  var li = document.createElement('audio')

  var audio = document.createElement('audio')
  audio.controls = true
  audio.src = URL.createObjectURL(e.data)
  li.appendChild(audio)

  events.appendChild(li)
}
