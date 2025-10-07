import { defineConfig } from 'orval'

export default defineConfig({
  myApi: {
    input: './openapi.yaml',
    output: {
      target: './src/api/endpoints.ts',
      client: 'fetch',
      schemas: './src/api/model',
      override: true,
    },
  },
})
