import { buildResponse, getErrorMessage } from '../utils';
import { dynamoDB } from '../dynamoDB/db-client';
import { ProductWithoutCount, Stock } from '../types/types';

const joinTables = (data1: ProductWithoutCount[], data2: Stock[]) => {
  const map = new Map(data2.map((obj) => [obj?.product_id, obj?.count]));
  return data1.map((item) => ({
    ...item,
    count: map.get(item.id),
  }));
};

export const handler = async (event: any) => {
  try {
    const productData = ((
      await dynamoDB
        .scan({
          TableName: process.env.PRODUCT_TABLE_NAME!,
        })
        .promise()
    )?.Items ?? []) as ProductWithoutCount[];
    const stockData = ((
      await dynamoDB
        .scan({
          TableName: process.env.STOCK_TABLE_NAME!,
        })
        .promise()
    )?.Items ?? []) as Stock[];

    const data = joinTables(productData, stockData);
    return buildResponse(200, data);
  } catch (e) {
    return buildResponse(500, {
      message: getErrorMessage(e),
    });
  }
};
