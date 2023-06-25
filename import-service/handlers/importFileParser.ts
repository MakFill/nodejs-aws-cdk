import * as AWS from 'aws-sdk';
import csv from 'csv-parser';
import { Handler, S3Event } from 'aws-lambda';
import { InvokeAsyncResponse } from 'aws-sdk/clients/lambda';

export const handler: Handler = async (event: S3Event): Promise<InvokeAsyncResponse> => {
  try {
    const { BUCKET_NAME } = process.env;
    const sqs = new AWS.SQS();
    const s3 = new AWS.S3();
    for (const record of event.Records) {
      const s3Stream = s3
        .getObject({
          Bucket: BUCKET_NAME!,
          Key: record.s3.object.key,
        })
        .createReadStream();

      await new Promise((resolve, reject) => {
        s3Stream
          .pipe(csv())
          .on('data', (data) => {
            sqs.sendMessage(
              {
                QueueUrl: process.env.IMPORT_QUEUE_URL!,
                MessageBody: JSON.stringify(data),
              },
              (err) => {
                if (err) {
                  console.log('ERROR SQS:', err);
                }
              }
            );
          })
          .on('error', (error) => reject('ERROR: ' + error))
          .on('end', async () => {
            console.log(`Copy from ${BUCKET_NAME}/${record.s3.object.key}`);

            await s3
              .copyObject({
                Bucket: BUCKET_NAME!,
                CopySource: `${BUCKET_NAME}/${record.s3.object.key}`,
                Key: record.s3.object.key.replace('uploaded', 'parsed'),
              })
              .promise();

            await s3
              .deleteObject({
                Bucket: BUCKET_NAME!,
                Key: record.s3.object.key,
              })
              .promise();

            console.log(
              `Placed into ${BUCKET_NAME}/${record.s3.object.key.replace('uploaded', 'parsed')}`
            );
            resolve(() => {});
          });
      });
    }

    return {
      Status: 202,
    };
  } catch {
    return {
      Status: 500,
    };
  }
};
