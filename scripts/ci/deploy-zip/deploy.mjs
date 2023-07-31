import AWS from 'aws-sdk';
import fs from 'fs';
// import * as url from 'url';
import AdmZip from 'adm-zip';
import config from './config.js';

// const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const [branchName, directory] = process.argv.slice(2);

const zipPath = `${directory}.zip`;

const zip = new AdmZip();
// zip.addLocalFolder(directory);
fs.readdirSync(directory).forEach(dirNext => {
  console.log(`zipping :${dirNext}`);
  const filePath = `${directory}/${dirNext}`;
  const isDir = fs.lstatSync(filePath).isDirectory();
  if (isDir) zip.addLocalFolder(filePath, dirNext);
  else zip.addLocalFile(filePath);
});

zip.writeZip(zipPath);
// process.exit(0);

const PRJ = config.prj;
const STATIC_HOSTING_APP_ID = config.staticHostingAppId;
const S3_BUCKET_NAME = config.s3BucketName;

const amplify = new AWS.Amplify({ region: config.region });

const s3 = new AWS.S3({ region: config.region });

const appId = STATIC_HOSTING_APP_ID;

try {
  await amplify
    .createBranch({
      appId,
      branchName,
    })
    .promise();
} catch (err) {
  console.log('>>deploy-zip/deploy::', 'err: ', err.message); //TRACE
  console.log('>>deploy-zip/index::', 'branch exists: ', branchName); //TRACE
}

const { jobSummaries } = await amplify
  .listJobs({
    appId,
    branchName,
    maxResults: 1,
  })
  .promise();

console.log('>>deploy-zip/index::', 'jobSummaries', jobSummaries); //TRACE

const lastJob = jobSummaries[0];
if (lastJob && lastJob.status === 'PENDING') {
  console.log('>>deploy-zip/index::', 'job is ongoing'); //TRACE
  await amplify.stopJob({ appId, branchName, jobId: lastJob.jobId }).promise();
}

function uploadToS3(fileName, s3Key) {
  const readStream = fs.createReadStream(fileName);

  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: `${PRJ}/${branchName}/${s3Key}`,
    Body: readStream,
    // ACL: 'public-read',
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, function (err, data) {
      readStream.destroy();

      if (err) return reject(err);

      return resolve(data);
    });
  });
}

const data = await uploadToS3(zipPath, `${branchName}/${branchName}.zip`);
console.log('>>deploy-zip/index::', 'data', data); //TRACE

if (!data.Location) throw new Error("Can't get data location");

await amplify
  .startDeployment({
    appId,
    branchName,
    sourceUrl: `s3://${data.Bucket}/${data.Key}`,
  })
  .promise();

const reviewUrl = `https://${branchName}.${appId}.amplifyapp.com`;
console.log('>>deploy-zip/index::', 'url', reviewUrl); //TRACE
