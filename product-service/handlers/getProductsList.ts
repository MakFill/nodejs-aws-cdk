import { buildResponse, getErrorMessage } from '../utils';
import data from '../mock/data.json';

export const handler = async () => {
  try {
    return buildResponse(200, data);
  } catch (e) {
    return buildResponse(500, {
      message: getErrorMessage(e),
    });
  }
};
