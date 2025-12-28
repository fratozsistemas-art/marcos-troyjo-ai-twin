import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Globe, Plus, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminIntegrations() {
  const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');

  const content = {
    pt: {
      title: 'Integrações Externas',
      subtitle: 'Conecte APIs de dados governamentais, econômicos e notícias',
      back: 'Voltar',
      add: 'Nova Integração',
      comingSoon: 'Em breve',
      description: 'Sistema de integrações com APIs gratuitas para enriquecer análises com dados em tempo real.',
      features: [
        {
          title: 'APIs Governamentais',
          desc: 'IBGE, Banco Central, dados oficiais do Brasil',
          examples: ['IBGE Estatísticas', 'Banco Central API', 'Dados Abertos']
        },
        {
          title: 'Dados Econômicos Globais',
          desc: 'World Bank, FMI, FRED - indicadores mundiais',
          examples: ['World Bank Open Data', 'FRED Economic Data', 'IMF Data']
        },
        {
          title: 'Notícias e Mercado',
          desc: 'NewsAPI, Alpha Vantage - informações em tempo real',
          examples: ['NewsAPI', 'Alpha Vantage', 'Financial Times']
        }
      ]
    },
    en: {
      title: 'External Integrations',
      subtitle: 'Connect government, economic and news data APIs',
      back: 'Back',
      add: 'New Integration',
      comingSoon: 'Coming soon',
      description: 'Integration system with free APIs to enrich analyses with real-time data.',
      features: [
        {
          title: 'Government APIs',
          desc: 'IBGE, Central Bank, official Brazilian data',
          examples: ['IBGE Statistics', 'Central Bank API', 'Open Data']
        },
        {
          title: 'Global Economic Data',
          desc: 'World Bank, IMF, FRED - worldwide indicators',
          examples: ['World Bank Open Data', 'FRED Economic Data', 'IMF Data']
        },
        {
          title: 'News and Market',
          desc: 'NewsAPI, Alpha Vantage - real-time information',
          examples: ['NewsAPI', 'Alpha Vantage', 'Financial Times']
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
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center">
              <Globe className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">{t.subtitle}</p>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {t.features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{feature.desc}</p>
                  <div className="space-y-2">
                    {feature.examples.map((example, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">{example}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{lang === 'pt' ? 'Integrações Configuradas' : 'Configured Integrations'}</span>
                <Button disabled className="bg-green-600">
                  <Plus className="w-4 h-4 mr-2" />
                  {t.add}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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