import { buildResponse, getErrorMessage } from '../utils';
import { dynamoDB } from '../dynamoDB/db-client';
import { ProductWithoutCount, Stock } from '../types/types';

export const handler = async (event: any) => {
  console.log('getProductsById:', event.pathParameters?.productId);
  try {
    const { productId } = event.pathParameters || {};
    const productQueryResult = (
      await dynamoDB
        .get(
          {
            TableName: process.env.PRODUCT_TABLE_NAME!,
            Key: { id: productId },
          },
          function (err, data) {
            if (err) {
              console.log('Error', err);
            } else {
              console.log('Success', data.Item);
            }
          }
        )
        .promise()
    ).Item as ProductWithoutCount | undefined;

    const stockQueryResult = (
      await dynamoDB
        .get(
          {
            TableName: process.env.STOCK_TABLE_NAME!,
            Key: { product_id: productId },
            AttributesToGet: ['count'],
          },
          function (err, data) {
            if (err) {
              console.log('Error', err);
            } else {
              console.log('Success', data.Item);
            }
          }
        )
        .promise()
    )?.Item as Stock | undefined;

    if (!productQueryResult || !stockQueryResult) {
      return buildResponse(404, {
        message: 'Product not found',
      });
    }
    return buildResponse(200, { ...productQueryResult, ...stockQueryResult });
  } catch (e) {
    return buildResponse(500, {
      message: getErrorMessage(e),
    });
  }
};
