import { handler as getProductsList } from '../handlers/getProductsList';
import { handler as getProductsById } from '../handlers/getProductsById';
import productList from '../mock/data.json';
import { buildResponse } from '../utils';

describe('Check product service', () => {
  it('Check if get /products returns products array', async () => {
    const list = await getProductsList();
    expect(list).toEqual(buildResponse(200, productList));
  });

  it('Check if get /products/{productId} returns Product not found', async () => {
    const mockEvent = {
      pathParameters: {
        productId: 'some wrong id',
      },
    };
    const productItem = await getProductsById(mockEvent);
    expect(productItem).toEqual(
      buildResponse(404, {
        message: 'Product not found',
      })
    );
  });

  it('Check if get /products/{productId} returns correct product', async () => {
    const mockEvent = {
      pathParameters: {
        productId: productList[0].id,
      },
    };
    const productItem = await getProductsById(mockEvent);
    expect(productItem).toEqual(buildResponse(200, productList[0]));
  });
});
