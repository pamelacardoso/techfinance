import { api } from "@/lib/api";
import { Sales } from "@/models/sales";

export interface SalesQuerySchema extends Partial<Sales> {
  limite?: number;
  pagina?: number;
}

export interface TopProducts {
  codigo_produto: string;
  descricao_produto: string;
  quantidade_total?: string;
  valor_total?: string;
  valor_minimo?: number;
  valor_maximo?: number;
  percentual_diferenca?: string;
  total?: string;
  qtde?: string;
}

export interface CompanyParticipation {
  nome_fantasia: string;
  quantidade_total: number;
  percentual: number;
}

export class SalesRepository {
  private readonly endpoints = {
    sales: "vendas",
    topProductsByQuantity: "produtos/mais-vendidos",
    topProductsByValue: "produtos/maior-valor",
    priceVariation: "produtos/variacao-preco",
    companyParticipation: "empresas/participacao",
  };

  async getSales(query: SalesQuerySchema): Promise<Sales[]> {
    const endpoint = this.endpoints.sales;
    const response = await api.get(endpoint, { params: query });
    return response.data;
  }

  async getTopProductsByQuantity(query: SalesQuerySchema): Promise<TopProducts[]> {
    const endpoint = this.endpoints.topProductsByQuantity;
    const response = await api.get(endpoint, { params: query });
    return response.data;
  }

  async getTopProductsByValue(query: SalesQuerySchema): Promise<TopProducts[]> {
    const endpoint = this.endpoints.topProductsByValue;
    const response = await api.get(endpoint, { params: query });
    return response.data;
  }

  async getPriceVariationByProduct(query: SalesQuerySchema): Promise<TopProducts[]> {
    const endpoint = this.endpoints.priceVariation;
    const response = await api.get(endpoint, { params: query });
    return response.data;
  }

  async getCompanySalesParticipation(query: SalesQuerySchema): Promise<CompanyParticipation[]> {
    const endpoint = this.endpoints.companyParticipation;
    const response = await api.get(endpoint, { params: query });
    return response.data;
  }
}
