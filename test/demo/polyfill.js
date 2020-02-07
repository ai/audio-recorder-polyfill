document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('mode').innerText = 'Polyfill is enabled'
})
window.MediaRecorder = require('../../')
