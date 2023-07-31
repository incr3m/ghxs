### BCC Emails

Embrace allows pulling CRM activities from emails. To do that, forward any emails to `bot+<instance_id>@mail.embrace.technology`

![image](https://user-images.githubusercontent.com/3125784/174202169-0e36cc98-8ae0-4448-a2a7-fa73b7f22a96.png)

`instance_id` can be found in client's instance url.

![image](https://user-images.githubusercontent.com/3125784/174202387-7d183cb6-bb22-4f4d-a994-eec97de101a8.png)

#### Development

Embrace integrates with AWS SQS, SNS, S3 for incoming emails. It will then be processed and parsed in [embraceEmailReceiverFn](cdk-backend/lib/lambda/legacy-functions/embraceEmailReceiverFn).
