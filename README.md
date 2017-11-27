# Audio Recorder Polyfill

[MediaRecorder] polyfill to record audio in Edge and Safari 11.
It uses Web Audio API and WAV encoder in Web Worker.

Try it in **[online demo].**

**Spec compatible.** In the future when other browsers will support
`MediaRecorder` too, you will be able to remove polyfill.

**Small.** Less then 1 KB (minified and gzipped). No dependencies.
It uses [Size Limit] to control size.

**One file.** In contract to other recorders, this polyfill uses “inline worker”
and don’t need separated file for Web Worker.

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

<a href="https://evilmartians.com/?utm_source=audio-recorder-polyfill">
  <img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
       alt="Sponsored by Evil Martians" width="236" height="54">
</a>
