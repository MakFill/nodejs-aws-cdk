export type ProductWithoutCount = {
  id: string;
  title: string;
  description: string;
  price: number;
};

export type Stock = {
  product_id: string;
  count: number;
};

export type Product = ProductWithoutCount & Pick<Stock, 'count'>;
