import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new NodejsFunction(this, 'BasicAuthorizerLambda', {
      functionName: 'basicAuthorizer',
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: './handlers/basicAuthorizer.ts',
      environment: {
        MakFill: process.env.MakFill!,
      },
    });
  }
}
