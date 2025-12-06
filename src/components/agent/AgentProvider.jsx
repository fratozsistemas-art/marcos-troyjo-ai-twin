import React, { createContext, useContext, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

const AgentContext = createContext(null);

export function useAgent() {
    const context = useContext(AgentContext);
    if (!context) {
        throw new Error('useAgent must be used within AgentProvider');
    }
    return context;
}

function getUiSnapshot() {
    const screenEl = document.querySelector('[data-ai-screen]');
    const screen = screenEl?.getAttribute('data-ai-screen') || null;

    const elements = [];
    document.querySelectorAll('[data-ai-id]').forEach((el) => {
        const element = el;
        const id = element.getAttribute('data-ai-id');
        const role = element.getAttribute('data-ai-role') || 'unknown';
        const rect = element.getBoundingClientRect();

        let value = null;
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            value = element.value;
        }

        elements.push({
            id,
            role,
            text: element.textContent?.trim() || null,
            value,
            visible: rect.width > 0 && rect.height > 0,
            disabled: element.disabled ?? false,
        });
    });

    return { screen, elements };
}

function executeAction(action, navigate) {
    const { name, args } = action;

    if (name === 'click_element') {
        const el = document.querySelector(`[data-ai-id="${args.element_id}"]`);
        if (el) {
            el.click();
            return true;
        }
    }

    if (name === 'set_value') {
        const el = document.querySelector(`[data-ai-id="${args.element_id}"]`);
        if (el && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
            el.value = args.value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }
    }

    if (name === 'navigate_to') {
        const url = createPageUrl(args.screen);
        navigate(url);
        return true;
    }

    return false;
}

export function AgentProvider({ children, navigate }) {
    const [isRunning, setIsRunning] = useState(false);
    const [currentGoal, setCurrentGoal] = useState(null);
    const [steps, setSteps] = useState([]);
    const [error, setError] = useState(null);

    const runAgent = useCallback(async (goal, maxSteps = 10) => {
        setIsRunning(true);
        setCurrentGoal(goal);
        setSteps([]);
        setError(null);

        let stepCount = 0;
        let conversationHistory = [];

        while (stepCount < maxSteps) {
            stepCount++;

            const uiState = getUiSnapshot();
            
            try {
                const response = await base44.functions.invoke('agentStep', {
                    goal,
                    ui_state: uiState,
                    conversation_history: conversationHistory,
                });

                const stepData = {
                    step: stepCount,
                    uiState,
                    response: response.data,
                    timestamp: new Date().toISOString(),
                };

                setSteps(prev => [...prev, stepData]);

                if (response.data.type === 'no_action' || response.data.completed) {
                    break;
                }

                if (response.data.type === 'actions') {
                    for (const action of response.data.actions) {
                        const success = executeAction(action, navigate);
                        if (!success) {
                            console.warn('Failed to execute action:', action);
                        }
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }

                    conversationHistory.push({
                        role: 'assistant',
                        content: response.data.reasoning || 'Executed actions',
                    });
                }

                if (response.data.type === 'error') {
                    setError(response.data.error);
                    break;
                }

                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (err) {
                console.error('Agent step error:', err);
                setError(err.message);
                break;
            }
        }

        setIsRunning(false);
    }, [navigate]);

    const stopAgent = useCallback(() => {
        setIsRunning(false);
        setCurrentGoal(null);
    }, []);

    return (
        <AgentContext.Provider value={{
            isRunning,
            currentGoal,
            steps,
            error,
            runAgent,
            stopAgent,
        }}>
            {children}
        </AgentContext.Provider>
    );
}