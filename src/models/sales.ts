export interface Sales {
  id_venda: number;
  data_emissao: string;
  tipo: number;
  descricao_tipo: string;
  id_cliente: number;
  razao_cliente: string;
  nome_fantasia: string;
  id_grupo_cliente: number;
  descricao_grupo_cliente: string;
  cidade: string;
  uf: string;
  codigo_produto: string;
  descricao_produto: string;
  id_grupo_produto: string;
  descricao_grupo_produto: string;
  qtde: number;
  valor_unitario: string;
  total: string;
}
