import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Database, Plus, Shield, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDataSources() {
  const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');

  const content = {
    pt: {
      title: 'Fontes de Dados',
      subtitle: 'Gerencie fontes de dados personalizadas para análises estratégicas',
      back: 'Voltar',
      addSource: 'Adicionar Fonte',
      comingSoon: 'Em breve',
      description: 'Sistema de gerenciamento de fontes de dados com criptografia end-to-end e rastreabilidade completa.',
      features: [
        {
          icon: Shield,
          title: 'Segurança End-to-End',
          description: 'Criptografia AES-256 e isolamento total de dados por usuário'
        },
        {
          icon: Lock,
          title: 'Privacidade Garantida',
          description: 'Seus dados nunca são compartilhados ou usados para treinar modelos'
        },
        {
          icon: CheckCircle,
          title: 'Rastreabilidade Completa',
          description: 'Audit trail mostra exatamente como seus dados são usados em cada análise'
        }
      ]
    },
    en: {
      title: 'Data Sources',
      subtitle: 'Manage custom data sources for strategic analyses',
      back: 'Back',
      addSource: 'Add Source',
      comingSoon: 'Coming soon',
      description: 'Data source management system with end-to-end encryption and complete traceability.',
      features: [
        {
          icon: Shield,
          title: 'End-to-End Security',
          description: 'AES-256 encryption and complete data isolation per user'
        },
        {
          icon: Lock,
          title: 'Privacy Guaranteed',
          description: 'Your data is never shared or used to train models'
        },
        {
          icon: CheckCircle,
          title: 'Complete Traceability',
          description: 'Audit trail shows exactly how your data is used in each analysis'
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
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <Database className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">{t.subtitle}</p>
        </motion.div>

        {/* Security Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {t.features.map((feature, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600/20 to-cyan-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
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
              <CardTitle className="flex items-center justify-between">
                <span>{lang === 'pt' ? 'Gerenciamento de Fontes' : 'Source Management'}</span>
                <Button disabled className="bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  {t.addSource}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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