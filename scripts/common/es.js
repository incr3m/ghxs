const AWS = require('aws-sdk');

class EsClient {
  domain;
  region;

  #cacheCreds;
  constructor({ domain, region }) {
    this.domain = domain;
    this.region = region;
  }
  #signReq(request) {
    let credentials = this.#cacheCreds;
    if (!credentials) {
      if (process.env.AWS_PROFILE) {
        credentials = new AWS.SharedIniFileCredentials({
          profile: process.env.AWS_PROFILE,
        });
      } else {
        credentials = new AWS.EnvironmentCredentials('AWS');
      }
      this.#cacheCreds = credentials;
    }

    const signer = new AWS.Signers.V4(request, 'es');
    signer.addAuthorization(credentials, new Date());
    AWS.config.credentials = credentials;
  }

  async request({ method = 'GET', path, body }) {
    const client = new AWS.HttpClient();
    const endpoint = new AWS.Endpoint(this.domain);
    const request = new AWS.HttpRequest(endpoint, this.region);

    request.method = method;
    request.path = path;

    request.body = JSON.stringify(body);
    request.headers['host'] = this.domain;
    request.headers['Content-Type'] = 'application/json';
    request.headers['Content-Length'] = request.body?.length || 0;

    this.#signReq(request);

    return new Promise((resolve, reject) => {
      client.handleRequest(
        request,
        null,
        function (response) {
          console.log(`${response.statusCode} ${response.statusMessage}`);
          let responseBody = '';
          response.on('data', function (chunk) {
            responseBody += chunk;
          });
          response.on('end', function () {
            resolve(responseBody);
          });
        },
        function (error) {
          console.log(`Error: ${error}`);
          reject(error);
        },
      );
    });
  }
}

module.exports = {
  EsClient,
};
