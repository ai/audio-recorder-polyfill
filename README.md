# Audio Recorder Polyfill

<img align="right" width="80" height="80"
     src="./logo.svg"
     title="Audio Recorder Polyfill Logo">

[MediaRecorder] polyfill to record audio in Edge and Safari.
Try it in **[online demo]** and see **[API]**.

* **Spec compatible.** In the future when all browsers will support
  MediaRecorder, you will remove polyfill.
* **Small.** 1.1 KB (minified and gzipped). No dependencies.
  It uses [Size Limit] to control size.
* **One file.** In contrast to other recorders, this polyfill uses
  “inline worker” and don’t need a separated file for Web Worker.

```js
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  recorder = new MediaRecorder(stream)
  recorder.addEventListener('dataavailable', e => {
    audio.src = URL.createObjectURL(e.data)
  })
  recorder.start()
})
```

[MediaRecorder]: https://developers.google.com/web/updates/2016/01/mediarecorder
[online demo]:   https://ai.github.io/audio-recorder-polyfill/
[Size Limit]:    https://github.com/ai/size-limit
[API]:           https://ai.github.io/audio-recorder-polyfill/api/MediaRecorder.html

<a href="https://evilmartians.com/?utm_source=audio-recorder-polyfill">
  <img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
       alt="Sponsored by Evil Martians" width="236" height="54">
</a>

## Install

Install package:

```sh
npm install --save audio-recorder-polyfill
```

We recommend creating separated webpack/Parcel bundle with polyfill.
In this case, polyfill will be downloaded only by Edge and Safari.
Good browsers will download less.

```diff
  entry: {
    app: './src/app.js',
+   polyfill: './src/polyfill.js'
  }
```

Install polyfill as MediaRecorder in this new bundle `src/polyfill.js`:

```js
window.MediaRecorder = require('audio-recorder-polyfill')
```

Add this code to your HTML to load this new bundle only for browsers
without MediaRecorder support:

```diff
+   <script>
+     if (!window.MediaRecorder) {
+       document.write(
+         decodeURI('%3Cscript defer src="/polyfill.js">%3C/script>')
+       )
+     }
+   </script>
    <script src="/app.js" defer></script>
```

## Usage

In the beginning, we need to show a warning in browsers without Web Audio API:

```js
if (MediaRecorder.notSupported) {
  noSupport.style.display = 'block'
  dictaphone.style.display = 'none'
}
```

Then you can use standard MediaRecorder [API]:

```js
let recorder

recordButton.addEventListener('click', () => {
  // Request permissions to record audio
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    recorder = new MediaRecorder(stream)

    // Set record to <audio> when recording will be finished
    recorder.addEventListener('dataavailable', e => {
      audio.src = URL.createObjectURL(e.data)
    })

    // Start recording
    recorder.start()
  })
})

stopButton.addEventListener('click', () => {
  // Stop recording
  recorder.stop()
  // Remove “recording” icon from browser tab
  recorder.stream.getTracks().forEach(i => i.stop())
})
```

If you need to upload record to the server, we recommend using `timeslice`.
MediaRecorder will send recorded data every specified millisecond.
So you will start uploading before recording would finish.

```js
// Will be executed every second with next part of audio file
recorder.addEventListener('dataavailable', e => {
  sendNextPiece(e.data)
})
// Dump audio data every second
recorder.start(1000)
```

[API]: https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API

## Audio Formats

Chrome records natively only to `.webm` files. Firefox to `.ogg`.

This polyfill saves records to `.wav` files. Compression
is not very good, but encoding is fast and simple.

You can get used file format in `e.data.type`:

```js
recorder.addEventListener('dataavailable', e => {
  e.data.type //=> 'audio/wav' with polyfill
              //   'audio/webm' in Chrome
              //   'audio/ogg' in Firefox
})
```

## Limitations

This polyfill tries to be MediaRecorder API compatible.
But it still has small differences.

* WAV format contains duration in the file header. As result, with `timeslice`
  or `requestData()` call, `dataavailable` will receive a separated file
  with header on every call. In contrast, MediaRecorder sends header only
  to first `dataavailable`. Other events receive addition bytes
  to the same file.
* Constructor options are not supported.
* `BlobEvent.timecode` is not supported.

## Custom Encoder

If you need audio format with better compression,
you can change polyfill’s encoder:

```diff
  window.MediaRecorder = require('audio-recorder-polyfill')
+ MediaRecorder.encoder = require('./ogg-opus-encoder')
+ MediaRecorder.mimeType = 'audio/ogg'
```

The encoder should be a function with Web Worker in the body.
Polyfill converts function to the string to make Web Worker.

```js
module.exports = function () {
  function encode (input) {
    …
  }

  function dump (sampleRate) {
    …
    postMessage(output)
  }

  onmessage = function (e) {
    if (e.data[0] === 'encode') {
      encode(e.data[1])
    } else {
      dump(e.data[1])
    }
  }
}
```
