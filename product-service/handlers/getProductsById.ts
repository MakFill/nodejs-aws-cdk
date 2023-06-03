import { buildResponse, getErrorMessage } from '../utils';
import data from '../mock/data.json';

export const handler = async (event: any) => {
  try {
    const { productId } = event.pathParameters;
    const productItem = data.find((el) => el.id === productId);
    if (!productItem) {
      return buildResponse(404, {
        message: 'Product not found',
      });
    }
    return buildResponse(200, productItem);
  } catch (e) {
    return buildResponse(500, {
      message: getErrorMessage(e),
    });
  }
};
