# TechFinance App - Documentação da API

## Visão Geral

O **TechFinance App** é uma aplicação mobile desenvolvida com **React Native** e **Expo** que consome a TechFinance API para fornecer insights empresariais através de uma interface intuitiva e moderna. O app inclui funcionalidades de cache offline, autenticação local e um assistente virtual (Dinho Bot) para análise de dados.

### Informações do App

- **Versão:** 1.0.0
- **Plataforma:** React Native (iOS/Android/Web)
- **Framework:** Expo SDK 52
- **Linguagem:** TypeScript
- **Estado Global:** Zustand
- **Estilização:** NativeWind (Tailwind CSS)

## Configuração da API

### Variáveis de Ambiente

```typescript
// src/config/env.ts
export const env = {
  OPENAI_API_KEY: 'sk-proj-...',           // Chave da OpenAI para o chat bot
  API_BASE_URL: 'https://techfinance-api.fly.dev/', // URL base da API
  API_TOKEN: 'ronaldo'                      // Token de autenticação
};
```

### Cliente HTTP

```typescript
// src/lib/api.ts
export const api = axios.create({
  baseURL: env.API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${env.API_TOKEN}`
  },
});
```

## Arquitetura

### Estrutura de Camadas

1. **Screens/Pages** (`src/app/`): Telas da aplicação usando Expo Router
2. **Components** (`src/components/`): Componentes reutilizáveis
3. **Hooks** (`src/hooks/`): Lógica de estado e side effects
4. **Repositories** (`src/repositories/`): Camada de acesso aos dados da API
5. **Services** (`src/services/`): Serviços externos (OpenAI)
6. **Models** (`src/models/`): Interfaces TypeScript
7. **Utils** (`src/utils/`): Funções utilitárias

### Gerenciamento de Estado

- **Zustand**: Store global para autenticação, cache e conectividade
- **AsyncStorage**: Persistência local de dados
- **Cache offline**: Dados ficam disponíveis sem conexão

## Repositories (Acesso aos Dados)

### Product Repository

```typescript
// src/repositories/product.repository.ts
export interface ProductQuerySchema {
  nome?: string;
  categoria?: string;
  limite?: number;
  pagina?: number;
}

export class ProductRepository {
  async search(query: ProductQuerySchema): Promise<Product[]>
}
```

**Endpoints utilizados:**
- `GET /produtos` - Busca produtos com filtros

### Customer Repository

```typescript
// src/repositories/customer.repository.ts
export class CustomerRepository {
  async search(query: any): Promise<Customer[]>
  async fetchResumo(): Promise<ResumoAtraso>
}
```

**Endpoints utilizados:**
- `GET /clientes` - Busca clientes
- `GET /contas_receber/resumo` - Resumo de contas a receber

### Sales Repository

```typescript
// src/repositories/sales.repository.ts
export class SalesRepository {
  async getSales(query: SalesQuerySchema): Promise<Sales[]>
  async getTopProductsByQuantity(query: SalesQuerySchema): Promise<TopProducts[]>
  async getTopProductsByValue(query: SalesQuerySchema): Promise<TopProducts[]>
  async getPriceVariation(query: SalesQuerySchema): Promise<TopProducts[]>
  async getCompanyParticipation(query: SalesQuerySchema): Promise<CompanyParticipation[]>
  async getCompanyParticipationByValue(query: SalesQuerySchema): Promise<CompanyParticipationByValue[]>
}
```

**Endpoints utilizados:**
- `GET /vendas` - Lista vendas
- `GET /produtos/mais-vendidos` - Produtos mais vendidos por quantidade
- `GET /produtos/maior-valor` - Produtos com maior valor
- `GET /produtos/variacao-preco` - Variação de preços
- `GET /empresas/participacao` - Participação por quantidade
- `GET /empresas/participacao-por-valor` - Participação por valor

## Hooks (Estado e Lógica)

### useAuth - Autenticação

```typescript
// src/hooks/useAuth.ts
interface AuthState {
  isAuthenticated: boolean;
  user: { email: string; name: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}
```

**Funcionalidades:**
- Autenticação local (admin/admin)
- Persistência no AsyncStorage
- Estado global de autenticação

### useCache - Cache de Dados

```typescript
// src/hooks/useCache.ts
interface CacheState {
  products: any[];
  customers: any[];
  sales: any[];
  titles: any[];
  setProducts: (products: any[]) => void;
  setCustomers: (customers: any[]) => void;
  setSales: (sales: any[]) => void;
  setTitles: (titles: any[]) => void;
  clearCache: () => void;
}
```

**Funcionalidades:**
- Cache local de dados da API
- Funcionamento offline
- Sincronização automática

### useConnection - Conectividade

```typescript
// src/hooks/useConnection.ts
interface ConnectionState {
  isOnline: boolean;
  lastSync: string | null;
  setOnline: (status: boolean) => void;
  setLastSync: (date: string) => void;
}
```

**Funcionalidades:**
- Monitor de conectividade
- Timestamp da última sincronização
- Fallback para dados em cache

### useApi - Cliente HTTP Inteligente

```typescript
// src/hooks/useApi.ts
export function useApi() {
  const fetchWithCache = async <T>(endpoint: string, options?: AxiosRequestConfig): Promise<T>
}
```

**Funcionalidades:**
- Requisições HTTP com fallback para cache
- Atualização automática do status de conectividade
- Sincronização inteligente de dados

## Models (Interfaces TypeScript)

### Product

```typescript
// src/models/product.ts
export interface Product {
  codigo: string;
  descricao_produto: string;
  descricao_grupo: string;
  id_grupo: string;
  id_produto: string;
  nome_porduto: string;
}
```

### Customer

```typescript
// src/models/customer.ts
export interface Customer {
  id_cliente: number;
  razao_cliente: string;
  nome_fantasia: string;
  cidade: string;
  uf: string;
  id_grupo: string;
  descricao_grupo: string;
}
```

### Sales

```typescript
// src/models/sales.ts
export interface Sales {
  idVenda: number;
  dataEmissao: string;
  tipo: number;
  descricaoTipo: string;
  idCliente: number;
  razaoCliente: string;
  nomeFantasia: string;
  // ... outros campos
}
```

## Services

### OpenAI Service - Dinho Bot

```typescript
// src/services/openai.service.ts
export class OpenAIService {
  async sendMessage(prompt: string, addToUI?: boolean): Promise<void>
  async sendImageMessage(prompt: string, imageUri: string): Promise<void>
}
```

**Funcionalidades:**
- Chat com IA usando OpenAI
- Análise de imagens
- Histórico de conversas
- Interface de mensagens

## Telas da Aplicação

### Estrutura de Navegação (Expo Router)

```
src/app/
├── _layout.tsx           # Layout raiz
├── index.tsx            # Tela de login
├── home.tsx             # Dashboard principal
├── chat/
│   └── index.tsx        # Chat com Dinho Bot
├── customer/
│   ├── index.tsx        # Lista de clientes
│   └── details.tsx      # Detalhes do cliente
├── product/
│   ├── index.tsx        # Lista de produtos
│   └── productdetails.tsx # Detalhes do produto
├── reports/
│   ├── index.tsx        # Menu de relatórios
│   ├── customers.tsx    # Relatório de clientes
│   ├── products.tsx     # Relatório de produtos
│   ├── sales.tsx        # Relatório de vendas
│   └── ...              # Outros relatórios
└── sales/
    └── index.tsx        # Vendas
```

## Recursos Avançados

### Cache Offline

O aplicativo funciona offline utilizando:
- **AsyncStorage** para persistência
- **Zustand** para gerenciamento de estado
- **Fallback automático** para dados em cache
- **Sincronização** quando a conexão retorna

### Sistema de Autenticação

- Autenticação local (não integrada com backend)
- Credenciais: `admin` / `admin`
- Persistência da sessão
- Proteção de rotas

### Dinho Bot (Assistente Virtual)

- Integração com OpenAI GPT
- Análise de dados empresariais
- Upload e análise de imagens
- Interface de chat em tempo real

### Responsive Design

- **NativeWind** para estilização
- Design adaptativo para mobile e web
- Componentes reutilizáveis
- Tema consistente

## Instalação e Execução

### Pré-requisitos

- Node.js 18+
- Expo CLI
- Android Studio (para Android)
- Xcode (para iOS)

### Instalação

```bash
# Clone o repositório
git clone <repository_url>
cd app

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Edite app.config.ts com suas chaves

# Execute o projeto
npm start
```

### Scripts Disponíveis

```bash
npm start          # Inicia o servidor de desenvolvimento
npm run android    # Executa no Android
npm run ios        # Executa no iOS
npm run web        # Executa no navegador
npm run export     # Build para produção
```

## Dependências Principais

### Core

- **expo**: ^52.0.11 - Framework principal
- **react-native**: 0.76.2 - Runtime mobile
- **expo-router**: ~4.0.7 - Roteamento baseado em arquivos

### Estado e Dados

- **zustand**: ^5.0.1 - Gerenciamento de estado
- **axios**: ^1.7.7 - Cliente HTTP
- **zod**: ^3.23.8 - Validação de schemas

### UI e Estilização

- **nativewind**: ^4.1.23 - Tailwind CSS para React Native
- **expo-linear-gradient**: ~14.0.1 - Gradientes
- **@expo/vector-icons**: ^14.0.3 - Ícones

### Funcionalidades

- **@google/generative-ai**: ^0.21.0 - OpenAI (alternativa)
- **expo-image-picker**: ~16.0.2 - Seleção de imagens
- **react-native-markdown-display**: ^7.0.2 - Renderização de Markdown

## Configuração de Build

### Android

```json
{
  "android": {
    "package": "br.com.techfinance.app",
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#ffffff"
    }
  }
}
```

### iOS

```json
{
  "ios": {
    "bundleIdentifier": "com.techfinance.app",
    "supportsTablet": true
  }
}
```

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão com API**
   - Verificar `API_BASE_URL` em `src/config/env.ts`
   - Confirmar se a API backend está rodando
   - Validar token de autenticação

2. **Problemas de cache**
   - Limpar AsyncStorage: usar `clearCache()` do useCache
   - Reiniciar o app com `expo start --clear`

3. **Erro do OpenAI**
   - Verificar `OPENAI_API_KEY` válida
   - Confirmar limites de uso da API

4. **Build errors**
   - Limpar cache: `expo start --clear`
   - Reinstalar dependências: `rm -rf node_modules && npm install`

## Monitoramento e Analytics

### Logs

- Console logs em desenvolvimento
- Error boundary para captura de erros
- Logs de sincronização de dados

### Performance

- Lazy loading de telas
- Otimização de imagens com expo-image
- Cache inteligente de dados
- Debounce em pesquisas

## Segurança

### Boas Práticas

- Tokens sensíveis em variáveis de ambiente
- Validação de dados com Zod
- Sanitização de inputs
- Timeout em requisições HTTP

### Dados Sensíveis

- Chaves API não expostas no código
- Dados cacheados criptografados no AsyncStorage
- Autenticação local para desenvolvimento

## Roadmap e Melhorias

### Futuras Implementações

- [ ] Autenticação integrada com backend
- [ ] Notificações push
- [ ] Sincronização em background
- [ ] Temas claro/escuro
- [ ] Exportação de relatórios
- [ ] Modo offline melhorado
- [ ] Analytics de uso

### Otimizações

- [ ] Code splitting por rota
- [ ] Lazy loading de componentes
- [ ] Compressão de imagens
- [ ] Prefetch de dados críticos
