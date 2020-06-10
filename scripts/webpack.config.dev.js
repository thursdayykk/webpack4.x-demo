const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
module.exports = {
  mode: 'development',
  entry: {
    main: './src/index.js',
    about: './src/about.js',
  },
  output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: 'js/[name].[chunkHash:8].js', // hash是为了文件更新 避免有缓存
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        //use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'], // style-loader 创建style标签把css样式放进去
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.less$/,
        use: [
          'style-loader', // 开发模式下用style-loader就可以了
          'css-loader',
          // 'postcss-loader',  // 开发模式下不需要用postcss-loader
          {
            // loader的两种写法 可以是个对象
            loader: 'less-loader',
            options: {}, //一些额外的配置
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          // {
          //   loader: 'file-loader',
          //   options: {
          //     name: 'static/images/[name].[ext]',
          //     publicPath: '/',
          //   },
          // },
          {
            loader: 'url-loader',
            options: {
              limit: 512,
              name: 'images/[name].[ext]',
              publicPath: '/',
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/, // 排除这里面的js文件
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new htmlWebpackPlugin({
      title: 'webpack',
      template: 'public/index.html', // 指定html模板
    }),
    new MiniCssExtractPlugin({
      // 将CSS提取为独立的文件的插件 只能用在webpack4中，
      filename: 'css/[name].[contentHash:8].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(process.cwd(), 'src/static'),
          to: path.resolve(process.cwd(), 'dist/static'),
        },
      ],
    }),
  ],
  devServer: {
    port: 3000,
    open: true,
  },
}
