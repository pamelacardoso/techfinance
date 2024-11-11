import { api } from "@/lib/api";
import { Customer } from "@/models/customer";

interface CustomerQuerySchema {
    nome?: string;
    grupo?: string;
    limite?: number;
    pagina?: number;
}

export class CustomerRepository {
    private readonly endpoint = 'clientes';

    async search(query: CustomerQuerySchema): Promise<Customer[]> {
        const response = await api.get(this.endpoint, { params: query });
        return response.data;
    }
}

