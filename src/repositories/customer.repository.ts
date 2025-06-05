import { api } from "@/lib/api";

export interface ResumoAtraso {
  atraso_30_60: number;
  atraso_ate_30: number;
  outro: number;
  vence_ate_30: number;
  vencimento_hoje: number;
  vencimento_superior_30: number;
  total: number;
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
    let { data } = response;
    let total = 0;

    for (const key of Object.keys(data)) {
      data[key] = Number(data[key]);
      total += data[key];
    }

    data['total'] = total;

    return data;
  }
}
