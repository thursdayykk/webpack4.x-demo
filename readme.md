# webpack 运行流程

webpack 的运行流程是一个串行的过程，从启动到结束会依次执行一下流程：

1. 初始化参数：从配置文件和 shell 语句中读取与合并参数，得出最终的参数
2. 开始编译：用上一步得到的参数初始化 Compiler 对象，加载所有配置的插件，执行对象的 run 方法开始执行编译
3. 确定入口：根据配置中的 entry 找出所有的入口文件
4. 编译模块：从入口文件出发，调用所有配置的 loader 对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
5. 完成模块编译：在经过第四步使用 loader 翻译完所有模块后，得到了每个模块被翻译后的内容，以及他们之间的依赖关系
6. 输出资源：根据入口和模块之间的依赖关系，组成一个个包含多个模块的 chunk，再把每个 chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会。
7. 输出完成：在确定好输出内容后，根据配置确定输出和路径和文件名，把文件内容写入到文件系统。

### 流程细节

webpack 构建流程大致可以分为以下三个阶段

1. 初始化：启动构建，读取并合并配置，加载 plugin，实例化 Compiler。
2. 编译：从 entry 出发，针对每个模块串行调用对应的 loader 去翻译文件内容，再找到该模块依赖的模块，递归进行编译处理
3. 输出：对编译后的模块组合成 chunk，把 chunk 转换成文件，输出到文件系统

> Compiler 负责文件监听和启动编译。 Compiler 实例中包含了完整的 Webpack 配置，全局只有一个 Compiler 实例。

### 输出文件 bundle.js

实际上是一个立即执行函数，简写如下

```js
;(function (modules) {
  // 模拟 require 语句
  function __webpack_require__() {
    // 类似node中的require
  }
  // 执行存放所有模块数组中的第0个模块
  __webpack_require__(0)
})([
  /*存放所有模块的数组*/
])
```

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

# 常用 Loader

loader 用于对模块的源代码进行转换，可以使你在 import 或加载模块时预处理文件。

- style-loader：将 css 文件的内容添加到头部标签 style 里
- css-loader：允许将 css 文件通过 require 的方式引入，并返回 css 代码
- less-loader：处理 less
- sass-loader:处理 sass
- postcss-loader: 用 postcss 处理 css
- file-loader；分发文件到 output 目录并返回相对路径
- url-loader：和 file-loader 类型，但文件小于设定是返回 base64
- html-minify-loader：压缩 html 文件
- babel-loader：ES6 转 ES5

#### loader 特性

- 从右到左的取值执行
- 支持链式传递
- 可以内联显示指定
- 可以同步，可以异步
- 运行在 node.js，并且能够执行任何 Node.js 能做到的操作
- loader 可以通过 options 对象配置
