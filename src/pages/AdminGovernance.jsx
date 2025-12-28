import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Shield, Settings, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminGovernance() {
  const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');

  const content = {
    pt: {
      title: 'Painel de Governança',
      subtitle: 'Controle de parâmetros, decisões e qualidade da IA',
      back: 'Voltar',
      comingSoon: 'Em breve',
      description: 'Sistema completo de governança com CRV scoring, resolução de paradoxos e rastreabilidade total.',
      features: [
        {
          icon: Settings,
          title: 'CRV Scoring',
          description: 'Ajuste de thresholds de Confidence, Risk e Value para cada resposta da IA'
        },
        {
          icon: AlertTriangle,
          title: 'Resolução de Paradoxos',
          description: 'Histórico e análise de conflitos detectados entre fontes de dados'
        },
        {
          icon: CheckCircle,
          title: 'Audit Trail',
          description: 'Rastreabilidade completa de todas as decisões e fontes utilizadas'
        }
      ]
    },
    en: {
      title: 'Governance Panel',
      subtitle: 'Control of parameters, decisions and AI quality',
      back: 'Back',
      comingSoon: 'Coming soon',
      description: 'Complete governance system with CRV scoring, paradox resolution and complete traceability.',
      features: [
        {
          icon: Settings,
          title: 'CRV Scoring',
          description: 'Adjustment of Confidence, Risk and Value thresholds for each AI response'
        },
        {
          icon: AlertTriangle,
          title: 'Paradox Resolution',
          description: 'History and analysis of conflicts detected between data sources'
        },
        {
          icon: CheckCircle,
          title: 'Audit Trail',
          description: 'Complete traceability of all decisions and sources used'
        }
      ]
    }
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.back}
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">{t.subtitle}</p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {t.features.map((feature, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{lang === 'pt' ? 'Controles de Governança' : 'Governance Controls'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.comingSoon}</p>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">{t.description}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}