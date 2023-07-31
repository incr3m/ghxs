// eslint-disable-next-line no-undef
module.exports = {
  branch: process.env.AWS_BRANCH,
  amplifyAppId: process.env.AWS_APP_ID,
  region: process.env.AWS_REGION,
  jobId: process.env.AWS_JOB_ID,
  commitId: process.env.AWS_COMMIT_ID,
  userBranch: process.env.USER_BRANCH,
};
