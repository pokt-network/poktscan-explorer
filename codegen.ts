import type { CodegenConfig } from '@graphql-codegen/cli'
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

let graphqlApiUrl = process.env.GRAPHQL_API_URL;
if (!graphqlApiUrl || graphqlApiUrl === "") {
  // this should be normally where in development would be the subquery query client.
  graphqlApiUrl = "http://localhost:3000"
}

const config: CodegenConfig = {
  schema: graphqlApiUrl,
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
