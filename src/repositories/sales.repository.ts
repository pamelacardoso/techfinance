import { api } from "@/lib/api";
import { Sales } from "@/models/sales";

interface SalesQuerySchema extends Partial<Sales> { }

export class SalesRepository {
  private readonly endpoint = "vendas";

  async getSales(query: SalesQuerySchema): Promise<Sales[]> {
    const response = await api.get(this.endpoint, { params: query });
    return response.data;
  }
}
