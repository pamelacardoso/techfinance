# TechFinance App - Guia do Desenvolvedor

## Configuração do Ambiente

### Pré-requisitos

- **Node.js** 18+
- **npm** ou **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Android Studio** (para desenvolvimento Android)
- **Xcode** (para desenvolvimento iOS - apenas macOS)
- **Git** para controle de versão

### Instalação

```bash
# Clone o repositório
git clone <repository_url>
cd techfinance/app

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Edite app.config.ts com suas configurações

# Inicie o servidor de desenvolvimento
npm start
```

### Estrutura do Projeto

```
src/
├── app/              # Telas da aplicação (Expo Router)
│   ├── _layout.tsx   # Layout raiz com autenticação
│   ├── index.tsx     # Tela de login
│   ├── home.tsx      # Dashboard principal
│   ├── chat/         # Chat com Dinho Bot
│   ├── customer/     # Telas de clientes
│   ├── product/      # Telas de produtos
│   ├── reports/      # Relatórios e analytics
│   └── sales/        # Telas de vendas
├── components/       # Componentes reutilizáveis
├── config/          # Configurações (env, constantes)
├── hooks/           # Hooks customizados (estado global)
├── lib/             # Bibliotecas e configurações
├── models/          # Interfaces TypeScript
├── repositories/    # Camada de acesso aos dados
├── services/        # Serviços externos (OpenAI)
├── styles/          # Estilos globais
├── types/           # Definições de tipos
└── utils/           # Funções utilitárias
```

## Desenvolvimento

### Adicionando Novas Telas

1. **Criar a tela no diretório `src/app/`**:

```typescript
// src/app/nova-tela.tsx
import { View, Text } from 'react-native';

export default function NovaTela() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl font-bold">Nova Tela</Text>
    </View>
  );
}
```

2. **A rota será criada automaticamente** pelo Expo Router baseada no nome do arquivo.

### Adicionando Novos Repositories

1. **Criar o repository**:

```typescript
// src/repositories/exemplo.repository.ts
import { api } from '@/lib/api';

export interface ExemploQuerySchema {
  filtro?: string;
  limite?: number;
  pagina?: number;
}

export class ExemploRepository {
  private readonly endpoint = 'exemplo';

  async search(query: ExemploQuerySchema): Promise<any[]> {
    const response = await api.get(this.endpoint, { params: query });
    return response.data;
  }

  async getById(id: string): Promise<any> {
    const response = await api.get(`${this.endpoint}/${id}`);
    return response.data;
  }
}
```

2. **Criar hook para usar o repository** (opcional):

```typescript
// src/hooks/useExemplo.ts
import { useState, useEffect } from 'react';
import { ExemploRepository } from '@/repositories/exemplo.repository';

export function useExemplo() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const repository = new ExemploRepository();

  const fetchData = async (query = {}) => {
    setLoading(true);
    try {
      const result = await repository.search(query);
      setData(result);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchData };
}
```

### Adicionando Novos Hooks de Estado Global

```typescript
// src/hooks/useExample.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ExampleState {
  data: any[];
  selectedItem: any | null;
  setData: (data: any[]) => void;
  setSelectedItem: (item: any) => void;
  clearData: () => void;
}

export const useExample = create<ExampleState>()(
  persist(
    (set) => ({
      data: [],
      selectedItem: null,
      setData: (data) => set({ data }),
      setSelectedItem: (selectedItem) => set({ selectedItem }),
      clearData: () => set({ data: [], selectedItem: null }),
    }),
    {
      name: 'example-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Adicionando Componentes Reutilizáveis

```typescript
// src/components/Button.tsx
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';
import { cn } from '@/utils/cn'; // função para combinar classes

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={cn(
        'rounded-lg items-center justify-center',
        {
          'bg-blue-600': variant === 'primary',
          'bg-gray-600': variant === 'secondary',
          'border border-blue-600 bg-transparent': variant === 'outline',
        },
        {
          'px-3 py-2': size === 'sm',
          'px-4 py-3': size === 'md',
          'px-6 py-4': size === 'lg',
        },
        className
      )}
      {...props}
    >
      <Text
        className={cn(
          'font-medium',
          {
            'text-white': variant === 'primary' || variant === 'secondary',
            'text-blue-600': variant === 'outline',
          },
          {
            'text-sm': size === 'sm',
            'text-base': size === 'md',
            'text-lg': size === 'lg',
          }
        )}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
```

## Configuração de Ambiente

### Variáveis de Ambiente

```typescript
// src/config/env.ts
import Constants from 'expo-constants';
import { z } from 'zod';

export const envSchema = z.object({
  OPENAI_API_KEY: z.string(),
  API_BASE_URL: z.string().url(),
  API_TOKEN: z.string(),
  // Adicione outras variáveis aqui
});

export type Env = z.infer<typeof envSchema>;
export const env = envSchema.parse(Constants.expoConfig?.extra);
```

```typescript
// app.config.ts
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  // ... outras configurações
  extra: {
    openAiKey: process.env.OPENAI_API_KEY,
    apiBaseUrl: process.env.API_BASE_URL || 'https://techfinance-api.fly.dev/',
    apiToken: process.env.API_TOKEN || 'ronaldo',
  },
});
```

### Arquivo `.env` (desenvolvimento local)

```env
# .env
OPENAI_API_KEY=sk-your-openai-key-here
API_BASE_URL=http://localhost:3000/
API_TOKEN=your-dev-token
```

## Estilização com NativeWind

### Configuração Básica

```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,tsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        }
      }
    },
  },
  plugins: [],
}
```

### Uso em Componentes

```typescript
// Exemplo de uso
<View className="flex-1 bg-gray-50 p-4">
  <Text className="text-2xl font-bold text-gray-900 mb-4">
    Título da Tela
  </Text>
  <TouchableOpacity className="bg-blue-600 px-4 py-3 rounded-lg active:bg-blue-700">
    <Text className="text-white font-medium text-center">
      Botão
    </Text>
  </TouchableOpacity>
</View>
```

## Gerenciamento de Estado

### Zustand - Estado Global

```typescript
// Exemplo de store completo
interface AppState {
  // Data
  user: User | null;
  products: Product[];
  customers: Customer[];

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Async Actions
  fetchProducts: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      products: [],
      customers: [],
      isLoading: false,
      error: null,

      // Sync actions
      setUser: (user) => set({ user }),
      setProducts: (products) => set({ products }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Async actions
      fetchProducts: async () => {
        set({ isLoading: true, error: null });
        try {
          const repository = new ProductRepository();
          const products = await repository.search({});
          set({ products, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      logout: async () => {
        set({ user: null });
        // Limpar outros dados se necessário
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Especificar quais campos persistir
      partialize: (state) => ({
        user: state.user,
        products: state.products,
        customers: state.customers,
      }),
    }
  )
);
```

## Cache e Dados Offline

### Implementando Cache Inteligente

```typescript
// src/hooks/useDataWithCache.ts
import { useState, useEffect } from 'react';
import { useCache } from './useCache';
import { useConnection } from './useConnection';

export function useDataWithCache<T>(
  fetcher: () => Promise<T>,
  cacheKey: keyof CacheState,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cache = useCache();
  const { isOnline } = useConnection();

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      if (isOnline || forceRefresh) {
        // Buscar dados online
        const result = await fetcher();
        setData(result);
        // Atualizar cache
        if (cacheKey === 'products') cache.setProducts(result as any);
        if (cacheKey === 'customers') cache.setCustomers(result as any);
        // ... outros casos
      } else {
        // Usar dados do cache
        const cachedData = cache[cacheKey] as T;
        setData(cachedData);
      }
    } catch (err) {
      setError(err.message);
      // Fallback para cache em caso de erro
      const cachedData = cache[cacheKey] as T;
      if (cachedData) {
        setData(cachedData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isOnline, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
}
```

## Navegação (Expo Router)

### Estrutura de Rotas

```
app/
├── _layout.tsx          # Layout raiz com AuthGuard
├── (auth)/             # Grupo de rotas de autenticação
│   ├── _layout.tsx     # Layout das telas de auth
│   └── login.tsx       # Tela de login
├── (tabs)/             # Grupo de rotas com tabs
│   ├── _layout.tsx     # Layout com bottom tabs
│   ├── home.tsx        # Home tab
│   ├── products.tsx    # Products tab
│   └── reports.tsx     # Reports tab
└── modal.tsx           # Modal de exemplo
```

### AuthGuard

```typescript
// app/_layout.tsx
import { useAuth } from '@/hooks/useAuth';
import { Redirect, Slot } from 'expo-router';

export default function RootLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Slot />;
}
```

### Navegação Programática

```typescript
import { router } from 'expo-router';

// Navegar para uma tela
router.push('/products');

// Navegar com parâmetros
router.push({
  pathname: '/product/[id]',
  params: { id: '123' }
});

// Voltar
router.back();

// Substituir a tela atual
router.replace('/home');
```

## Integração com APIs

### Cliente HTTP com Interceptors

```typescript
// src/lib/api.ts
import { env } from '@/config/env';
import axios from 'axios';

export const api = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Authorization': `Bearer ${env.API_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// Interceptor de request
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor de response
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[API] Response error:', error.response?.status, error.response?.data);

    // Tratar erros específicos
    if (error.response?.status === 401) {
      // Logout automático em caso de não autorizado
      // router.replace('/login');
    }

    return Promise.reject(error);
  }
);
```

## Testes

### Configuração do Jest

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.(ts|tsx|js)', '**/*.(test|spec).(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### Exemplo de Teste

```typescript
// src/hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    // Reset do state store antes de cada teste
  });

  it('should login with correct credentials', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const success = await result.current.login('admin', 'admin');
      expect(success).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('admin');
  });

  it('should fail login with incorrect credentials', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const success = await result.current.login('wrong', 'credentials');
      expect(success).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
```

## Build e Deploy

### Build para Desenvolvimento

```bash
# Executar no simulador/emulador
npm run android
npm run ios
npm run web

# Build preview (EAS)
eas build --profile preview --platform android
```

### Build para Produção

```bash
# Configurar EAS
npm install -g @expo/eas-cli
eas login
eas init

# Build para produção
eas build --profile production --platform all

# Submit para stores
eas submit --platform ios
eas submit --platform android
```

### Configuração EAS

```json
// eas.json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./service-account-key.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      }
    }
  }
}
```

## Performance

### Otimizações

1. **Lazy Loading de Telas**:

```typescript
// src/app/heavy-screen.tsx
import { lazy, Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';

const HeavyComponent = lazy(() => import('@/components/HeavyComponent'));

export default function HeavyScreen() {
  return (
    <Suspense
      fallback={
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      }
    >
      <HeavyComponent />
    </Suspense>
  );
}
```

2. **Otimização de Listas**:

```typescript
import { FlashList } from "@shopify/flash-list";

function ProductList({ products }: { products: Product[] }) {
  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard product={item} />
  );

  return (
    <FlashList
      data={products}
      renderItem={renderItem}
      estimatedItemSize={100}
      keyExtractor={(item) => item.id_produto}
      // Performance props
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
}
```

3. **Memoização**:

```typescript
import { memo, useMemo, useCallback } from 'react';

const ProductCard = memo(({ product }: { product: Product }) => {
  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(product.price);
  }, [product.price]);

  return (
    <View className="p-4 border-b border-gray-200">
      <Text className="font-bold">{product.nome_produto}</Text>
      <Text className="text-green-600">{formattedPrice}</Text>
    </View>
  );
});
```

## Debugging

### React Native Debugger

```bash
# Instalar
npm install -g react-native-debugger

# Configurar no app
import { connectToDevTools } from 'react-devtools-core';

if (__DEV__) {
  connectToDevTools({
    host: 'localhost',
    port: 8097,
  });
}
```

### Flipper (React Native)

```typescript
// src/utils/flipper.ts
import { logger } from 'flipper';

export const flipperLogger = {
  log: (message: string, data?: any) => {
    if (__DEV__) {
      logger.log(message, data);
      console.log(`[Flipper] ${message}`, data);
    }
  },

  error: (message: string, error?: any) => {
    if (__DEV__) {
      logger.error(message, error);
      console.error(`[Flipper] ${message}`, error);
    }
  }
};
```

## Boas Práticas

### Estrutura de Código

1. **Organize imports**:

```typescript
// 1. React e bibliotecas
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// 2. Bibliotecas externas
import axios from 'axios';
import { router } from 'expo-router';

// 3. Imports locais (absolute paths)
import { useAuth } from '@/hooks/useAuth';
import { ProductRepository } from '@/repositories/product.repository';
import { Button } from '@/components/Button';

// 4. Imports relativos
import './styles.css';
```

2. **Type Safety**:

```typescript
// Sempre tipear props e state
interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
  variant?: 'default' | 'compact';
}

// Usar generics quando apropriado
function useAsyncData<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  // ...
}
```

3. **Error Boundaries**:

```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-xl font-bold text-red-600 mb-4">
            Algo deu errado
          </Text>
          <Text className="text-gray-600 text-center mb-4">
            {this.state.error?.message}
          </Text>
          <TouchableOpacity
            className="bg-blue-600 px-4 py-2 rounded"
            onPress={() => this.setState({ hasError: false })}
          >
            <Text className="text-white">Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
```

## Troubleshooting

### Problemas Comuns

1. **Metro bundler issues**:
```bash
# Limpar cache
npx expo start --clear
npm start -- --reset-cache
```

2. **Android build errors**:
```bash
# Limpar build Android
cd android && ./gradlew clean && cd ..
```

3. **iOS build errors**:
```bash
# Limpar build iOS
cd ios && rm -rf build && cd ..
npx pod-install ios
```

4. **AsyncStorage errors**:
```typescript
// Verificar se dados existem antes de usar
const storedData = await AsyncStorage.getItem('key');
if (storedData) {
  const parsedData = JSON.parse(storedData);
  // usar parsedData
}
```

### Logs e Monitoramento

```typescript
// src/utils/logger.ts
interface LogLevel {
  DEBUG: 0;
  INFO: 1;
  WARN: 2;
  ERROR: 3;
}

class Logger {
  private level: number = __DEV__ ? 0 : 2;

  debug(message: string, data?: any) {
    if (this.level <= 0) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }

  info(message: string, data?: any) {
    if (this.level <= 1) {
      console.info(`[INFO] ${message}`, data);
    }
  }

  warn(message: string, data?: any) {
    if (this.level <= 2) {
      console.warn(`[WARN] ${message}`, data);
    }
  }

  error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error);
    // Enviar para serviço de monitoramento em produção
  }
}

export const logger = new Logger();
```

## Contribuição

### Git Workflow

```bash
# Criar branch para feature
git checkout -b feature/nova-funcionalidade

# Fazer commits descritivos
git commit -m "feat: adicionar tela de relatórios de vendas"

# Push e criar PR
git push origin feature/nova-funcionalidade
```

### Code Review Checklist

- [ ] Código segue padrões do TypeScript
- [ ] Componentes são reutilizáveis
- [ ] Performance otimizada
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Sem warnings ou errors
- [ ] Build funciona em todas as plataformas

### Commit Messages

Seguir conventional commits:

```
feat: adicionar nova funcionalidade
fix: corrigir bug específico
docs: atualizar documentação
style: formatação de código
refactor: refatorar código existente
test: adicionar ou atualizar testes
chore: tarefas de manutenção
```
