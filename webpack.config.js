const path = require('path');

const Dotenv = require('dotenv-webpack')
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
        clientChatter: './src/client/index.ts',
        serverChatter: './src/server/index.ts',
    },
    plugins: [
        new CopyPlugin(getCopyPaths()),
        new Dotenv(),
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

