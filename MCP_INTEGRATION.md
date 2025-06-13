# TechFinance MCP Integration - App Mobile

## Visão Geral

Este documento descreve a implementação das funcionalidades MCP (Model Context Protocol) no aplicativo mobile TechFinance. A integração permite análises inteligentes e gerenciamento contextual de dados financeiros.

## Arquivos Implementados

### Serviços
- `src/services/mcp.service.ts` - Cliente MCP para comunicação com a API
- `src/hooks/useMCP.ts` - Hook React para funcionalidades MCP

### Componentes
- `src/components/MCPContextManager.tsx` - Gerenciador de contextos MCP
- `src/components/MCPAnalysisCard.tsx` - Card de análise inteligente reutilizável

### Telas
- `src/app/mcp/index.tsx` - Painel principal MCP
- `src/app/reports/assignments.tsx` - Integração MCP na renegociação de títulos

## Funcionalidades Implementadas

### 🔧 Serviços MCP

#### MCPService
```typescript
// Gerenciamento de contextos
createContext(name, description, data, metadata)
getContext(id)
updateContext(id, updates)
deleteContext(id)
listContexts()

// Análises financeiras
executeFinancialAnalysis(data, analysisType)
analyzeReceivables(data)
analyzeCashFlow(data)
analyzeSales(data)

// Prompts especializados
getRenegotiationPrompt(titlesData, criteria, baseDate)
getCustomerAnalysisPrompt(customerData, salesHistory, paymentHistory)

// Geração de relatórios
generateReport(reportType, format, filters)
```

#### useMCP Hook
```typescript
const {
  // Estado
  isLoading,
  error,
  contexts,
  isOnline,

  // Funções
  createContext,
  analyzeReceivables,
  getRenegotiationPrompt,
  generateReport,
  clearError
} = useMCP();
```

### 🎨 Componentes

#### MCPContextManager
- Modal para gerenciar contextos
- Criar, editar e excluir contextos
- Seleção de contexto ativo
- Lista de contextos com metadados

#### MCPAnalysisCard
- Card reutilizável para análises
- Suporte a diferentes tipos: receivables, cash_flow, sales
- Feedback visual e formatação de resultados
- Integração com callbacks personalizados

### 📱 Telas

#### Painel MCP (`/mcp`)
- Dashboard principal com estatísticas
- Cards de análise para diferentes tipos de dados
- Gerenciamento de contextos
- Ações rápidas (relatórios, configurações)

#### Renegociação de Títulos (atualizada)
- Botões para análises MCP
- Criação automática de contextos
- Geração de prompts inteligentes
- Análise de dados de renegociação

## Fluxo de Uso

### 1. Análise Básica
```typescript
// Na tela de renegociação
const { analyzeReceivables } = useMCP();

const handleAnalyze = async () => {
  const result = await analyzeReceivables(titlesData);
  // Resultado formatado exibido ao usuário
};
```

### 2. Criação de Contexto
```typescript
// Criar contexto para análise específica
const context = await createRenegotiationContext(titlesData, criteria);
// Contexto pode ser reutilizado em análises futuras
```

### 3. Prompt Inteligente
```typescript
// Gerar prompt para análise especializada
const prompt = await getRenegotiationPrompt(
  titlesData,
  criteria,
  baseDate
);
// Prompt pode ser usado com IA externa
```

## Interface do Usuário

### Painel MCP
- **Header**: Estatísticas de contextos e registros
- **Ações Rápidas**: Botões para funções comuns
- **Cards de Análise**: Análises categorizadas
- **Contextos Recentes**: Lista dos últimos contextos criados

### Integração em Telas Existentes
- **Botão MCP**: Ícone roxo/gear para acessar funcionalidades
- **Indicador de Contexto**: Mostra contexto ativo
- **Cards de Análise**: Botões para análises específicas
- **Feedback Visual**: Loading states e mensagens de erro

## Tipos de Análises

### 📊 Contas a Receber
- Total de recebíveis
- Contagem de títulos em atraso
- Percentual de inadimplência
- Recomendações automáticas

### 💰 Fluxo de Caixa
- Entradas e saídas
- Saldo líquido
- Status de balanço (positivo/negativo)
- Recomendações de gestão

### 🛒 Vendas
- Total de vendas
- Número de transações
- Ticket médio
- Tendência de crescimento

## Tratamento de Erros

- **Conectividade**: Fallback para modo offline
- **Validação**: Verificação de dados antes de envio
- **Feedback**: Mensagens claras para o usuário
- **Recuperação**: Botões para tentar novamente

## Configuração

### Variáveis de Ambiente
```typescript
// src/config/env.ts
API_BASE_URL: 'https://techfinance-api.fly.dev/'
API_TOKEN: 'ronaldo'
```

### Dependências
- `@/hooks/useMCP` - Hook principal
- `@/services/mcp.service` - Cliente API
- `react-native-reanimated` - Animações
- `@expo/vector-icons` - Ícones

## Navegação

- **Home → Painel MCP**: Botão "Painel MCP" no menu principal
- **Relatórios → MCP**: Botão gear no header das telas de relatório
- **Contextos**: Modal acessível de qualquer tela MCP

## Próximos Passos

### Melhorias Planejadas
- [ ] Cache local de análises
- [ ] Sincronização offline
- [ ] Notificações push para análises
- [ ] Exportação de relatórios
- [ ] Integração com calendário
- [ ] Análises comparativas

### Otimizações
- [ ] Lazy loading de componentes
- [ ] Memoização de cálculos
- [ ] Compressão de dados
- [ ] Prefetch de contextos

## Exemplos de Uso

### Análise Rápida
```tsx
<MCPAnalysisCard
  data={receivablesData}
  analysisType="receivables"
  title="📊 Análise de Inadimplência"
  onAnalysisComplete={(result) => {
    console.log('Inadimplência:', result.overdue_percentage);
  }}
/>
```

### Gerenciamento de Contexto
```tsx
const [showMCP, setShowMCP] = useState(false);

<MCPContextManager
  visible={showMCP}
  onClose={() => setShowMCP(false)}
  onContextSelected={(id) => {
    setActiveContext(id);
    setShowMCP(false);
  }}
/>
```

### Hook Personalizado
```tsx
const {
  isLoading,
  error,
  analyzeReceivables,
  createContext
} = useMCP();

useEffect(() => {
  if (data.length > 0) {
    analyzeReceivables(data);
  }
}, [data]);
```

## Troubleshooting

### Problemas Comuns

**Erro de conexão MCP**
- Verificar se a API está rodando
- Confirmar token de autorização
- Checar conectividade de rede

**Contextos não carregam**
- Limpar cache do app
- Verificar estrutura dos dados
- Checar logs de erro

**Análises lentas**
- Reduzir volume de dados
- Implementar paginação
- Usar cache local

### Debug
```typescript
// Ativar logs detalhados
console.log('MCP State:', { isLoading, error, contexts });
console.log('Analysis Data:', analysisData);
```
