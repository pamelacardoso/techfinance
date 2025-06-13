import { MCPAnalysisResult, MCPContext, MCPService } from '@/services/mcp.service';
import { useCallback, useState } from 'react';
import { useConnection } from './useConnection';

export function useMCP() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [contexts, setContexts] = useState<MCPContext[]>([]);
    const { isOnline, setOnline, setLastSync } = useConnection();

    const mcpService = new MCPService(); const handleError = useCallback((err: any) => {
        setError(err.message || 'Erro ao comunicar com servidor de análises');
        setOnline(false);
    }, [setOnline]);

    const handleSuccess = useCallback(() => {
        setError(null);
        setOnline(true);
        setLastSync(new Date().toISOString());
    }, [setOnline, setLastSync]);

    // Gerenciamento de contextos
    const createContext = useCallback(async (
        name: string,
        description: string,
        data: Record<string, any>,
        metadata?: Record<string, any>
    ): Promise<MCPContext | null> => {
        setIsLoading(true);
        try {
            const context = await mcpService.createContext(name, description, data, metadata);
            handleSuccess();
            return context;
        } catch (err) {
            handleError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [handleSuccess, handleError]);

    const updateContext = useCallback(async (
        id: string,
        updates: Partial<MCPContext>
    ): Promise<MCPContext | null> => {
        setIsLoading(true);
        try {
            const context = await mcpService.updateContext(id, updates);
            handleSuccess();
            return context;
        } catch (err) {
            handleError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [handleSuccess, handleError]);

    const deleteContext = useCallback(async (id: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const success = await mcpService.deleteContext(id);
            if (success) {
                setContexts(prev => prev.filter(ctx => ctx.id !== id));
                handleSuccess();
            }
            return success;
        } catch (err) {
            handleError(err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [handleSuccess, handleError]);

    const loadContexts = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            const contextsList = await mcpService.listContexts();
            setContexts(contextsList);
            handleSuccess();
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, [handleSuccess, handleError]);

    // Análises financeiras
    const analyzeReceivables = useCallback(async (data: any[]): Promise<MCPAnalysisResult | null> => {
        setIsLoading(true);
        try {
            const result = await mcpService.analyzeReceivables(data);
            handleSuccess();
            return result;
        } catch (err) {
            handleError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [handleSuccess, handleError]);

    const analyzeCashFlow = useCallback(async (data: any[]): Promise<MCPAnalysisResult | null> => {
        setIsLoading(true);
        try {
            const result = await mcpService.analyzeCashFlow(data);
            handleSuccess();
            return result;
        } catch (err) {
            handleError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [handleSuccess, handleError]);

    const analyzeSales = useCallback(async (data: any[]): Promise<MCPAnalysisResult | null> => {
        setIsLoading(true);
        try {
            const result = await mcpService.analyzeSales(data);
            handleSuccess();
            return result;
        } catch (err) {
            handleError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [handleSuccess, handleError]);

    // Prompts especializados
    const getRenegotiationPrompt = useCallback(async (
        titlesData: any[],
        criteria: any,
        baseDate: string
    ): Promise<string | null> => {
        setIsLoading(true);
        try {
            const prompt = await mcpService.getRenegotiationPrompt(titlesData, criteria, baseDate);
            handleSuccess();
            return prompt;
        } catch (err) {
            handleError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [handleSuccess, handleError]);

    const getCustomerAnalysisPrompt = useCallback(async (
        customerData: any,
        salesHistory: any[],
        paymentHistory: any[]
    ): Promise<string | null> => {
        setIsLoading(true);
        try {
            const prompt = await mcpService.getCustomerAnalysisPrompt(customerData, salesHistory, paymentHistory);
            handleSuccess();
            return prompt;
        } catch (err) {
            handleError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [handleSuccess, handleError]);

    // Funções de conveniência
    const createRenegotiationContext = useCallback(async (
        titlesData: any[],
        criteria: any
    ): Promise<MCPContext | null> => {
        setIsLoading(true);
        try {
            const context = await mcpService.createRenegotiationContext(titlesData, criteria);
            handleSuccess();
            return context;
        } catch (err) {
            handleError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [handleSuccess, handleError]);

    const generateReport = useCallback(async (
        reportType: string,
        format: string = 'json',
        filters?: any
    ): Promise<any> => {
        setIsLoading(true);
        try {
            const report = await mcpService.generateReport(reportType, format, filters);
            handleSuccess();
            return report;
        } catch (err) {
            handleError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [handleSuccess, handleError]);

    return {
        // Estado
        isLoading,
        error,
        contexts,
        isOnline,

        // Contextos
        createContext,
        updateContext,
        deleteContext,
        loadContexts,

        // Análises
        analyzeReceivables,
        analyzeCashFlow,
        analyzeSales,

        // Prompts
        getRenegotiationPrompt,
        getCustomerAnalysisPrompt,

        // Conveniência
        createRenegotiationContext,
        generateReport,

        // Utilitários
        clearError: () => setError(null)
    };
}
