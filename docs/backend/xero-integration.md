## Embrace Xero Integration

Resources:
[Xero-node library](https://github.com/XeroAPI/xero-node)
[Xero Webhook Docs](https://developer.xero.com/documentation/guides/webhooks/overview/)

### [Diagram](https://excalidraw.com/#json=uk9hk1UhDRIzcFVlJKcML,41m2cgDDsrFnr-WC8uLl-g)
![image](https://user-images.githubusercontent.com/3125784/173294500-f86224e4-9b31-41bd-aace-ae93cebfaa55.png)

- All instance xero related logic are contained in [embraceXeroFn](https://github.com/moreton-blue-software/embrace-v2/tree/master/cdk-backend/lib/lambda/legacy-functions/embraceXeroFn) directory
- Embrace instances connect to [Embrace Core Backend](https://github.com/moreton-blue-software/mb-devops/tree/dev/amplify/backend/function/embCoreBackend) Xero service to register all tokens then it used by that service to transmit all received webhook events to the respective instance
