#!/usr/bin/env node

let { promisify } = require('util')
let posthtml = require('posthtml')
let Bundler = require('parcel-bundler')
let path = require('path')
let fs = require('fs')

let writeFile = promisify(fs.writeFile)
let readFile = promisify(fs.readFile)
let copyFile = promisify(fs.copyFile)
let unlink = promisify(fs.unlink)

function findAssets (bundle) {
  return [...bundle.childBundles].reduce(
    (all, i) => {
      return all.concat(findAssets(i))
    },
    [bundle.name]
  )
}

const BUILD = path.join(__dirname, 'build')

let bundlerPolyfill = new Bundler(path.join(__dirname, 'polyfill.js'), {
  sourceMaps: false,
  scopeHoist: true,
  outDir: BUILD
})

let bundler = new Bundler(path.join(__dirname, 'index.pug'), {
  sourceMaps: false,
  scopeHoist: true,
  outDir: BUILD
})

async function build () {
  await bundlerPolyfill.bundle()
  let bundle = await bundler.bundle()
  let assets = findAssets(bundle)

  let jsFile = assets.find(i => /demo.*\.js/.test(i))
  let js = (await readFile(jsFile))
    .toString()
    .replace('function () ', 'function()')
    .replace(/};}\)\(\);$/, '}})()')
  await unlink(jsFile)

  await copyFile(
    path.join(__dirname, 'favicon.ico'),
    path.join(BUILD, 'favicon.ico')
  )

  function htmlPlugin (tree) {
    let once = false
    tree.match({ tag: 'title' }, title => {
      if (once) {
        return title
      } else {
        once = true
        return [
          title,
          {
            tag: 'link',
            attrs: {
              rel: 'icon',
              href: './favicon.ico'
            }
          }
        ]
      }
    })
    tree.match({ tag: 'script' }, script => {
      if (script.content) {
        return script
      } else {
        return {
          tag: 'script',
          content: js
        }
      }
    })
  }

  let htmlFile = assets.find(i => path.extname(i) === '.html')
  let html = await readFile(htmlFile)
  await writeFile(
    htmlFile,
    posthtml().use(htmlPlugin).process(html, { sync: true }).html
  )
}

build().catch(e => {
  process.stderr.write(e.stack + '\n')
  process.exit(1)
})
