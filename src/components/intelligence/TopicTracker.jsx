// Topic extraction and tracking utility
import { base44 } from '@/api/base44Client';

const TOPIC_MAP = {
    brics: ['brics', 'ndb', 'novo banco', 'banco de desenvolvimento', 'emergentes', 'bloco'],
    china: ['china', 'pequim', 'xi jinping', 'sino', 'chinês', 'chinesa'],
    trade: ['comércio', 'exportação', 'importação', 'balança comercial', 'acordo comercial', 'mercosul'],
    competitiveness: ['competitividade', 'produtividade', 'inovação', 'tecnologia', 'indústria 4.0'],
    energy: ['energia', 'petróleo', 'renováveis', 'transição energética', 'sustentabilidade'],
    agriculture: ['agricultura', 'agronegócio', 'commodities', 'soja', 'alimentos'],
    diplomacy: ['diplomacia', 'diplomático', 'negociação', 'acordo', 'multilateral'],
    finance: ['finanças', 'financeiro', 'investimento', 'ied', 'capital'],
    development: ['desenvolvimento', 'crescimento', 'infraestrutura']
};

export function extractTopics(message) {
    if (!message || typeof message !== 'string') return [];
    
    const messageLower = message.toLowerCase();
    const detectedTopics = [];
    
    for (const [topic, keywords] of Object.entries(TOPIC_MAP)) {
        if (keywords.some(kw => messageLower.includes(kw))) {
            detectedTopics.push(topic);
        }
    }
    
    return [...new Set(detectedTopics)]; // Remove duplicates
}

export async function logTopics(conversationId, userMessage) {
    try {
        const topics = extractTopics(userMessage);
        const user = await base44.auth.me();
        
        if (topics.length > 0 && user) {
            // Update UserProfile with topic history
            const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
            
            if (profiles.length > 0) {
                const profile = profiles[0];
                const topicHistory = profile.topic_history || [];
                
                // Update topic counts
                const updatedHistory = [...topicHistory];
                topics.forEach(topic => {
                    const existing = updatedHistory.find(t => t.topic === topic);
                    if (existing) {
                        existing.count += 1;
                        existing.last_discussed = new Date().toISOString();
                    } else {
                        updatedHistory.push({
                            topic,
                            count: 1,
                            last_discussed: new Date().toISOString()
                        });
                    }
                });
                
                await base44.entities.UserProfile.update(profile.id, {
                    topic_history: updatedHistory
                });
            }
        }
        
        return topics;
    } catch (error) {
        console.error('Error logging topics:', error);
        return [];
    }
}

export async function getTopTopics(userEmail, limit = 5) {
    try {
        const profiles = await base44.entities.UserProfile.filter({ user_email: userEmail });
        
        if (profiles.length > 0 && profiles[0].topic_history) {
            return profiles[0].topic_history
                .sort((a, b) => b.count - a.count)
                .slice(0, limit);
        }
    } catch (error) {
        console.error('Error getting top topics:', error);
    }
    
    return [];
}

export async function generateProactiveSuggestion(userEmail, lang = 'pt') {
    try {
        const topTopics = await getTopTopics(userEmail, 3);
        
        if (topTopics.length === 0 || topTopics[0].count < 3) {
            return null; // Threshold: 3+ mentions
        }
        
        const topTopic = topTopics[0].topic;
        
        const suggestions = {
            pt: {
                brics: "Você demonstra interesse em BRICS. Que tal explorar a recente expansão do bloco com Egito, Etiópia e UAE?",
                china: "Noto seu interesse em relações sino-brasileiras. Posso analisar as dinâmicas comerciais recentes e oportunidades estratégicas.",
                trade: "Você frequentemente pergunta sobre comércio. Quer discutir estratégias de inserção competitiva global do Brasil?",
                competitiveness: "Vejo que competitividade é um tema recorrente. Posso avaliar os pilares de competitividade sistêmica do Brasil.",
                energy: "Notei seu interesse em energia. Quer explorar o papel estratégico do Brasil na transição energética global?",
                agriculture: "Você frequentemente menciona agronegócio. Que tal analisar o Brasil como 'Arábia Saudita dos alimentos'?",
                diplomacy: "Diplomacia econômica é um tema frequente. Posso discutir estratégias de negociação multilateral do Brasil.",
                finance: "Vejo interesse em finanças internacionais. Quer explorar fluxos de IED e oportunidades para o Brasil?",
                development: "Desenvolvimento é tema recorrente. Posso analisar estratégias de crescimento sustentável para economias emergentes."
            },
            en: {
                brics: "I notice your interest in BRICS. Shall we explore the recent bloc expansion with Egypt, Ethiopia and UAE?",
                china: "I see your interest in Sino-Brazilian relations. I can analyze recent trade dynamics and strategic opportunities.",
                trade: "You frequently ask about trade. Want to discuss Brazil's competitive global insertion strategies?",
                competitiveness: "Competitiveness is a recurring theme. I can assess Brazil's systemic competitiveness pillars.",
                energy: "I noticed your interest in energy. Want to explore Brazil's strategic role in the global energy transition?",
                agriculture: "You often mention agribusiness. Shall we analyze Brazil as the 'Saudi Arabia of food'?",
                diplomacy: "Economic diplomacy is a frequent topic. I can discuss Brazil's multilateral negotiation strategies.",
                finance: "I see interest in international finance. Want to explore FDI flows and opportunities for Brazil?",
                development: "Development is a recurring theme. I can analyze sustainable growth strategies for emerging economies."
            }
        };
        
        return suggestions[lang][topTopic] || null;
    } catch (error) {
        console.error('Error generating suggestion:', error);
        return null;
    }
}