/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./src/index.ts",
    devtool: "source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".css"]
    },
    target: "web",
    mode: "development",
    output: {
        publicPath: "./",
        path: path.join(__dirname, "/dist"),
        filename: "bundle.min.js"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    devServer: {
        historyApiFallback: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            baseUrl: "./",
            directory: path.join(__dirname, "public"),
            template: path.resolve(__dirname, "public/index.html")
        })
    ]
};
