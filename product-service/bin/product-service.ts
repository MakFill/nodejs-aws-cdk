#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductServiceStack } from '../lib/product-service-stack';
import * as dotenv from 'dotenv';

dotenv.config();

const app = new cdk.App();
new ProductServiceStack(app, 'ProductServiceStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.PRODUCT_AWS_REGION! },
});
