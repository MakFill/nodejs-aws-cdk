import * as AWS from 'aws-sdk';
import { APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse, getErrorMessage } from '../utils';

export const handler = async (event: any): Promise<APIGatewayProxyResult> => {
  const catalogName = event.queryStringParameters.name;
  const s3 = new AWS.S3();
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `uploaded/${catalogName}`,
    Expires: 60,
    ContentType: 'text/csv',
  };

  try {
    const res = await s3.getSignedUrlPromise('putObject', params);
    return buildResponse(200, res);
  } catch (e) {
    return buildResponse(500, { message: getErrorMessage(e) });
  }
};
