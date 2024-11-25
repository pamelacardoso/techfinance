import { api } from "@/lib/api";
import { Customer } from "@/models/customer"; // A interface correta de Customer

interface ResumoTitulo {
  nome_fantasia: string;
  data_vencimento: string;
  dias_vencidos: number;
}

interface ResumoFinanceiro {
  total_recebido: string;
  saldo: string;
  parcelas: string[];
}

export class CustomerRepository {
  private readonly endpointClientes = 'clientes';
  private readonly endpointResumo = '/contas_receber/resumo';  // Novo endpoint para buscar os resumos

  // Método para buscar dados dos clientes
  async search(query: any): Promise<any[]> {
    const response = await api.get(this.endpointClientes, { params: query });
    return response.data;
  }

  // Novo método para buscar o resumo dos títulos e financeiros
  async fetchResumo(): Promise<{
    clientesVencidos: ResumoTitulo[];
    resumoTitulos: ResumoFinanceiro;
  }> {
    const response = await api.get(this.endpointResumo);  // Chama o endpoint correto para buscar os dados
    return response.data;  // Retorna os dados no formato esperado
  }
}
