/* import * as dotenv from 'dotenv';
dotenv.config(); */

const serverless = require("serverless-http");
const { CognitoIdentity, STS } = require("aws-sdk");
const express = require("express");
const bodyParser = require("body-parser");
const { publicEncrypt,constants } =require("crypto");
const cors = require("cors");


const app=express();

app.use(cors());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }));


app.post("/auth-creds",async (req,res)=>{

    try {

        let identityParams = {
            IdentityPoolId: process.env.IDENTITY_POOL_ID,
            Logins: {}
        };
    
        identityParams.Logins[`${process.env.COGNITOIDP}`] = req.headers.authorization;
    
        const ci = new CognitoIdentity({region : process.env.AWSREGION});
    
        let idpResponse = await ci.getId(identityParams).promise();
    
        console.log("Auth Creds Request Received from ",JSON.stringify(idpResponse));
    
        const sts=new STS();

        const {public_key} = req.body;
        
        if (typeof(public_key) === 'undefined'){
            throw {
                status: 400,
                msg: "public_key parameter required",
                success: false
            };
        }

        const pemPublicKey = Buffer.from(public_key,'base64').toString();

        const authdata=await sts.assumeRole({
            ExternalId: process.env.STS_EXTERNAL_ID,
            RoleArn: process.env.IAM_ROLE_ARN,
            RoleSessionName: "DemoAWSAuthSession"
        }).promise();

        const creds = JSON.stringify(authdata.Credentials);
        const splitData = creds.match(/.{1,86}/g);
        
        const encryptedData = splitData.map(d=>{
            return publicEncrypt(pemPublicKey,Buffer.from(d)).toString('base64');
        });


        res.status(200).json({
            status: 200,
            success: true,
            msg: "Ok",
            data: encryptedData
        });

    } catch (error) {
        console.log(error);

        if(typeof(error) === 'object' && "status" in error ){
            res.status(error.status).json(error);
        }
        else{
            res.status(500).json({
                status: 500,
                success: false,
                msg: "Something went wrong while processing request"
            });
        }
    }
    
});

/* const server = app.listen(4000, ()=>{
    console.log("App Started Listening on port 4000");
});
 */
//export default server;

module.exports.start = serverless(app);
//export const start = serverless(app);