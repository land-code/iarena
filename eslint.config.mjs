import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

import noLiteralAppName from './eslint-rules/no-literal-app-name.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname
})

const eslintConfig = [
  {
    ignores: ['src/generated/prisma/**'], // Ignore prisma generated files
  },
  {
    plugins: {
      custom: noLiteralAppName
    },
    rules: {
      'custom/no-literal-app-name': 'warn'
    }
  },
  {
    files: ['src/consts/**'],
    rules: {
      'custom/no-literal-app-name': 'off'
    }
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript')
]

export default eslintConfig
