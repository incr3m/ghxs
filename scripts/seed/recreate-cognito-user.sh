AWS_PROFILE=mb-jim aws cognito-idp admin-create-user \
    --user-pool-id ap-southeast-2_8f9bJFUYA \
    --username jim@moretonblue.com \
    --user-attributes Name="email",Value="jim@moretonblue.com" Name="custom:id",Value="5cda30d0-90e1-44f1-9a6e-af0869f70b51" \
    --message-action SUPPRESS \
    --temporary-password 1234qwer!