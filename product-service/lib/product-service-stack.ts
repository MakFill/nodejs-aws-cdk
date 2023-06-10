import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sharedLambdaProps: Partial<NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
        PRODUCT_TABLE_NAME: process.env.DDB_PRODUCT_TABLE_NAME!,
        STOCK_TABLE_NAME: process.env.DDB_STOCK_TABLE_NAME!,
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
