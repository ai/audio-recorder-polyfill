var HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var path = require('path')

module.exports = {
  mode: 'development',
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
      inlineSource: 'index.js',
      template: path.join(__dirname, 'index.html'),
      chunks: ['index'],
      minify: {
        collapseWhitespace: true,
        minifyCSS: true
      }
    }),
    new HtmlWebpackInlineSourcePlugin(),
    new CopyWebpackPlugin([
      { from: './test/demo/favicon.ico', to: './' },
      { from: './api/', to: './api/' }
    ])
  ],
  devServer: {
    contentBase: path.join(__dirname, 'build'),
    open: true
  }
}
