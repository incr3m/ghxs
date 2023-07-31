import AWS from 'aws-sdk';
import config from './config.js';

const [branchName] = process.argv.slice(2);

const PRJ = config.prj;
const STATIC_HOSTING_APP_ID = config.staticHostingAppId;
const S3_BUCKET_NAME = config.s3BucketName;

const amplify = new AWS.Amplify({
  region: config.region,
});

const s3 = new AWS.S3({
  region: config.region,
});

const appId = STATIC_HOSTING_APP_ID;

try {
  await amplify
    .deleteBranch({
      appId,
      branchName,
    })
    .promise();
} catch (err) {
  console.log('>>deploy-zip/index::', 'failed to remove branch', branchName); //TRACE
  console.log('>>deploy-zip/index::', err.code, err.message); //TRACE
  throw err;
}

const emptyS3Directory = async (bucket, dir) => {
  const listedObjects = await s3
    .listObjectsV2({
      Bucket: bucket,
      Prefix: dir,
      MaxKeys: 100,
    })
    .promise();

  if (listedObjects.Contents.length === 0) return;

  const deleteParams = {
    Bucket: bucket,
    Delete: {
      Objects: [],
    },
  };

  deleteParams.Delete.Objects = listedObjects.Contents.map(obj => {
    console.log('>>deploy-zip/destroy::', 'deleting object', obj.Key); //TRACE
    return {
      Key: obj.Key,
    };
  });

  await s3.deleteObjects(deleteParams).promise();
  if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir);
};

const folderName = `${PRJ}/${branchName}`;

await emptyS3Directory(S3_BUCKET_NAME, folderName);
