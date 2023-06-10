import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import data from '../mock/data.json';

dotenv.config();

export const ddb = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  region: process.env.PRODUCT_AWS_REGION,
});

data.forEach(({ id, title, description, price }) => {
  post({
    TableName: process.env.DDB_PRODUCT_TABLE_NAME,
    Item: {
      id: { S: id },
      title: { S: title },
      description: { S: description },
      price: { N: price.toString() },
    },
  });
  post({
    TableName: process.env.DDB_STOCK_TABLE_NAME,
    Item: {
      product_id: { S: id },
      count: { N: Math.round(Math.random() * 10).toString() },
    },
  });
});

function post(params: any) {
  ddb.putItem(params, function (err, data) {
    if (err) {
      console.log('Error', err);
    } else {
      console.log('Success', data);
    }
  });
}
