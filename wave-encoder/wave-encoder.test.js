let waveEncoder = require('../wave-encoder')

let messages
beforeEach(() => {
  messages = []
  global.postMessage = msg => {
    let from = new Uint8Array(msg)
    let array = []
    for (let i of from) {
      array.push(i)
    }
    messages.push(array)
  }
  global.onmessage = undefined
  waveEncoder()
  onmessage({ data: ['init'] })
})

it('encodes data to WAVE', () => {
  onmessage({ data: ['encode', [0.5]] })
  onmessage({ data: ['encode', [2]] })
  onmessage({ data: ['encode', [-3]] })
  expect(messages).toEqual([])

  onmessage({ data: ['dump', 44100] })
  expect(messages).toEqual([
    [
      // Header
      82,
      73,
      70,
      70,
      42,
      0,
      0,
      0,
      87,
      65,
      86,
      69,
      102,
      109,
      116,
      32,
      16,
      0,
      0,
      0,
      1,
      0,
      1,
      0,
      68,
      172,
      0,
      0,
      136,
      88,
      1,
      0,
      2,
      0,
      16,
      0,
      100,
      97,
      116,
      97,
      6,
      0,
      0,
      0,
      // Data
      0,
      64,
      0,
      128,
      0,
      128
    ]
  ])
})

it('allow to call dump multiple times', () => {
  onmessage({ data: ['encode', [0.5]] })
  onmessage({ data: ['encode', [2]] })
  onmessage({ data: ['dump', 44100] })
  expect(messages[0]).toHaveLength(48)

  onmessage({ data: ['encode', [0.5]] })
  onmessage({ data: ['dump', 44100] })
  expect(messages[1]).toHaveLength(46)

  onmessage({ data: ['dump', 44100] })
  expect(messages[2]).toHaveLength(44)
})
