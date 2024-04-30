const path = require('path');

module.exports = {
    entry: {
        app: './client/app.jsx',
        account: './client/account.jsx',
        login: './client/login.jsx'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use : {
                    loader: 'ts-loader'
                }
            }
        ]
    },
    mode: 'production',
    watchOptions: {
        aggregateTimeout: 200,
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
    },
    output: {
        path: path.resolve(__dirname, 'hosted'),
        filename: '[name].bundle.js',
    },
};