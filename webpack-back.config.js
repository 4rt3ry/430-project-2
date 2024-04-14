const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: {
        app: './server/app.ts',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader'
                }
            }
        ]
    },
    mode: 'production',
    watchOptions: {
        aggregateTimeout: 200,
    },
    optimization: {
        minimize: true
    },
    target: 'node',
    externals: [
        nodeExternals()
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    output: {
        path: path.resolve(__dirname, 'server'),
        filename: '[name].bundle.js',
    },
};