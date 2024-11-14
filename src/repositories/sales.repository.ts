import { api } from "@/lib/api";
import { Sales } from "@/models/sales";

interface VendasQuerySchema{
  id_cliente: string;
  razao_cliente: string;
  cidade: string;
  uf: string;
  codigo_produto: string;
  id_grupo_produto: string;
  qtde: number;
  total: number;
  nome_produto: string;
}

interface SalesQuerySchema {
  id_cliente?: string;
  codigo_produto?: string;
}

export class SalesRepository {
  private readonly endpoint = "vendas";

  async getSales(query: SalesQuerySchema): Promise<Sales[]> {
    const response = await api.get(this.endpoint, { params: query });
    return response.data;
  }
}
