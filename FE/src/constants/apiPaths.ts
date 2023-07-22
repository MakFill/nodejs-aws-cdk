const BFF_LINK = "http://makfill-bff-api-prod.eu-west-1.elasticbeanstalk.com/";
const BFF_PROXY = "https://e3k7vbodzg.execute-api.eu-west-1.amazonaws.com";

const API_PATHS = {
  order: "https://.execute-api.eu-west-1.amazonaws.com/dev",
  import: `${BFF_PROXY}/import`,
  bff: `${BFF_PROXY}/product`,
  cart: `${BFF_PROXY}/cart`,
};

export default API_PATHS;
