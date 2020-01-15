const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');

const buildPath = path.join(__dirname, 'build/Release/obj.target/native-sockets.node');
const distPath = path.join(__dirname, 'dist');

function getCopyPaths() {
    return [{
        from: buildPath,
        to: distPath
    }];
}

module.exports = {
    target: 'node',
    entry: {
        websockets: './src/http/ws/index.ts',
        wsServer: './src/ws-server/server.ts',
        clientHTTP: './src/ws-server/client.ts',
        clientHTTPReal: './src/ws-server/client-real.ts',
    },
    plugins: [
        new CopyPlugin(getCopyPaths())
    ],
    module: {
        rules: [{
            test: /.tsx|ts$/,
            exclude: /node_modules/,
            use: {
                loader: 'ts-loader'
            }
        }, {
            test: /.wasm$/,
            exclude: /node_modules/,
            use: {
                loader: 'wasm-loader'
            }
        }]
    },

    resolve: {
      extensions: [ '.tsx', '.ts', '.js', '.wasm' ],
    },

    optimization: {
        // We no not want to minimize our code.
        minimize: false
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, "dist")
    }
};

