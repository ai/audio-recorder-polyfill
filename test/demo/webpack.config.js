var HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var UglifyJSPlugin = require('uglifyjs-webpack-plugin')
var path = require('path')

module.exports = {
  entry: {
    index: path.join(__dirname, 'index.js'),
    polyfill: path.join(__dirname, 'polyfill.js')
  },
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/',
    filename: '[name].js'
  },
  plugins: [
    new UglifyJSPlugin(),
    new HtmlWebpackPlugin({
      inlineSource: 'index.js',
      template: path.join(__dirname, 'index.html'),
      chunks: ['index'],
      minify: {
        collapseWhitespace: true,
        minifyCSS: true
      }
    }),
    new HtmlWebpackInlineSourcePlugin()
  ],
  devServer: {
    contentBase: path.join(__dirname, 'build')
  }
}
