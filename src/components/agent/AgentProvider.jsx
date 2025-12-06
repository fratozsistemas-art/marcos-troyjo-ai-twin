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

function getElementContent(elementId) {
    const el = document.querySelector(`[data-ai-id="${elementId}"]`);
    if (!el) return null;

    const content = {
        id: elementId,
        exists: true,
        visible: el.offsetParent !== null,
        text: el.textContent?.trim() || '',
        html: el.innerHTML?.substring(0, 500) || '',
    };

    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        content.value = el.value;
        content.placeholder = el.placeholder;
        content.type = el.type;
        content.disabled = el.disabled;
        content.readOnly = el.readOnly;
    }

    if (el instanceof HTMLSelectElement) {
        content.value = el.value;
        content.selectedIndex = el.selectedIndex;
        content.options = Array.from(el.options).map(o => ({
            text: o.text,
            value: o.value,
            selected: o.selected
        }));
    }

    const styles = window.getComputedStyle(el);
    content.styles = {
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
    };

    return content;
}

function captureUIState() {
    const screen = document.querySelector('[data-ai-screen]')?.getAttribute('data-ai-screen');
    const elements = Array.from(document.querySelectorAll('[data-ai-id]')).map(el => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0 && 
                         window.getComputedStyle(el).visibility !== 'hidden' &&
                         window.getComputedStyle(el).display !== 'none';

        const baseInfo = {
            id: el.getAttribute('data-ai-id'),
            role: el.getAttribute('data-ai-role'),
            tag: el.tagName.toLowerCase(),
            text: el.textContent?.trim().substring(0, 150) || '',
            visible: isVisible,
            disabled: el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true',
        };

        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
            baseInfo.value = el.value;
            baseInfo.placeholder = el.placeholder;
            baseInfo.type = el.type;
        }

        if (el instanceof HTMLSelectElement) {
            baseInfo.value = el.value;
            baseInfo.options = Array.from(el.options).map(o => o.text);
        }

        if (el.getAttribute('aria-label')) {
            baseInfo.label = el.getAttribute('aria-label');
        }

        if (el.getAttribute('aria-checked')) {
            baseInfo.checked = el.getAttribute('aria-checked') === 'true';
        }

        if (el.getAttribute('aria-expanded')) {
            baseInfo.expanded = el.getAttribute('aria-expanded') === 'true';
        }

        return baseInfo;
    });

    return { screen, elements, timestamp: Date.now() };
}

function getUiSnapshot() {
    return captureUIState();
}

async function executeAction(action, navigate, onConfirmation) {
    const { name, args, requires_confirmation } = action;

    if (requires_confirmation) {
        const confirmed = await onConfirmation(action);
        if (!confirmed) {
            return { success: false, reason: 'User denied confirmation', state: null };
        }
    }

    if (name === 'get_element_content') {
        const content = getElementContent(args.element_id);
        if (content) {
            return { 
                success: true, 
                reason: args.reason,
                state: content,
                type: 'read'
            };
        }
        return { success: false, reason: 'Element not found', state: null };
    }

    if (name === 'read_ui_state') {
        const uiState = captureUIState();
        const focusArea = args.focus_area || 'all';
        
        let filteredElements = uiState.elements;
        if (focusArea === 'interactive') {
            filteredElements = uiState.elements.filter(el => 
                el.role === 'button' || el.tag === 'button' || el.tag === 'input' || el.tag === 'a'
            );
        } else if (focusArea === 'content') {
            filteredElements = uiState.elements.filter(el => 
                el.text.length > 0 && el.role !== 'button'
            );
        } else if (focusArea === 'navigation') {
            filteredElements = uiState.elements.filter(el => 
                el.tag === 'a' || el.id?.includes('nav') || el.id?.includes('menu')
            );
        }

        return {
            success: true,
            reason: args.reason,
            state: {
                screen: uiState.screen,
                focus_area: focusArea,
                element_count: filteredElements.length,
                elements: filteredElements
            },
            type: 'read'
        };
    }

    if (name === 'click_element') {
        const el = document.querySelector(`[data-ai-id="${args.element_id}"]`);
        if (el) {
            const beforeState = getElementContent(args.element_id);
            el.click();
            
            await new Promise(resolve => setTimeout(resolve, 300));
            const afterState = getElementContent(args.element_id);
            
            return { 
                success: true, 
                reason: args.reason,
                state: {
                    before: beforeState,
                    after: afterState,
                    state_changed: JSON.stringify(beforeState) !== JSON.stringify(afterState)
                }
            };
        }
        return { success: false, reason: 'Element not found', state: null };
    }

    if (name === 'set_value') {
        const el = document.querySelector(`[data-ai-id="${args.element_id}"]`);
        if (el && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
            const beforeValue = el.value;
            el.value = args.value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            
            await new Promise(resolve => setTimeout(resolve, 200));
            const afterValue = el.value;
            
            return { 
                success: true, 
                reason: args.reason,
                state: {
                    before: beforeValue,
                    after: afterValue,
                    verified: args.verify_after ? afterValue === args.value : true
                }
            };
        }
        return { success: false, reason: 'Input element not found', state: null };
    }

    if (name === 'navigate_to') {
        const beforeScreen = document.querySelector('[data-ai-screen]')?.getAttribute('data-ai-screen');
        const url = createPageUrl(args.screen);
        navigate(url);
        
        return { 
            success: true, 
            reason: args.reason,
            state: {
                from: beforeScreen,
                to: args.screen
            }
        };
    }

    return { success: false, reason: 'Unknown action', state: null };
}

export function AgentProvider({ children, navigate }) {
    const [isRunning, setIsRunning] = useState(false);
    const [currentGoal, setCurrentGoal] = useState(null);
    const [steps, setSteps] = useState([]);
    const [error, setError] = useState(null);
    const [pendingConfirmation, setPendingConfirmation] = useState(null);

    const handleConfirmation = useCallback((action) => {
        return new Promise((resolve) => {
            setPendingConfirmation({
                action,
                resolve,
            });
        });
    }, []);

    const confirmAction = useCallback((confirmed) => {
        if (pendingConfirmation) {
            pendingConfirmation.resolve(confirmed);
            setPendingConfirmation(null);
        }
    }, [pendingConfirmation]);

    const runAgent = useCallback(async (goal, maxSteps = 15) => {
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
                    step_count: stepCount,
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
                    const actionResults = [];
                    
                    for (const action of response.data.actions) {
                        const result = await executeAction(action, navigate, handleConfirmation);
                        actionResults.push({ action, result });
                        
                        if (!result.success) {
                            console.warn('Failed to execute action:', action, result.reason);
                        }
                        
                        await new Promise(resolve => setTimeout(resolve, 800));
                    }

                    conversationHistory.push({
                        role: 'assistant',
                        content: response.data.reasoning || 'Executed actions',
                    });

                    setSteps(prev => {
                        const updated = [...prev];
                        updated[updated.length - 1] = {
                            ...updated[updated.length - 1],
                            actionResults,
                        };
                        return updated;
                    });
                }

                if (response.data.type === 'blocked') {
                    setError(`Actions blocked: ${response.data.explanation}`);
                    break;
                }

                if (response.data.type === 'max_steps_reached') {
                    break;
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
            pendingConfirmation,
            confirmAction,
        }}>
            {children}
        </AgentContext.Provider>
    );
}