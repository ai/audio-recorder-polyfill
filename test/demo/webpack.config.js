var HtmlWebpackPlugin = require('html-webpack-plugin')
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
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'index.html'),
      chunks: ['index']
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, 'build')
  }
}
