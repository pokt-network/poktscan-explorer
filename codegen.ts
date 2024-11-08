import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'http://localhost:3000',
  documents: ['app/**/*.ts*'],
  generates: {
    './app/config/gql/': {
      preset: 'client',
    },
    './schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true
      }
    }
  }
}
export default config
