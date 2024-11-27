import { api } from "@/lib/api";

export interface ResumoAtraso {
  atraso_30_60: string;
  atraso_ate_30: string;
  outro: string;
  vence_ate_30: string;
  vencimento_hoje: string;
  vencimento_superior_30: string;
}

export class CustomerRepository {
  private readonly endpointClientes = 'clientes';
  private readonly endpointResumo = '/contas_receber/resumo';


  async search(query: any): Promise<any[]> {
    const response = await api.get(this.endpointClientes, { params: query });
    return response.data;
  }


  async fetchResumo(): Promise<ResumoAtraso> {
    const response = await api.get(this.endpointResumo);
    return response.data;
  }
}
