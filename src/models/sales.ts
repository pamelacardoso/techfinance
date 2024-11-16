export interface Sales {
  idVenda: number;
  dataEmissao: string;
  tipo: number;
  descricaoTipo: string;
  idCliente: number;
  razaoCliente: string;
  nomeFantasia: string;
  idGrupoCliente: number;
  descricaoGrupoCliente: string;
  cidade: string;
  uf: string;
  codigoProduto: string;
  descricaoProduto: string;
  idGrupoProduto: string;
  descricaoGrupoProduto: string;
  qtde: number;
  valorUnitario: string;
  total: string;
}
