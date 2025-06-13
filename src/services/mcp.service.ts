import { api } from '@/lib/api';

export interface MCPContext {
    id: string;
    name: string;
    description: string;
    data: Record<string, any>;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface MCPTool {
    name: string;
    description: string;
    inputSchema: any;
}

export interface MCPPrompt {
    name: string;
    description: string;
    variables: string[];
}

export interface MCPAnalysisResult {
    analysis_type: string;
    [key: string]: any;
}

export class MCPService {
    // Gerenciamento de contextos
    async createContext(name: string, description: string, data: Record<string, any>, metadata?: Record<string, any>): Promise<MCPContext> {
        const response = await api.post('/mcp/contexts', {
            name,
            description,
            data,
            metadata
        });
        return response.data;
    }

    async getContext(id: string): Promise<MCPContext> {
        const response = await api.get(`/mcp/contexts/${id}`);
        return response.data;
    }

    async updateContext(id: string, updates: Partial<MCPContext>): Promise<MCPContext> {
        const response = await api.put(`/mcp/contexts/${id}`, updates);
        return response.data;
    }

    async deleteContext(id: string): Promise<boolean> {
        const response = await api.delete(`/mcp/contexts/${id}`);
        return response.data.success;
    }

    async listContexts(): Promise<MCPContext[]> {
        const response = await api.get('/mcp/contexts');
        return response.data;
    } async executeFinancialAnalysis(data: any[], analysisType: 'cash_flow' | 'receivables' | 'sales'): Promise<MCPAnalysisResult> {
        const response = await api.post('/mcp/tools/analyze_financial_data/execute', {
            data,
            analysisType
        });
        return response.data;
    }

    async generateReport(reportType: string, format: string = 'json', filters?: any): Promise<any> {
        const response = await api.post('/mcp/tools/generate_report/execute', {
            reportType,
            format,
            filters
        });
        return response.data;
    }

    // Gerenciamento de prompts
    async getPrompt(name: string, variables?: Record<string, any>): Promise<string> {
        const params = new URLSearchParams();
        if (variables) {
            Object.entries(variables).forEach(([key, value]) => {
                params.append(key, String(value));
            });
        }

        const response = await api.get(`/mcp/prompts/${name}?${params.toString()}`);
        return response.data.prompt;
    }

    async listPrompts(): Promise<MCPPrompt[]> {
        const response = await api.get('/mcp/prompts');
        return response.data;
    }

    // Listagem de ferramentas
    async listTools(): Promise<MCPTool[]> {
        const response = await api.get('/mcp/tools');
        return response.data;
    }

    // Comunicação JSON-RPC direta
    async sendMCPMessage(method: string, params?: any): Promise<any> {
        const message = {
            jsonrpc: '2.0',
            id: Date.now(),
            method,
            params
        };

        const response = await api.post('/mcp', message);

        if (response.data.error) {
            throw new Error(response.data.error.message);
        }

        return response.data.result;
    }

    // Métodos de conveniência para análises específicas do TechFinance
    async analyzeReceivables(receivablesData: any[]): Promise<MCPAnalysisResult> {
        return this.executeFinancialAnalysis(receivablesData, 'receivables');
    }

    async analyzeCashFlow(cashFlowData: any[]): Promise<MCPAnalysisResult> {
        return this.executeFinancialAnalysis(cashFlowData, 'cash_flow');
    }

    async analyzeSales(salesData: any[]): Promise<MCPAnalysisResult> {
        return this.executeFinancialAnalysis(salesData, 'sales');
    }

    async createRenegotiationContext(titlesData: any[], criteria: any): Promise<MCPContext> {
        return this.createContext(
            'Análise de Renegociação',
            'Contexto para análise de renegociação de títulos',
            {
                titlesData,
                criteria,
                analysisType: 'renegotiation',
                createdAt: new Date().toISOString()
            }
        );
    }

    async getRenegotiationPrompt(titlesData: any[], criteria: any, baseDate: string): Promise<string> {
        return this.getPrompt('renegotiation_analysis', {
            titles_data: JSON.stringify(titlesData),
            criteria: JSON.stringify(criteria),
            base_date: baseDate
        });
    }

    async getCustomerAnalysisPrompt(customerData: any, salesHistory: any[], paymentHistory: any[]): Promise<string> {
        return this.getPrompt('customer_analysis', {
            customer_data: JSON.stringify(customerData),
            sales_history: JSON.stringify(salesHistory),
            payment_history: JSON.stringify(paymentHistory)
        });
    }
}
