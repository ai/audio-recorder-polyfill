let EVENTS = ['start', 'stop', 'pause', 'resume']
let TYPES = ['audio/webm', 'audio/ogg', 'audio/wav']

let recorder, list, recordFull, recordParts, pause, resume, stop, request

const KB = 1 << 10
const MB = 1 << 20

function bytes (value) {
  let mag = Math.abs(value)

  let unit
  if (mag >= MB) {
    unit = 'MB'
    value = value / MB
  } else if (mag >= KB) {
    unit = 'KB'
    value = value / KB
  } else {
    unit = 'B'
  }

  return value.toFixed(0).replace(/(?:\.0*|(\.[^0]+)0+)$/, '$1') + ' ' + unit
}

function startRecording (type) {
  list.innerHTML = ''
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    recorder = new MediaRecorder(stream)

    EVENTS.forEach(name => {
      recorder.addEventListener(name, changeState.bind(null, name))
    })
    recorder.addEventListener('dataavailable', saveRecord)

    if (type === 'full') {
      recorder.start()
    } else {
      recorder.start(1000)
    }
  })
  recordParts.blur()
  recordFull.blur()
}

function stopRecording () {
  recorder.stop()
  recorder.stream.getTracks()[0].stop()
  stop.blur()
}

function pauseRecording () {
  recorder.pause()
  pause.blur()
}

function resumeRecording () {
  recorder.resume()
  resume.blur()
}

function requestData () {
  recorder.requestData()
  request.blur()
}

function saveRecord (e) {
  let li = document.createElement('li')

  let strong = document.createElement('strong')
  strong.innerText = 'dataavailable: '
  li.appendChild(strong)

  let s = document.createElement('span')
  s.innerText = e.data.type + ', ' + bytes(e.data.size)
  li.appendChild(s)

  let audio = document.createElement('audio')
  audio.controls = true
  audio.src = URL.createObjectURL(e.data)
  li.appendChild(audio)

  list.appendChild(li)
}

function changeState (eventName) {
  let li = document.createElement('li')
  li.innerHTML = '<strong>' + eventName + ': </strong>' + recorder.state
  if (eventName === 'start') {
    li.innerHTML += ', ' + recorder.mimeType
  }
  list.appendChild(li)

  if (recorder.state === 'recording') {
    recordParts.disabled = true
    recordFull.disabled = true
    request.disabled = false
    resume.disabled = true
    pause.disabled = false
    stop.disabled = false
  } else if (recorder.state === 'paused') {
    recordParts.disabled = true
    recordFull.disabled = true
    request.disabled = false
    resume.disabled = false
    pause.disabled = true
    stop.disabled = false
  } else if (recorder.state === 'inactive') {
    recordParts.disabled = false
    recordFull.disabled = false
    request.disabled = true
    resume.disabled = true
    pause.disabled = true
    stop.disabled = true
  }
}

list = document.getElementById('list')

recordParts = document.getElementById('sec')
recordFull = document.getElementById('record')
request = document.getElementById('request')
resume = document.getElementById('resume')
pause = document.getElementById('pause')
stop = document.getElementById('stop')

if (MediaRecorder.notSupported) {
  list.style.display = 'none'
  document.getElementById('controls').style.display = 'none'
  document.getElementById('formats').style.display = 'none'
  document.getElementById('mode').style.display = 'none'
  document.getElementById('support').style.display = 'block'
} else {
  document.getElementById('formats').innerText =
    'Format: ' +
    TYPES.filter(i => {
      return MediaRecorder.isTypeSupported(i)
    }).join(', ')

  recordParts.addEventListener('click', startRecording.bind(null, 'parts'))
  recordFull.addEventListener('click', startRecording.bind(null, 'full'))
  request.addEventListener('click', requestData)
  resume.addEventListener('click', resumeRecording)
  pause.addEventListener('click', pauseRecording)
  stop.addEventListener('click', stopRecording)

  recordParts.disabled = false
  recordFull.disabled = false
}
