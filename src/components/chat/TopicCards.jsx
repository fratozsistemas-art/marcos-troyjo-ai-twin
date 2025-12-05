import React from 'react';
import { motion } from 'framer-motion';
import { Globe, TrendingUp, Building2, Landmark, Leaf, Scale, Lightbulb } from 'lucide-react';

const topics = {
    pt: [
        { icon: Globe, title: "Economia Global", prompt: "Qual é sua visão sobre o atual cenário da economia global e as principais tendências para os próximos anos?" },
        { icon: TrendingUp, title: "Brasil Competitivo", prompt: "Como o Brasil pode melhorar sua competitividade no cenário internacional?" },
        { icon: Building2, title: "BRICS", prompt: "Qual o papel dos BRICS na nova ordem econômica mundial?" },
        { icon: Landmark, title: "Comércio", prompt: "Quais acordos comerciais o Brasil deveria priorizar?" },
        { icon: Lightbulb, title: "Inovação", prompt: "Como a tecnologia e inovação podem ser usadas como ferramentas diplomáticas e de desenvolvimento?" },
        { icon: Leaf, title: "Sustentabilidade", prompt: "Como o Brasil pode liderar a transição para uma economia verde?" },
    ],
    en: [
        { icon: Globe, title: "Global Economy", prompt: "What is your view on the current global economy and main trends for the coming years?" },
        { icon: TrendingUp, title: "Brazil Competitiveness", prompt: "How can Brazil improve its competitiveness on the international stage?" },
        { icon: Building2, title: "BRICS", prompt: "What is the role of BRICS in the new world economic order?" },
        { icon: Landmark, title: "Trade", prompt: "Which trade agreements should Brazil prioritize?" },
        { icon: Lightbulb, title: "Innovation", prompt: "How can technology and innovation be used as diplomatic and development tools?" },
        { icon: Leaf, title: "Sustainability", prompt: "How can Brazil lead the transition to a green economy?" },
    ]
};

export default function TopicCards({ lang = 'pt', onSelect }) {
    const t = topics[lang] || topics.pt;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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