import { v4 as uuid } from 'uuid';
import { buildResponse, getErrorMessage } from '../utils';
import { dynamoDB } from '../dynamoDB/db-client';
import validate from '../lib/validate';

export const handler = async (event: any) => {
  const data = JSON.parse(event.body);
  return await validate.isValid(data).then(async (isValid) => {
    if (!isValid) {
      console.log('Product data is invalid');
      return buildResponse(400, { message: 'Product data is invalid' });
    }
    const { title, description, price, count } = data;
    console.log(
      `POST request: {title: ${title}, description: ${description}, price: ${price}, count: ${count}`
    );
    try {
      const id = uuid();
      await dynamoDB
        .transactWrite(
          {
            TransactItems: [
              {
                Put: {
                  TableName: process.env.PRODUCT_TABLE_NAME!,
                  Item: {
                    id,
                    title,
                    description,
                    price,
                  },
                },
              },
              {
                Put: {
                  TableName: process.env.STOCK_TABLE_NAME!,
                  Item: {
                    product_id: id,
                    count,
                  },
                },
              },
            ],
          },
          function (err, data) {
            if (err) {
              console.log('Error', err);
            } else {
              console.log('Success', data);
            }
          }
        )
        .promise();
      return buildResponse(200, { title, description, price, count, id });
    } catch (e) {
      return buildResponse(500, {
        message: getErrorMessage(e),
      });
    }
  });
};
