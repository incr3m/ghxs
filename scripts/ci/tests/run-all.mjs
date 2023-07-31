// zx
import { request } from '../../common/http.js';
import config from '../config.js';

try {
  // await $`yarn test:backend`;
  await $`yarn test:backend --silent`;
} catch (err) {
  const errorMessage = err.stderr;
  console.log(`Exit code: ${err.exitCode}`);
  console.log(`Error: ${errorMessage}`);

  const chanelWebhookUrl = config.alertWebhookUrl;

  await request(chanelWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    postData: JSON.stringify({
      embeds: [
        {
          title: `Test Error: ${config.projectCode}`,
          color: 16711680,
          description: errorMessage,
          timestamp: new Date(),
        },
      ],
    }),
  });

  throw err;
}
