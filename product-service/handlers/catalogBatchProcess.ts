import * as AWS from 'aws-sdk';
import { handler as createProduct } from './createProduct';

interface ISQSEvent {
  Records: {
    body: string;
  }[];
}

const sns = new AWS.SNS();

export const handler = async (event: ISQSEvent): Promise<void> => {
  try {
    const products = event.Records.map(({ body }) => JSON.parse(body));
    await Promise.all(
      products.map(async (product) => {
        const data = { body: JSON.stringify(product) };
        await createProduct(data);
        return;
      })
    );

    products.forEach((product) => {
      sns.publish(
        {
          Subject: 'Product added',
          Message: JSON.stringify(product),
          MessageAttributes: {
            count: {
              DataType: 'Number',
              StringValue: product.count,
            },
          },
          TopicArn: process.env.IMPORT_PRODUCTS_TOPIC_ARN,
        },
        (err) => {
          if (err) {
            console.log('ERROR SNS: ', err);
          }
        }
      );
    });
  } catch (e) {
    console.log('Error: ', e);
  }
};
