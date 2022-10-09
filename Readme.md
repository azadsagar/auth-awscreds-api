# auth-awscreds Backend API

This is backend API for [auth-awscreds](https://github.com/azadsagar/auth-awscreds) project.

## How to deploy ?
 Create a .env file in project directory and add below environment variables. Set appropriate values as per your infrastructure environment.

 ```
 AWSREGION=
COGNITO_USER_POOL_ID=
IDENTITY_POOL_ID=
COGNITOIDP=
APP_CLIENT_ID=
IAM_ROLE_ARN=
DEPLOYMENT_BUCKET=
APP_DOMAIN=
```

Run `npm install` and `npx serverless deploy`