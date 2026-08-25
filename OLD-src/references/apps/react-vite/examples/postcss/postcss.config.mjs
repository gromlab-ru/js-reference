import postcssGlobalData from '@csstools/postcss-global-data'
import autoprefixer from 'autoprefixer'
import postcssCustomMedia from 'postcss-custom-media'
import postcssNesting from 'postcss-nesting'

export default {
  plugins: [
    postcssGlobalData({ files: ['src/shared/styles/media.css'] }),
    postcssCustomMedia(),
    postcssNesting(),
    autoprefixer()
  ]
}
