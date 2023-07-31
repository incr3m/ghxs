/* eslint-disable no-undef */
const [, , , opt] = process.argv;

console.log('>>cdk-builder/build::', 'opt', opt); //TRACE
const isBackendOnly = opt === 'BACKEND_ONLY';

const embraceEcrRepo =
  process.env.ECR_REPO_URI ||
  '265681005590.dkr.ecr.ap-southeast-2.amazonaws.com/embracebuild-embracerepo4f6e8c6e-g2p9usbynjy6';
const commitHash = process.env.CODEBUILD_RESOLVED_SOURCE_VERSION || 'no-hash';

function createImageUri(name, version) {
  return `${embraceEcrRepo}:${name}.${version}`;
}

function createBuildArg(values) {
  let buildArg = '';
  Object.entries(values).forEach(([key, val]) => {
    if (!val) return;
    if (!buildArg) buildArg = '--build-arg';
    buildArg += ` ${key}=${val}`;
  });

  console.log('>>cdk-builder/build::', 'buildArgs', buildArg); //TRACE

  return buildArg.split(' ');
}

const clientImageUri = createImageUri('client', commitHash);
await $`docker build -f Dockerfile . -t ${clientImageUri} ${createBuildArg({
  ENV: isBackendOnly ? 'test' : null,
})}`;

// move to backend dir
cd('cdk-backend');

const backendImageUri = createImageUri('backend', commitHash);
await $`docker build -f Dockerfile . -t ${backendImageUri}`;

const embImageUri = createImageUri('emb', commitHash);
await $`docker build -f EmbArtifact.Dockerfile . -t ${embImageUri} \
--build-arg CDK_IMAGE=${backendImageUri} \
--build-arg CLIENT_IMAGE=${clientImageUri} \
--build-arg COMMIT_HASH=${commitHash}`;

// process.env.BACKEND_IMAGE_URI = backendImageUri;
// process.env.CLIENT_IMAGE_URI = clientImageUri;
// process.env.EMB_IMAGE_URI = embImageUri;

await Promise.all([
  $`docker push ${backendImageUri}`,
  $`docker push ${clientImageUri}`,
  $`docker push ${embImageUri}`,
]);
