export const buildResponse = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-headers': '*',
  },
  body: JSON.stringify(body),
});
