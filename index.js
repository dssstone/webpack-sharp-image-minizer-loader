import path from 'path';
import sharp from 'sharp';
import { getOptions, interpolateName } from 'loader-utils';
import { validate } from 'schema-utils';
import mime from 'mime-types';
import schema from './options.json';
function getMimetype (mimetype, resourcePath) {
  if (typeof mimetype === 'boolean') {
    if (mimetype) {
      const resolvedMimeType = mime.contentType(path.extname(resourcePath))

      if (!resolvedMimeType) {
        return ''
      }

      return resolvedMimeType.replace(/;\s+charset/i, ';charset')
    }

    return ''
  }

  if (typeof mimetype === 'string') {
    return mimetype
  }

  const resolvedMimeType = mime.contentType(path.extname(resourcePath))

  if (!resolvedMimeType) {
    return ''
  }

  return resolvedMimeType.replace(/;\s+charset/i, ';charset')
}
function getEncoding (encoding) {
  if (typeof encoding === 'boolean') {
    return encoding ? 'base64' : ''
  }

  if (typeof encoding === 'string') {
    return encoding
  }

  return 'base64'
}
function getEncodedData (mimetype, encoding, content) {
  return `data:${mimetype}${encoding ? `;${encoding}` : ''},${content.toString(
    // eslint-disable-next-line no-undefined
    encoding || undefined
  )}`
}
export default function loader (content) {
  this.cacheable()
  const loaderCallback = this.async()
  const loaderContext = this
  const { resourcePath } = this
  // Loader Options
  const options = getOptions(loaderContext) || {}
  const limit = options.limit || 1000
  const context = options.context || this.rootContext
  const ext = path.extname(resourcePath).replace(/\./, '')
  const name = options.name || 'img/[name].[contenthash:7].[ext]'
  const returnFormatType = options.returnFormatType
  validate(schema, options, {
    name: 'Sharp Image Minizer Loader',
    baseDataPath: 'options',
  });
  const promiseSharp = []
  const sharpOpt = {
    failOnError: false
  }
  const mimeTypes = new Set(['webp', 'avif'])
  if (ext === '.gif') {
    sharpOpt.animated = true
  }
  if (mimeTypes.has(ext)) {
    mimeTypes.delete(ext)
  }
  const jgepOpts = {
    mozjpeg: true
  }
  const pngOpts = {
    compressionLevel: 8
  }
  let formatObj = {
    quality: 80,
    progressive: true
  }
  if (ext === 'png') {
    formatObj = Object.assign(formatObj, pngOpts)
  }
  if (['jpg', 'jpeg'].includes(ext)) {
    formatObj = Object.assign(formatObj, jgepOpts)
  }

  const transformer = sharp(content, sharpOpt)
  return transformer.toFormat(ext, formatObj).toBuffer().then(async function (data) {
    const esModule = typeof options.esModule !== 'undefined' ? options.esModule : false
    if (data.length > limit) {
      const url = interpolateName(loaderContext, name, {
        context,
        content: data
      })
      const outputPath = url
      loaderContext.emitFile(url, data)
      for (const mimeType of mimeTypes) {
        promiseSharp.push(
          sharp(data, sharpOpt).toFormat(mimeType).toBuffer().then(function (data) {
            const name = url + '.' + mimeType
            loaderContext.emitFile(name, data)
          })
        )
      }
      await Promise.all(promiseSharp)
      const suffix = mimeTypes.has(returnFormatType) ? '.' + returnFormatType : ''
      const publicPath = `__webpack_public_path__ + ${JSON.stringify(outputPath + suffix)}`

      const str = `${esModule ? 'export default' : 'module.exports ='} ${publicPath};`
      return loaderCallback(null, str)
    } else {
      const mimetype = getMimetype(options.mimetype, resourcePath)
      const encoding = getEncoding(options.encoding)
      const encodedData = getEncodedData(
        mimetype,
        encoding,
        data
      )
      const str = `${
        esModule ? 'export default' : 'module.exports ='
      } ${JSON.stringify(encodedData)}`

      return loaderCallback(null, str)
    }
  })
}


// Loader Mode
export const raw = true;
