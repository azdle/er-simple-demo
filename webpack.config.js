var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');

// puts .env into actual env
require('dotenv').config({silent: false});

var outputPath = 'public/builds';

function buildPluginList() {
  var plugins = [
    //new CleanWebpackPlugin(outputPath),
    //new ExtractTextPlugin('style.css')
  ];

  if(process.env.NODE_ENV === 'production') {
    console.log('building production plugin list');
    plugins = plugins.concat([
      new webpack.DefinePlugin({
        API_BASE_URL: JSON.stringify('')
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.UglifyJsPlugin()
    ]);
  } else {
    console.log('building non-production plugin list');
    var apiBaseUrl = JSON.stringify(process.env.API_BASE_URL || '');
    console.log('apiBaseUrl: ', apiBaseUrl);
    plugins.push(new webpack.DefinePlugin({
      API_BASE_URL: apiBaseUrl })
    );
  }

  plugins.push(new ExtractTextPlugin('style.css'));

  return plugins;
}

module.exports = {
  entry: './app/index.js',

  output: {
    path: outputPath,
    filename: 'bundle.js',
    publicPath: 'builds/'
  },

  plugins: buildPluginList(),

  devtool: 'cheap-module-source-map',

  devServer: {
    hot: true
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader?presets[]=es2015&presets[]=react&plugins[]=transform-object-rest-spread'
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
        ]
      },
      {
        test:   /\.scss/,
        loader: ExtractTextPlugin.extract('style', 'css!sass'),
      },
      {
        test:   /\.html/,
        loader: 'html'
      }
    ]
  }
}

