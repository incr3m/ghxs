module.exports = {
  projects: {
    app: {
      schema: './public/schema.json',
      documents: ['src/**/*.{graphql,js,ts,jsx,tsx}'],
      extensions: {
        endpoints: {
          default: {
            url:
              'https://4bvb3mj5ezbpfel5xhxi3ep7z4.appsync-api.ap-southeast-2.amazonaws.com/graphql',
            headers: {
              'x-api-key:': 'da2-ptojoia6ufb53fqzer4hivz2yu',
            },
          },
        },
      },
    },
    backend: {
      documents: ['cdk-backend/**/*.graphql'],
      exclude: ['cdk-backend/**/*.graphql'],
    },
  },
};
