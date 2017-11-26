document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('mode').innerText = 'Polyfill is enabled'
})
window.MediaRecorder = require('../../')
