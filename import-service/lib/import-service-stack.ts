import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3notifications from 'aws-cdk-lib/aws-s3-notifications';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'ImportBucket', {
      bucketName: process.env.BUCKET_NAME!,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.POST, s3.HttpMethods.PUT],
          allowedOrigins: ['http://localhost:3000', 'https://d24vp0woj6rph4.cloudfront.net'],
          allowedHeaders: ['*'],
        },
      ],
    });

    const sharedLambdaProps: Partial<NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        BUCKET_NAME: process.env.BUCKET_NAME!,
      },
    };

    const importProductsFileLambda = new NodejsFunction(this, 'ImportProductsFileLambda', {
      ...sharedLambdaProps,
      functionName: 'importProductsFile',
      entry: './handlers/importProductsFile.ts',
    });

    bucket.grantReadWrite(importProductsFileLambda);

    const importFileParserLambda = new NodejsFunction(this, 'ImportFileParserLambda', {
      ...sharedLambdaProps,
      functionName: 'importFileParser',
      entry: './handlers/importFileParser.ts',
    });

    bucket.grantReadWrite(importFileParserLambda);
    bucket.grantDelete(importFileParserLambda);
    bucket.grantPut(importFileParserLambda);

    const api = new apiGateway.HttpApi(this, 'ImportApi', {
      corsPreflight: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [apiGateway.CorsHttpMethod.ANY],
      },
    });

    api.addRoutes({
      integration: new HttpLambdaIntegration('ImportProductsIntegration', importProductsFileLambda),
      path: '/import',
      methods: [apiGateway.HttpMethod.GET],
    });

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3notifications.LambdaDestination(importFileParserLambda),
      { prefix: 'uploaded/' }
    );
  }
}
