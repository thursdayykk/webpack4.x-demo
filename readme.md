# 哈希值

- hash
  - 所有文件哈希值相同，只要改变内容跟之前的不一致，所有 hash 值都改变，没有做到缓存的意义。
  - hash 跟整个项目构建相关，所有文件 hash 相同，只要其中有一个文件改了，那么整个项目构建的 hash 值都会更改。
- chunkHash（用的比较多）
  - 同一个模块，就算将 js 和 css 分离，其哈希值也是相同的，修改一处，js 和 css 哈希值都会变，同 hash，没有做到缓存的意义。
  - 它根据不同的入口文件进行依赖文件解析，构建对应的 chunk，生成对应的 hash 值。
    - 我们在生产环境里把一些公共库入口文件区分开，单独打包构建，接着我们采用 chunkhash 的方式生成 hash 值，那么只要我们不改动公共库的代码，就可以保证其 hash 值不受影响。
    - 采用 chunkhash，所以项目主入口文件 main.js 及依赖文件 main.css 由于被打包在同一个模块，会共用 chunkhash
- contenthash

  - 只要文件内容改变，hash 值就会改变
  - css 文件最好使用 contenthash

```
 output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: '[name].[chunkHash:8].js', // hash是为了文件更新 避免有缓存
  },
```

# css 自动添加前缀

1. postcss-loader autoprefixer
2. `'postcss-loader'`写在 css-loader 后面
3. 新增 postcss.config.js 文件，使用插件 autoprefixer
4. package.json 里添加`browserslist`

autoprefixer 是 读取 can i use 的 api，去检查你所用属性的一些兼容性，添加不同的前缀。

# 处理图片资源、字体文件

1. file-loader（找路径） url-loader(压缩)
2. ```
   {
          test: /\.(png|jpg|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'static/images/[name].[ext]',
                publicPath: '/',
              },
            },
          ],
        },
   ```

```
3. url-loader:超出某个大小的时候会转换成base64，没有超出的话默认用file-loader处理
```

{ loader: 'url-loader', options: { limit: 81920000, }, },

````
4. file-loader、url-loader配置共存的时候会处理两次，实际上url-loader包含了file-loader，可以配置合并，只需要下载一个就行了
```js
 {
      loader: 'url-loader',
      options:512,
        name: 'static/images/[name].[ext]',
        publicPath: '/',
      },
},
````

5. 有时候不需要处理字体文件，直接 copy 到 dist 下就行了使用`copy-webpack-plugin`
1. ```
   new CopyWebpackPlugin({
       patterns: [
         {
           from: path.resolve(process.cwd(), 'src/static'),
           to: path.resolve(process.cwd(), 'dist/static'),
         },
       ],
     }),
   ```

#### 使用 babel

1. `cnpm i -D babel-loader @babel/core @babel/preset-env`
2. rules 添加规则

```
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
```
