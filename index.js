var AudioContext = window.AudioContext || window.webkitAudioContext

function createWorker (fn) {
  var js = fn
    .toString()
    .replace(/^function\s*\(\)\s*{/, '')
    .replace(/}$/, '')
  var blob = new Blob([js])
  return new Worker(URL.createObjectURL(blob))
}

var context

/**
 * Audio Recorder with MediaRecorder API.
 *
 * @param {MediaStream} stream The audio stream to record.
 *
 * @example
 * navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
 *   var recorder = new MediaRecorder(stream)
 * })
 *
 * @class
 */
function MediaRecorder (stream) {
  /**
   * The `MediaStream` passed into the constructor.
   * @type {MediaStream}
   */
  this.stream = stream

  /**
   * The current state of recording process.
   * @type {"inactive"|"recording"|"paused"}
   */
  this.state = 'inactive'

  this.em = document.createDocumentFragment()
  this.encoder = createWorker(MediaRecorder.encoder)

  var recorder = this
  this.encoder.addEventListener('message', function (e) {
    var event = new Event('dataavailable')
    event.data = new Blob([e.data], { type: recorder.mimeType })
    recorder.em.dispatchEvent(event)
    if (recorder.state === 'inactive') {
      recorder.em.dispatchEvent(new Event('stop'))
    }
  })
}

MediaRecorder.prototype = {
  /**
   * The MIME type that is being used for recording.
   * @type {string}
   */
  mimeType: 'audio/wav',

  /**
   * Begins recording media.
   *
   * @param {number} [timeslice] The milliseconds to record into each `Blob`.
   *                             If this parameter isn’t included, single `Blob`
   *                             will be recorded.
   *
   * @return {undefined}
   *
   * @example
   * recordButton.addEventListener('click', function () {
   *   recorder.start()
   * })
   */
  start: function start (timeslice) {
    if (this.state !== 'inactive') {
      return this.em.dispatchEvent(new Event('error'))
    }

    this.state = 'recording'

    if (!context) {
      context = new AudioContext()
    }
    var input = context.createMediaStreamSource(this.stream)
    var processor = context.createScriptProcessor(2048, 1, 1)

    var recorder = this
    processor.onaudioprocess = function (e) {
      if (this.state !== 'recording') {
        return this.dispatchError(Error("Failed to process audio recording: The MediaRecorder's state is not 'recording'."))
      }

      recorder.encoder.postMessage([
        'encode', e.inputBuffer.getChannelData(0)
      ])
    }

    input.connect(processor)
    processor.connect(context.destination)

    this.em.dispatchEvent(new Event('start'))

    if (timeslice) {
      this.slicing = setInterval(function () {
        if (recorder.state === 'recording') recorder.requestData()
      }, timeslice)
    }
  },

  /**
   * Stop media capture and raise `dataavailable` event with recorded data.
   *
   * @return {undefined}
   *
   * @example
   * finishButton.addEventListener('click', function () {
   *   recorder.stop()
   * })
   */
  stop: function stop () {
    if (this.state === 'inactive') {
      return this.dispatchError(Error("Failed to execute 'stop' on the MediaRecorder: The MediaRecorder's state is 'inactive'."))
    }

    this.requestData()
    this.state = 'inactive'
    clearInterval(this.slicing)
  },

  /**
   * Pauses recording of media streams.
   *
   * @return {undefined}
   *
   * @example
   * pauseButton.addEventListener('click', function () {
   *   recorder.pause()
   * })
   */
  pause: function pause () {
    if (this.state !== 'recording') {
      return this.dispatchError(Error("Failed to execute 'pause' on the MediaRecorder: The MediaRecorder's state is not 'recording'."))
    }

    this.state = 'paused'
    this.em.dispatchEvent(new Event('pause'))
  },

  /**
   * Resumes media recording when it has been previously paused.
   *
   * @return {undefined}
   *
   * @example
   * resumeButton.addEventListener('click', function () {
   *   recorder.resume()
   * })
   */
  resume: function resume () {
    if (this.state !== 'paused') {
      return this.dispatchError(Error("Failed to execute 'resume' on the MediaRecorder: The MediaRecorder's state is not 'paused'."))
    }

    this.state = 'recording'
    this.em.dispatchEvent(new Event('resume'))
  },

  /**
   * Raise a `dataavailable` event containing the captured media.
   *
   * @return {undefined}
   *
   * @example
   * this.on('nextData', function () {
   *   recorder.requestData()
   * })
   */
  requestData: function requestData () {
    if (this.state === 'inactive') {
      return this.dispatchError(Error("Failed to execute 'requestData' on the MediaRecorder: The MediaRecorder's state is 'inactive'."))
    }

    this.encoder.postMessage(['dump', context.sampleRate])
  },

  /**
   * Add listener for specified event type.
   *
   * @param {"start"|"stop"|"pause"|"resume"|"dataavailable"|"error"} type Event type.
   * @param {function} listener The listener function.
   *
   * @return {undefined}
   *
   * @example
   * recorder.addEventListener('dataavailable', function (e) {
   *   audio.src = URL.createObjectURL(e.data)
   * })
   */
  addEventListener: function addEventListener () {
    this.em.addEventListener.apply(this.em, arguments)
  },

  /**
   * Remove event listener.
   *
   * @param {"start"|"stop"|"pause"|"resume"|"dataavailable"|"error"} type Event type.
   * @param {function} listener The same function used in `addEventListener`.
   *
   * @return {undefined}
   */
  removeEventListener: function removeEventListener () {
    this.em.removeEventListener.apply(this.em, arguments)
  },

  /**
   * Calls each of the listeners registered for a given event.
   *
   * @param {Event} event The event object.
   *
   * @return {boolean} Is event was no canceled by any listener.
   */
  dispatchEvent: function dispatchEvent () {
    this.em.dispatchEvent.apply(this.em, arguments)
  },

  /**
   * Calls each of the listeners registered for the 'error' event
   *
   * @param {Error} error The error object.
   *
   * @return {boolean} Is event was no canceled by any listener.
   */
  dispatchError: function dispatchError (error) {
    var event = new Event('error')
    if (error.message) {
      event.data = {
        message: error.message
      }
    }

    this.em.dispatchEvent(event)
  }
}

/**
 * Returns `true` if the MIME type specified is one the polyfill can record.
 *
 * This polyfill supports only `audio/wav`.
 *
 * @param {string} mimeType The mimeType to check.
 *
 * @return {boolean} `true` on `audio/wav` MIME type.
 */
MediaRecorder.isTypeSupported = function isTypeSupported (mimeType) {
  return /audio\/wave?/.test(mimeType)
}

/**
 * `true` if MediaRecorder can not be polyfilled in the current browser.
 * @type {boolean}
 *
 * @example
 * if (MediaRecorder.notSupported) {
 *   showWarning('Audio recording is not supported in this browser')
 * }
 */
MediaRecorder.notSupported = !navigator.mediaDevices || !AudioContext

/**
 * Converts RAW audio buffer to compressed audio files.
 * It will be loaded to Web Worker.
 * By default, WAVE encoder will be used.
 * @type {function}
 *
 * @example
 * MediaRecorder.prototype.mimeType = 'audio/ogg'
 * MediaRecorder.encoder = oggEncoder
 */
MediaRecorder.encoder = require('./wave-encoder')

module.exports = MediaRecorder
