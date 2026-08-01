import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import { defineConfig } from 'rollup';

const name = 'VanillaDatepicker';
const input = 'src/index.ts';

export default defineConfig([
  {
    input,
    output: [
      {
        file: 'dist/datepicker.esm.js',
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'dist/datepicker.cjs.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
    ],
    plugins: [
      resolve(),
      typescript({ tsconfig: './tsconfig.json', declaration: false, declarationDir: undefined, sourceMap: true }),
      postcss({ extract: 'datepicker.css', minimize: false }),
    ],
  },
  {
    input,
    output: {
      file: 'dist/datepicker.umd.js',
      format: 'umd',
      name,
      sourcemap: true,
    },
    plugins: [
      resolve(),
      typescript({ tsconfig: './tsconfig.json', declaration: false, declarationDir: undefined, sourceMap: true }),
      postcss({ extract: false, inject: false }),
      terser(),
    ],
  },
]);
