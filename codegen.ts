import type { CodegenConfig } from '@graphql-codegen/cli'
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

if (!process.env.GRAPHQL_API_URL) {
  throw new Error('GRAPHQL_API_URL is not set');
}

const config: CodegenConfig = {
  schema: process.env.GRAPHQL_API_URL,
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
