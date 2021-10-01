const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const PATHS = {
    mainEntryPoint: path.resolve(__dirname, 'src/index.ts'),
    bundles: path.resolve(__dirname, 'lib'),
}

const test_entry = path.join("dev", "test.html");

const libraryConfig = {
    target: "web",
    mode: 'development',
    entry: {
        index: path.join(__dirname, test_entry).replace(/\.html$/, ".js"),
    },
    devtool: 'source-map',
    optimization: {
        minimize: false,//!isDevelopment,
        minimizer: [
            new TerserPlugin(),
        ],
    },
    resolve: {
        extensions: [".js", ".ts"],
        fallback: {
            assert: require.resolve("assert/"),
            buffer: require.resolve("buffer/"),
            events: require.resolve("events/"),
            stream: require.resolve("stream-browserify/"),
            util: require.resolve("util/"),
        },
        modules: [
            path.resolve('./node_modules'),
            path.resolve('./')
        ]
    },
    output: {
        filename: '[name].js',
        path: PATHS.bundles
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    configFile: 'umd.tsconfig.json'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, test_entry),
            cache: false
        }),
        new webpack.ProvidePlugin({
            Buffer: [require.resolve("buffer/"), "Buffer"],
            process: require.resolve("process/browser"),
        }),
        new webpack.EnvironmentPlugin({
            COORDINATOR_CANISTER_IDS: [
                "rdmx6-jaaaa-aaaaa-aaadq-cai",
                "qoctq-giaaa-aaaaa-aaaea-cai",
            ],
        }),
    ],
    devServer: {
        proxy: {
            "/api": {
                target: "http://localhost:8000",
                changeOrigin: true,
                pathRewrite: {
                    "^/api": "/api",
                },
            },
        },
        https: true,
        hot: true,
        host: "0.0.0.0",
        port: 4000,
        contentBase: path.resolve(__dirname, "./"),
        watchContentBase: true,
        historyApiFallback: true,
    }
}

module.exports = [
    libraryConfig,
];