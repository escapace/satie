import config from 'eslint-config-escapace'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    languageOptions: {
      parserOptions: {
        project: ['./packages/*/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  ...config
)
