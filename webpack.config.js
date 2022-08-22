const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/scripts/index.js',
  devServer: {
    port: 9000,
    hot: true,
    open: true,
    static: {
      directory: path.join(__dirname, './dist'),
    },
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Index',
      template: path.resolve(__dirname, './src/pages/index.html'),
      filename: 'index.html',
    }),
    new HtmlWebpackPlugin({
      title: 'Details',
      template: path.resolve(__dirname, './src/pages/details.html'),
      filename: 'details.html',
    }),
    new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
      // JavaScript
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: 'asset/resource',
      },

      {
        test: /\.json$/i,
        type: 'asset/resource',
      },

      {
        test: /\.html$/i,
        loader: 'html-loader',
      },

      {
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
        type: 'asset/inline',
      },
      {
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },
    ],
  },
};
