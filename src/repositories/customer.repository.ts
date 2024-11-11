import { api } from "@/lib/api";
import { Customer } from "@/models/customer";
import { z } from "zod";

const customerQuerySchema = z.object({
    nome: z.string().optional(),
    grupo: z.string().optional(),
    limite: z.coerce.number().optional(),
    pagina: z.coerce.number().optional(),
});

export class CustomerRepository {
    private readonly endpoint = 'clientes';

    async search(query: z.infer<typeof customerQuerySchema>): Promise<Customer[]> {
        const { data, error } = customerQuerySchema.safeParse(query);

        if (error) {
            throw new Error(`Invalid query: ${error.errors}`);
        }

        const response = await api.get(this.endpoint, { params: data });
        return response.data;
    }
}

