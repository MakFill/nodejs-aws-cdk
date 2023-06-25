import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const importProductTopic = new sns.Topic(this, 'ImportProductTopic', {
      topicName: 'import-product-topic',
    });

    const importQueue = new sqs.Queue(this, 'ImportQueue', {
      queueName: 'import-file-queue',
    });

    new sns.Subscription(this, 'StockSubscription', {
      endpoint: process.env.NOTIFICATION_EMAIL!,
      protocol: sns.SubscriptionProtocol.EMAIL,
      topic: importProductTopic,
    });

    new sns.Subscription(this, 'AdditionalStockSubscription', {
      endpoint: process.env.ADDITIONAL_EMAIL!,
      protocol: sns.SubscriptionProtocol.EMAIL,
      topic: importProductTopic,
      filterPolicy: {
        count: sns.SubscriptionFilter.numericFilter({ lessThanOrEqualTo: 4 }),
      },
    });

    const sharedLambdaProps: Partial<NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
        PRODUCT_TABLE_NAME: process.env.DDB_PRODUCT_TABLE_NAME!,
        STOCK_TABLE_NAME: process.env.DDB_STOCK_TABLE_NAME!,
        IMPORT_PRODUCTS_TOPIC_ARN: importProductTopic.topicArn,
      },
    };

    const getProductsList = new NodejsFunction(this, 'GetProductListLambda', {
      ...sharedLambdaProps,
      functionName: 'getProductsList',
      entry: './handlers/getProductsList.ts',
    });

    const getProductsById = new NodejsFunction(this, 'getProductsByIdLambda', {
      ...sharedLambdaProps,
      functionName: 'getProductsById',
      entry: './handlers/getProductsById.ts',
    });

    const createProduct = new NodejsFunction(this, 'createProductLambda', {
      ...sharedLambdaProps,
      functionName: 'createProduct',
      entry: './handlers/createProduct.ts',
    });

    const catalogBatchProcess = new NodejsFunction(this, 'CatalogBatchProcessLambda', {
      ...sharedLambdaProps,
      functionName: 'catalogBatchProcess',
      entry: './handlers/catalogBatchProcess.ts',
    });

    importProductTopic.grantPublish(catalogBatchProcess);
    catalogBatchProcess.addEventSource(new SqsEventSource(importQueue, { batchSize: 5 }));

    const api = new apiGateway.HttpApi(this, 'ProductApi', {
      corsPreflight: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [apiGateway.CorsHttpMethod.ANY],
      },
    });

    api.addRoutes({
      integration: new HttpLambdaIntegration('GetProductsListIntegration', getProductsList),
      path: '/products',
      methods: [apiGateway.HttpMethod.GET],
    });

    api.addRoutes({
      integration: new HttpLambdaIntegration('GetProductByIdIntegration', getProductsById),
      path: '/products/{productId}',
      methods: [apiGateway.HttpMethod.GET],
    });

    api.addRoutes({
      integration: new HttpLambdaIntegration('CreateProductIntegration', createProduct),
      path: '/products',
      methods: [apiGateway.HttpMethod.POST],
    });
  }
}
