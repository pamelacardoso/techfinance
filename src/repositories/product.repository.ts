import { api } from "@/lib/api";
import { Product } from "@/models/product";  


export interface ProductQuerySchema {
    nome?: string;
    categoria?: string;
    limite?: number;
    pagina?: number;
}

export class ProductRepository {
    private readonly endpoint = 'produtos';

    async search(query: ProductQuerySchema): Promise<Product[]> {
        const response = await api.get(this.endpoint, { params: query });
        return response.data;  
    }
}
