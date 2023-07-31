/**
 * zx scripts/ci/deploy-zip/clear-unused-reviews.mjs <branch_name_prefix>
 *
 * requirements:
 *  - gh cli https://cli.github.com/
 */
import AWS from 'aws-sdk';
import config from './config.js';

const res = await $`gh pr list --json number`;

const [branchNamePrefix] = process.argv.slice(3);

const prs = JSON.parse(res);

const amplify = new AWS.Amplify({
  region: config.region,
});

try {
  const res = await amplify
    .listBranches({ appId: config.staticHostingAppId, maxResults: 50 })
    .promise();

  if (res.nextToken) throw new Error('Branches exceed 50 limit');

  const prNumbers = new Set(prs.map(pr => `${branchNamePrefix}${pr.number}`));
  let removedCount = 0;
  for (const b of res.branches) {
    if (!b.branchName.startsWith(branchNamePrefix)) continue;
    if (!prNumbers.has(b.branchName)) {
      console.log(
        '>>deploy-zip/clear-unused-reviews::',
        'clearing deployed branch: ',
        b.branchName
      ); //TRACE
      await $`node scripts/ci/deploy-zip/destroy.mjs ${b.branchName}`;
      removedCount++;
    }
  }

  console.log('>>deploy-zip/clear-unused-reviews::', 'removed count:', removedCount); //TRACE
} catch (err) {
  console.log('>>deploy-zip/deploy::', 'err: ', err.message); //TRACE
}
