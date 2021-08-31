"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = loader;
exports.raw = void 0;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _sharp = _interopRequireDefault(require("sharp"));

var _loaderUtils = require("loader-utils");

var _schemaUtils = require("schema-utils");

var _mimeTypes = _interopRequireDefault(require("mime-types"));

var _options = _interopRequireDefault(require("./options.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const jpegType = {
  "image/jpeg": "jepg"
};

function getMimetype(mimetype, resourcePath) {
  if (typeof mimetype === 'boolean') {
    if (mimetype) {
      const resolvedMimeType = _mimeTypes.default.contentType(_path.default.extname(resourcePath));

      if (!resolvedMimeType) {
        return '';
      }

      return resolvedMimeType.replace(/;\s+charset/i, ';charset');
    }

    return '';
  }

  if (typeof mimetype === 'string') {
    return mimetype;
  }

  const resolvedMimeType = _mimeTypes.default.contentType(_path.default.extname(resourcePath));

  if (!resolvedMimeType) {
    return '';
  }

  return resolvedMimeType.replace(/;\s+charset/i, ';charset');
}

function getEncoding(encoding) {
  if (typeof encoding === 'boolean') {
    return encoding ? 'base64' : '';
  }

  if (typeof encoding === 'string') {
    return encoding;
  }

  return 'base64';
}

function getEncodedData(mimetype, encoding, content) {
  return `data:${mimetype}${encoding ? `;${encoding}` : ''},${content.toString( // eslint-disable-next-line no-undefined
  encoding || undefined)}`;
}

function loader(content) {
  this.cacheable();
  const loaderCallback = this.async();
  const loaderContext = this;
  const {
    resourcePath
  } = this; // Loader Options

  const options = (0, _loaderUtils.getOptions)(loaderContext) || {};
  const limit = options.limit || 1000;
  const context = options.context || this.rootContext;
  const minimizerOptions = options.minimizerOptions || {};

  const ext = _path.default.extname(resourcePath).replace(/\./, '');

  const name = options.name || 'img/[name].[contenthash:7].[ext]';
  const returnFormatType = options.returnFormatType;
  (0, _schemaUtils.validate)(_options.default, options, {
    name: 'Sharp Image Minizer Loader',
    baseDataPath: 'options'
  });
  const promiseSharp = [];
  const sharpOpt = {
    failOnError: false
  };
  const mimeTypes = new Set(['webp', 'avif']);

  if (ext === '.gif') {
    sharpOpt.animated = true;
  }

  if (mimeTypes.has(ext)) {
    mimeTypes.delete(ext);
  }

  mimeTypes.add(ext);
  const jpegOpts = {
    progressive: true,
    quality: 80,
    mozjpeg: true
  };
  const pngOpts = {
    progressive: true,
    quality: 60,
    compressionLevel: 8
  };
  const esModule = typeof options.esModule !== 'undefined' ? options.esModule : false;
  const sharpStream = (0, _sharp.default)(sharpOpt).rotate();

  for (const mType of mimeTypes) {
    const mimeType = _mimeTypes.default.contentType(_path.default.extname(resourcePath));

    const suffix = jpegType[mimeType] || mType;
    const opts = {};
    let formatOpts = minimizerOptions[suffix] || {};

    if (suffix === 'png') {
      Object.assign(opts, pngOpts, formatOpts);
    }

    if (suffix === 'jpeg') {
      Object.assign(opts, jpegOpts, formatOpts);
    }

    promiseSharp.push(sharpStream.clone().toFormat(mType, opts).toBuffer().then(function (data) {
      // console.log(data)
      return {
        mime: mType,
        data
      };
    }));
  }

  _fs.default.createReadStream(resourcePath).pipe(sharpStream);

  return Promise.all(promiseSharp).then(function (arr) {
    let str = '';
    let url = '';

    for (let i = arr.length; i--;) {
      const {
        mime,
        data
      } = arr[i];

      if (i === arr.length - 1) {
        if (data.length < limit) {
          const mimetype = getMimetype(options.mimetype, resourcePath);
          const encoding = getEncoding(options.encoding);
          const encodedData = getEncodedData(mimetype, encoding, data);
          str = `${esModule ? 'export default' : 'module.exports ='} ${JSON.stringify(encodedData)}`; // break , set encode data

          break;
        } else {
          url = (0, _loaderUtils.interpolateName)(loaderContext, name, {
            context,
            content: data
          });
          loaderContext.emitFile(url, data);
          const suffix = mimeTypes.has(returnFormatType) ? '.' + returnFormatType : '';
          const publicPath = `__webpack_public_path__ + ${JSON.stringify(url + suffix)}`;
          str = `${esModule ? 'export default' : 'module.exports ='} ${publicPath};`;
        }
      } else {
        const name = url + '.' + mime;
        loaderContext.emitFile(name, data);
      }
    }

    return loaderCallback(null, str);
  }); // const transformer = sharp(content, sharpOpt)
  // return transformer.toFormat(ext, formatObj).toBuffer().then(async function (data) {
  //   const esModule = typeof options.esModule !== 'undefined' ? options.esModule : false
  //   if (data.length > limit) {
  //     const url = interpolateName(loaderContext, name, {
  //       context,
  //       content: data
  //     })
  //     const outputPath = url
  //     loaderContext.emitFile(url, data)
  //     for (const mimeType of mimeTypes) {
  //       promiseSharp.push(
  //         sharp(data, sharpOpt).toFormat(mimeType, {...minimizerOptions[mimeType]}).toBuffer().then(function (data) {
  //           const name = url + '.' + mimeType
  //           loaderContext.emitFile(name, data)
  //         })
  //       )
  //     }
  //     await Promise.all(promiseSharp)
  //     const suffix = mimeTypes.has(returnFormatType) ? '.' + returnFormatType : ''
  //     const publicPath = `__webpack_public_path__ + ${JSON.stringify(outputPath + suffix)}`
  //     const str = `${esModule ? 'export default' : 'module.exports ='} ${publicPath};`
  //     return loaderCallback(null, str)
  //   } else {
  //     const mimetype = getMimetype(options.mimetype, resourcePath)
  //     const encoding = getEncoding(options.encoding)
  //     const encodedData = getEncodedData(
  //       mimetype,
  //       encoding,
  //       data
  //     )
  //     const str = `${
  //       esModule ? 'export default' : 'module.exports ='
  //     } ${JSON.stringify(encodedData)}`
  //     return loaderCallback(null, str)
  //   }
  // })
} // Loader Mode


const raw = true;
exports.raw = raw;