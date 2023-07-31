## Switching back from AWS Opensearch:

1. Disable/comment out ci scripts.
   ![image](https://user-images.githubusercontent.com/3125784/90083673-c53fdc00-dd45-11ea-9db9-b6cb3ad1b1ec.png)

2) Push and wait until console build is completed.
   ![image](https://user-images.githubusercontent.com/3125784/90083691-d2f56180-dd45-11ea-8200-f5b0a45f3ebd.png)

3. Run the backfill script.
   command:

```
  node scripts/backfill/reindex.js <table-name>
```

example:

```
  node scripts/backfill/reindex.js User
```

## Fix Opensearch data not syncing

1. Go to mbDev ddb to [es lambda stream function](https://ap-southeast-2.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-2#logsV2:log-groups/log-group/$252Faws$252Flambda$252FmbDev-EsDdbLambdaStreamFunction/log-events$3Fstart$3D-60000)

   ![image](https://user-images.githubusercontent.com/3125784/236385724-c2abd3f3-bed5-42cb-873c-2bd8419f939c.png)

2. Check the data causing sync errors

   ![image](https://user-images.githubusercontent.com/3125784/236386165-fbb1c8da-6491-47b8-af33-65755e02273c.png)

3. Stop [lambda stream function](https://ap-southeast-2.console.aws.amazon.com/lambda/home?region=ap-southeast-2#/functions/mbDev-EsDdbLambdaStreamFunction?tab=configure) from processing by settings `DISABLE_STREAM` env value to `1`

   ![image](https://user-images.githubusercontent.com/3125784/236386368-452fd471-fe17-48d6-8677-c045a86a1e19.png)

4. Delete dev index in [Opensearch Console](https://search-dev-mb-os-domain-gszapqmdqz3uhpa4gueocs3754.ap-southeast-2.es.amazonaws.com/_dashboards/app/dev_tools#/console)

   ![image](https://user-images.githubusercontent.com/3125784/236387192-1db965b9-815e-4b07-94e8-2dcf680809a8.png)

5. Re-enable sync stream on lambda by settings `DISABLE_STREAM` env back to `0`.
6. Run backfill script to to recreate the index.
   ```
      AWS_PROFILE=mb-jim node scripts/backfill/reindex.js Project
   ```
7. Check if syncing issues have been resolved.
