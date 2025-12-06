import React from 'react';
import { motion } from 'framer-motion';
import { Globe, TrendingUp, Users, Lightbulb, Sprout, Building2, Scale, Target } from 'lucide-react';

const topics = {
    pt: [
        { icon: Globe, title: "Novo ESG", prompt: "Explique o conceito do 'Novo ESG' (Economia, Segurança, Geopolítica) e como ele difere do ESG tradicional." },
        { icon: TrendingUp, title: "Trampulência", prompt: "Como a 'trampulência' global impacta as estratégias comerciais do Brasil e dos emergentes?" },
        { icon: Sprout, title: "Agronegócio", prompt: "Qual o papel estratégico do agronegócio brasileiro na geopolítica alimentar global e na 'revolução calórica asiática'?" },
        { icon: Lightbulb, title: "Competitividade", prompt: "O que o Brasil precisa fazer para vencer nos 'Jogos Olímpicos da competitividade' global?" },
        { icon: Building2, title: "Infraestrutura Sustentável", prompt: "Como a infraestrutura sustentável pode ser um diferencial competitivo para o Brasil?" },
        { icon: Users, title: "BRICS+", prompt: "Qual o futuro dos BRICS+ com a entrada de novos membros e como isso afeta o equilíbrio geopolítico?" },
        { icon: Scale, title: "Mercosul-UE", prompt: "Quais as implicações estratégicas do Acordo Mercosul-União Europeia para a economia brasileira?" },
        { icon: Target, title: "ODS e Desenvolvimento", prompt: "Como os Objetivos de Desenvolvimento Sustentável se conectam com a estratégia de competitividade brasileira?" },
    ],
    en: [
        { icon: Globe, title: "New ESG", prompt: "Explain the 'New ESG' concept (Economy, Security, Geopolitics) and how it differs from traditional ESG." },
        { icon: TrendingUp, title: "Trumpulence", prompt: "How does global 'trumpulence' impact Brazil's and emerging markets' trade strategies?" },
        { icon: Sprout, title: "Agribusiness", prompt: "What is the strategic role of Brazilian agribusiness in global food geopolitics and the 'Asian caloric revolution'?" },
        { icon: Lightbulb, title: "Competitiveness", prompt: "What does Brazil need to do to win in the global 'Competitiveness Olympics'?" },
        { icon: Building2, title: "Sustainable Infrastructure", prompt: "How can sustainable infrastructure be a competitive advantage for Brazil?" },
        { icon: Users, title: "BRICS+", prompt: "What is the future of BRICS+ with new members and how does this affect the geopolitical balance?" },
        { icon: Scale, title: "Mercosur-EU", prompt: "What are the strategic implications of the Mercosur-European Union Agreement for the Brazilian economy?" },
        { icon: Target, title: "SDGs & Development", prompt: "How do the Sustainable Development Goals connect with Brazil's competitiveness strategy?" },
    ]
};

export default function TopicCards({ lang = 'pt', onSelect }) {
    const t = topics[lang] || topics.pt;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {t.map((topic, index) => (
                <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onSelect(topic.prompt)}
                    className="group p-4 rounded-xl border border-gray-100 hover:border-[#002D62]/20 hover:shadow-md bg-white transition-all duration-200 text-left"
                >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#002D62]/10 to-[#00654A]/10 flex items-center justify-center mb-3 group-hover:from-[#002D62] group-hover:to-[#00654A] transition-all duration-200">
                        <topic.icon className="w-5 h-5 text-[#002D62] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-medium text-sm text-[#333F48] group-hover:text-[#002D62] transition-colors">
                        {topic.title}
                    </h3>
                </motion.button>
            ))}
        </div>
    );
}