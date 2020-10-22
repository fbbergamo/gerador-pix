const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')

module.exports = (env, options) => {
  const isProd = options.mode === 'production'

  return {
    entry: path.resolve(__dirname, 'app.js'),
    devtool: isProd ? 'hidden-source-map' : 'inline-source-map',
    optimization: {
      minimize: isProd,
      minimizer: [new TerserPlugin({ cache: true, parallel: true }), new OptimizeCSSAssetsPlugin({})]
    },
    output: {
        path: path.resolve(__dirname, 'public/dist'),
        filename: 'main.js',
    },
    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, use: [{ loader: "babel-loader" }] },
            {
              test: /\.css$/,
              use: [
                {
                  loader: MiniCssExtractPlugin.loader,
                  options: {
                    hmr: !isProd,
                    reloadAll: true
                  }
                },
                'css-loader',
                'postcss-loader'
              ]
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
