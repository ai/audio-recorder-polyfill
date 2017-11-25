var EVENTS = ['start', 'stop', 'pause', 'resume']

var recorder, recordFull, recordParts, pause, resume, stop, list

window.onload = function () {
  list = document.getElementById('list')

  recordParts = document.getElementById('recordParts')
  recordFull = document.getElementById('recordFull')
  resume = document.getElementById('resume')
  pause = document.getElementById('pause')
  stop = document.getElementById('stop')

  if (typeof MediaRecorder === 'undefined') {
    document.getElementById('demo').style.display = 'none'
    document.getElementById('support').style.display = 'block'
    return
  }

  recordParts.addEventListener('click', startRecording)
  recordFull.addEventListener('click', startRecording)
  resume.addEventListener('click', resumeRecording)
  pause.addEventListener('click', pauseRecording)
  stop.addEventListener('click', stopRecording)

  recordParts.disabled = false
  recordFull.disabled = false
}

function startRecording (e) {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
    recorder = new MediaRecorder(stream)

    EVENTS.forEach(function (name) {
      recorder.addEventListener(name, changeState.bind(null, name))
    })
    recorder.addEventListener('dataavailable', saveRecord)

    if (e.target === recordFull) {
      recorder.start()
    } else {
      recorder.start(1000)
    }
  })
}

function stopRecording () {
  recorder.stop()
  recorder.stream.getTracks().forEach(function (track) {
    track.stop()
  })
}

function pauseRecording () {
  recorder.pause()
}

function resumeRecording () {
  recorder.resume()
}

function saveRecord (e) {
  var li = document.createElement('li')

  var audio = document.createElement('audio')
  audio.controls = true
  audio.src = URL.createObjectURL(e.data)
  li.appendChild(audio)

  list.appendChild(li)
}

function changeState (eventName) {
  var li = document.createElement('li')
  li.innerHTML = '<strong>' + eventName + ':</strong> ' + recorder.state
  list.appendChild(li)

  if (recorder.state === 'recording') {
    recordParts.disabled = true
    recordFull.disabled = true
    resume.disabled = false
    pause.disabled = false
    stop.disabled = false
  } else if (recorder.state === 'paused') {
    recordParts.disabled = false
    recordFull.disabled = false
    resume.disabled = false
    pause.disabled = true
    stop.disabled = false
  } else if (recorder.state === 'inactive') {
    recordParts.disabled = false
    recordFull.disabled = false
    resume.disabled = true
    pause.disabled = true
    stop.disabled = true
  }
}
