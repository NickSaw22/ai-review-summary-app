import type { Product } from "../types";

export interface ProductProvider {
  getProduct(idOrSlug: string): Promise<Product>;
  getProducts?(page?: number, pageSize?: number, search?: string): Promise<Product[]>;
}
