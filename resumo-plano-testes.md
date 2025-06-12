
# 📋 Plano de Testes — *Resumo do que deve ser testado e corrigido*

## ✅ Casos de Uso a Testar

| ID     | Descrição                                                                 |
|--------|---------------------------------------------------------------------------|
| T001   | Realizar login com credenciais incorretas                                |
| T002   | Gerar relatório de clientes                                               |
| T003   | Gerar relatório de vendas                                                 |
| T004   | Buscar cliente por nome ou código                                         |
| T005   | Visualizar relatório de Top 10 Produtos em vendas                         |
| T006   | Visualizar relatório de Top 10 Clientes em quantidade                     |
| T007   | Visualizar variação de preços dos produtos                                |
| T008   | Verificar renegociação de títulos                                         |
| T009   | Interagir com Dinho Bot para informações de produtos                      |
| T010   | Visualizar lista de produtos                                              |

## 🔒 Requisitos Não Funcionais

| ID      | Requisito                                                                                      |
|---------|------------------------------------------------------------------------------------------------|
| RNF001  | Sistema deve ser multiplataforma (Android/iOS e desktop)                                       |
| RNF002  | Tempo de resposta das consultas e relatórios ≤ 20 segundos                                     |
| RNF003  | Garantir proteção e segurança dos dados dos usuários                                           |
| RNF004  | Interface deve ser intuitiva e acessível, com boa usabilidade                                  |

## 🧪 Tipos de Testes Aplicados

### 1. Métodos da Classe
- **Objetivo:** Verificar retorno dos métodos de login, relatórios e consultas.
- **Técnica:** Manual  
- **Estágio:** Sistema  
- **Abordagem:** Caixa preta  
- **Responsável:** Gabriel Almir

### 2. Persistência de Dados
- **Objetivo:** Garantir consistência dos dados após falhas/desligamentos.
- **Técnica:** Automática  
- **Estágio:** Sistema  
- **Abordagem:** Caixa preta  
- **Responsável:** Gabriel Almir

### 3. Integração dos Componentes
- **Objetivo:** Validar integração entre bot, consultas e geração de relatórios.
- **Técnica:** Manual  
- **Estágio:** Sistema  
- **Abordagem:** Caixa preta  
- **Responsável:** Gabriel Almir

### 4. Tempo de Resposta
- **Objetivo:** Confirmar que relatórios e consultas respondem em até 20s.
- **Técnica:** Automática  
- **Estágio:** Sistema  
- **Abordagem:** Caixa preta  
- **Responsável:** Gabriel Almir

## ⚙️ Ferramentas Utilizadas

| Ferramenta         | Finalidade                                               |
|--------------------|----------------------------------------------------------|
| API Dog            | Testes e monitoramento de requisições HTTP               |
| rewrk              | Testes de carga e performance                             |
| GitHub Actions     | CI e automação de testes                                  |
| Excel              | Registro de resultados de testes manuais                 |
| Vitest             | Testes unitários no backend                               |

## 🧪 Testes Beta

- Aplicação de **questionário para avaliadores**
- Avaliar: usabilidade, desempenho, clareza das funcionalidades e experiência geral
- Objetivo: obter feedback estruturado e identificar melhorias

## 📅 Cronograma de Testes

| Atividade                      | Início     | Término    | Duração |
|-------------------------------|------------|------------|---------|
| Planejar Testes               | 12/05/2025 | 14/05/2025 | 2 dias  |
| Projetar Casos de Teste       | 16/05/2025 | 18/05/2025 | 2 dias  |
| Implementar Casos de Teste    | 20/05/2025 | 26/05/2025 | 6 dias  |
| Executar Testes Internos      | 27/05/2025 | 28/05/2025 | 1 dia   |
| Testes Beta                   | 29/05/2025 | 31/05/2025 | 3 dias  |
| Avaliar Resultados            | 01/06/2025 | 03/06/2025 | 2 dias  |
| Revisão Final e Documentação  | 04/06/2025 | 06/06/2025 | 2 dias  |
