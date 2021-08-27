# webpack-sharp-image-minizer-loader

A loader for webpack which transforms files into base64 URIs.

## Getting Started

To begin, you'll need to install `webpack-sharp-image-minimizer-loader`:

```console
$ npm install webpack-sharp-image-minimizer-loader --save-dev
```

`webpack-sharp-image-minimizer-loader` works like
[`url-loader`](https://github.com/webpack-contrib/url-loader), can return
a DataURL if the image is smaller than a byte limit, this loader can also minimizer image and generate webp and avif image type file

**index.js**

```js
import img from './image.png';
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
        use: [
          {
            loader: 'webpack-sharp-image-minimizer-loader',
            options: {
              limit: 5000,
            },
          },
        ],
      },
    ],
  },
};
```

And run `webpack` via your preferred method.

## Options

|             Name              |            Type             |                            Default                            | Description                                                                         |
| :---------------------------: | :-------------------------: | :-----------------------------------------------------------: | :---------------------------------------------------------------------------------- |
|     **[`limit`](#limit)**     |       `{Number}`            |                            `1000`                             | Specifying the maximum size of a file in bytes.                                     |
|  **[`mimetype`](#mimetype)**  |     `{Boolean\|String}`     | based from [mime-types](https://github.com/jshttp/mime-types) | Sets the MIME type for the file to be transformed.                                  |
|  **[`encoding`](#encoding)**  |     `{Boolean\|String}`     |                           `base64`                            | Specify the encoding which the file will be inlined with.                           |                 |
|  **[`esModule`](#esmodule)**  |         `{Boolean}`         |                            `false`                             | Use ES modules syntax.      
|  **[`minimizerOptions`](#minimizerOptions)**  |         `{Object}`         |                            `{}`                             | configuration of image type.    

### `limit`

Type: `Number`
Default: `1000`

The limit can be specified via loader options and defaults to no limit.

#### `Boolean`

Enable or disable transform files into base64.

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|webp|avif)$/i,
        use: [
          {
            loader: 'webpack-sharp-image-minimizer-loader',
            options: {
              limit: false,
            },
          },
        ],
      },
    ],
  },
};
```

#### `Number|String`

A `Number` or `String` specifying the maximum size of a file in bytes.
If the file size is **equal** or **greater** than the limit [`file-loader`](https://github.com/webpack-contrib/file-loader) will be used (by default) and all query parameters are passed to it.

Using an alternative to `file-loader` is enabled via the `fallback` option.

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|webp|avif)$/i,
        use: [
          {
            loader: 'webpack-sharp-image-minimizer-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
    ],
  },
};
```

### `mimetype`

Type: `Boolean|String`
Default: based from [mime-types](https://github.com/jshttp/mime-types)

Specify the `mimetype` which the file will be inlined with.
If unspecified the `mimetype` value will be used from [mime-types](https://github.com/jshttp/mime-types).

#### `Boolean`

The `true` value allows to generation the `mimetype` part from [mime-types](https://github.com/jshttp/mime-types).
The `false` value removes the `mediatype` part from a Data URL (if omitted, defaults to `text/plain;charset=US-ASCII`).

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|webp|avif)$/i,
        use: [
          {
            loader: 'webpack-sharp-image-minimizer-loader',
            options: {
              mimetype: false,
            },
          },
        ],
      },
    ],
  },
};
```

#### `String`

Sets the MIME type for the file to be transformed.

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|webp|avif)$/i,
        use: [
          {
            loader: 'webpack-sharp-image-minimizer-loader',
            options: {
              mimetype: 'image/png',
            },
          },
        ],
      },
    ],
  },
};
```

### `encoding`

Type: `Boolean|String`
Default: `base64`

Specify the `encoding` which the file will be inlined with.
If unspecified the `encoding` will be `base64`.

#### `Boolean`

If you don't want to use any encoding you can set `encoding` to `false` however if you set it to `true` it will use the default encoding `base64`.

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|webp|avif)$/i,
        use: [
          {
            loader: 'webpack-sharp-image-minimizer-loader',
            options: {
              encoding: false,
            },
          },
        ],
      },
    ],
  },
};
```

#### `String`

It supports [Node.js Buffers and Character Encodings](https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings) which are `["utf8","utf16le","latin1","base64","hex","ascii","binary","ucs2"]`.

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|webp|avif)$/i,
        use: [
          {
            loader: 'webpack-sharp-image-minimizer-loader',
            options: {
              encoding: 'utf8',
            },
          },
        ],
      },
    ],
  },
};
```

### `esModule`

Type: `Boolean`
Default: `false`

You can enable a CommonJS module syntax using:

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
        use: [
          {
            loader: 'webpack-sharp-image-minimizer-loader',
            options: {
              esModule: false,
            },
          },
        ],
      },
    ],
  },
};
```

### minimizerOptions

Type: `Object`
Default: `{}`
options config of [sharp](https://sharp.pixelplumbing.com/api-output)
**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
        use: [
          {
            loader: 'webpack-sharp-image-minimizer-loader',
            options: {
              minimizerOptions: {
                png: {
                  progressive: true,
                  quality: 60
                },
                jpeg: {},
                avif: {},
                webp: {}
              },
            },
          },
        ],
      },
    ],
  },
};
```
