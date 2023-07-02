import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3notifications from 'aws-cdk-lib/aws-s3-notifications';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { ResponseType } from 'aws-cdk-lib/aws-apigateway';

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

    const queue = sqs.Queue.fromQueueArn(this, 'ImportFileQueue', process.env.QUEUE_ARN!);

    const sharedLambdaProps: Partial<NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        BUCKET_NAME: process.env.BUCKET_NAME!,
        IMPORT_QUEUE_URL: queue.queueUrl,
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

    queue.grantSendMessages(importFileParserLambda);

    bucket.grantReadWrite(importFileParserLambda);
    bucket.grantDelete(importFileParserLambda);
    bucket.grantPut(importFileParserLambda);

    const importedLambdaFromArn = lambda.Function.fromFunctionArn(
      this,
      'external-lambda-from-arn',
      `arn:aws:lambda:${cdk.Stack.of(this).region}:${
        cdk.Stack.of(this).account
      }:function:basicAuthorizer`
    );

    const api = new cdk.aws_apigateway.RestApi(this, 'ImportApi', {
      defaultCorsPreflightOptions: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [apiGateway.CorsHttpMethod.ANY],
      },
      defaultMethodOptions: {
        authorizer: new cdk.aws_apigateway.TokenAuthorizer(this, 'LambdaAuthorizer', {
          handler: importedLambdaFromArn,
        }),
      },
    });

    api.addGatewayResponse('AccessDeniedResponse', {
      type: ResponseType.ACCESS_DENIED,
      statusCode: '403',
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Methods': "'*'",
        'Access-Control-Allow-Headers': "'*'",
      },
    });

    api.addGatewayResponse('UnauthorizedResponse', {
      type: ResponseType.UNAUTHORIZED,
      statusCode: '401',
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Methods': "'*'",
        'Access-Control-Allow-Headers': "'*'",
      },
    });

    api.root
      .resourceForPath('import')
      .addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(importProductsFileLambda));

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3notifications.LambdaDestination(importFileParserLambda),
      { prefix: 'uploaded/' }
    );
  }
}
