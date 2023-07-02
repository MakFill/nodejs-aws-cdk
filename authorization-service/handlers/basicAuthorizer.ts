import { APIGatewayTokenAuthorizerHandler, APIGatewayAuthorizerResult } from 'aws-lambda';

export const handler: APIGatewayTokenAuthorizerHandler = async (
  event,
  _context,
  callback
): Promise<any> => {
  if (event['type'] !== 'TOKEN') {
    callback('Unauthorized');
  }

  try {
    const { authorizationToken } = event || {};

    const [_, encodedCreds] = authorizationToken.split(' ');
    const buff = Buffer.from(encodedCreds, 'base64');
    const [username, password] = buff.toString('utf-8').split(':');
    console.log(`username: ${username} and password: ${password}`);

    const storedUserPassword = process.env[username];
    const effect = !storedUserPassword || storedUserPassword !== password ? 'Deny' : 'Allow';

    const policy = generatePolicy(encodedCreds, event.methodArn, effect);

    callback(null, policy);

    return policy;
  } catch {
    callback('Unauthorized');
  }
};

function generatePolicy(
  principalId: string,
  resource: string,
  effect: 'Allow' | 'Deny' = 'Allow'
): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
}
