const path = require('path')

module.exports = {
    entry: path.resolve(__dirname, 'app.js'),
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, 'public/dist'),
        filename: 'main.js',
    },
    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, use: [{ loader: "babel-loader" }] },
            {
                test: /\.css$/i,
                exclude: /node_modules/,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
        ],
    },
}
