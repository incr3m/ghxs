const {
  CloudFormationClient,
  DescribeStacksCommand,
} = require('@aws-sdk/client-cloudformation');
const ecr = require('@aws-sdk/client-ecr');

// MANIFEST=$(aws ecr batch-get-image --repository-name amazonlinux --image-ids imageTag=latest --query 'images[].imageManifest' --output text)
// aws ecr put-image --repository-name amazonlinux --image-tag 2017.03 --image-manifest "$MANIFEST"
// aws ecr describe-images --repository-name amazonlinux

async function main() {
  const awsAccountId = process.env.AWS_ACCOUNT_ID || 265681005590;
  const region = process.env.AWS_DEFAULT_REGION || 'ap-southeast-2';

  const stackName = 'EmbImgArtifactStack';

  const ecrClient = new ecr.ECRClient({ region });

  const client = new CloudFormationClient({ region });
  const command = new DescribeStacksCommand({
    StackName: stackName,
  });
  const ds = await client.send(command);

  const acctRepo = `${awsAccountId}.dkr.ecr.${region}.amazonaws.com/`;
  for (const out of ds.Stacks[0].Outputs) {
    if (out.OutputValue.startsWith(acctRepo)) {
      const [repoName, imageTag] = out.OutputValue.replace(acctRepo, '').split(':');
      if (repoName) {
        const ecrImg = await ecrClient.send(
          new ecr.BatchGetImageCommand({
            repositoryName: repoName,
            imageIds: [{ imageTag }],
          }),
        );

        const manifest = ecrImg.images[0].imageManifest;
        if (manifest) {
          const imgHash = process.env.CODEBUILD_RESOLVED_SOURCE_VERSION || 'none';
          const imageTag = `${stackName}.${out.OutputKey}.${imgHash}`;
          await ecrClient
            .send(
              new ecr.PutImageCommand({
                repositoryName: repoName,
                imageTag,
                imageManifest: manifest,
              }),
            )
            .catch(err => {
              if (err.code !== 'ImageAlreadyExistsException') throw err;
            });

          // await ecrClient.send(
          //   new ecr.PutImageCommand({
          //     repositoryName: repoName,
          //     imageTag: `${stackName}.${out.OutputKey}.latest`,
          //     imageManifest: manifest,
          //   }),
          // );

          console.log(
            '>>ci/retag-images:: image tagged',
            `${out.OutputValue} => ${imageTag}`,
          ); //TRACE
        }
      }
    }
  }
}

main();
