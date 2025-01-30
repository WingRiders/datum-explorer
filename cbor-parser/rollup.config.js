import commonjs from '@rollup/plugin-commonjs'
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const outdir = (fmt, env) => (env === 'node' ? 'node' : fmt)

const rolls = (fmt, env) => ({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: fmt,
    entryFileNames: `${outdir(fmt, env)}/[name].${fmt === 'cjs' ? 'cjs' : 'js'}`,
    name: 'cbor-parser',
  },
  plugins: [
    commonjs(),
    resolve(),
    typescript({
      target: fmt === 'es' ? 'ES2022' : 'ES2017',
      outDir: `dist/${outdir(fmt, env)}`,
      rootDir: 'src',
    }),
  ],
})

export default [
  rolls('umd', 'browser'),
  rolls('es', 'browser'),
  rolls('cjs', 'browser'),
  rolls('cjs', 'node'),
]
