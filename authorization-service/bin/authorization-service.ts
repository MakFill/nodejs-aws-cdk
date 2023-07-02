#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AuthorizationServiceStack } from '../lib/authorization-service-stack';
import * as dotenv from 'dotenv';

dotenv.config();

const app = new cdk.App();
new AuthorizationServiceStack(app, 'AuthorizationServiceStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.PRODUCT_AWS_REGION! },
});
