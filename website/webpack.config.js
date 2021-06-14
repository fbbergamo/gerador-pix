const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const webpack = require('webpack')

module.exports = (env, options) => {
  const isProd = options.mode === 'production'

  return {
    entry: path.resolve(__dirname, 'app.js'),
    devtool: isProd ? 'hidden-source-map' : 'inline-source-map',
    optimization: {
      minimize: isProd,
      minimizer:  ['...']
    },
    output: {
        path: path.resolve(__dirname, 'public/dist'),
        filename: 'main.js',
    },
    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, use: { loader: "babel-loader", options: {
            presets: ['@babel/preset-env']} } },
            {
              test: /\.css$/,
              use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
            }

        ],
    },
    plugins: [
     new MiniCssExtractPlugin({ filename: 'main.css' }),
     new webpack.DefinePlugin({
       PRODUCTION: JSON.stringify(isProd)
     })
   ]
  }
}
