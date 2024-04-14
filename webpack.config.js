const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.[fullhash].js',
        publicPath: '/',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.scss'],
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',  // Creates `style` nodes from JS strings
                    'css-loader',    // Translates CSS into CommonJS
                    'postcss-loader', // Processes CSS with PostCSS
                    'sass-loader',   // Compiles Sass to CSS
                ],
            },
            {
                test: /\.svg$/,
                use: ['@svgr/webpack', 'url-loader'],
            },
            {
                test: /\.(png|jpg|jpeg)$/,
                type: 'asset/resource',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
        }),
        // new CopyWebpackPlugin({
        //     patterns: [
        //         {
        //             from: './src/images',
        //             to: 'images',
        //         },
        //     ],
        // }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'build'),
        },
        port: 8080,
        historyApiFallback: true,
    },
};
