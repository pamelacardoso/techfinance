import { api } from "@/lib/api";
import { Product } from "@/models/product";
import { z } from "zod";

const productQuerySchema = z.object({
    descricao: z.string().optional(),
    grupo: z.string().optional(),
    limite: z.coerce.number().optional(),
    pagina: z.coerce.number().optional(),
});

export class ProductRepository {
    private readonly endpoint = 'produtos';

    async search(query: z.infer<typeof productQuerySchema>): Promise<Product[]> {
        const { data, error } = productQuerySchema.safeParse(query);

        if (error) {
            throw new Error(`Invalid query: ${error.errors}`);
        }

        const response = await api.get(this.endpoint, { params: data });
        return response.data;
    }
}
