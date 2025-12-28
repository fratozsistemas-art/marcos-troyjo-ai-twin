import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MessageSquare, Users, Zap, CheckCircle2, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AdminChannels() {
  const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');

  const content = {
    pt: {
      title: 'Canais de Comunicação',
      subtitle: 'Acesse o Twin em múltiplas plataformas',
      back: 'Voltar',
      whatsapp: {
        title: 'WhatsApp Agent',
        description: 'Consultas estratégicas via WhatsApp com personas adaptativas',
        features: [
          'Respostas otimizadas para mobile',
          'Integração com PersonaMemory',
          'Histórico persistente',
          'Suporte multilíngue'
        ],
        connect: 'Conectar WhatsApp',
        status: 'Ativo'
      },
      teams: {
        title: 'Microsoft Teams',
        description: 'Assistente integrado ao ambiente corporativo',
        features: [
          'Menções em canais',
          'Mensagens diretas',
          'Adaptive Cards',
          'Integração com arquivos'
        ],
        connect: 'Adicionar ao Teams',
        status: 'Beta'
      },
      slack: {
        title: 'Slack Assistant',
        description: 'Integração com workflows do Slack',
        features: [
          'Slash commands',
          'Respostas em threads',
          'Insights agendados',
          'Adaptação por canal'
        ],
        connect: 'Instalar no Slack',
        status: 'Planejado'
      }
    },
    en: {
      title: 'Communication Channels',
      subtitle: 'Access Twin on multiple platforms',
      back: 'Back',
      whatsapp: {
        title: 'WhatsApp Agent',
        description: 'Strategic consultations via WhatsApp with adaptive personas',
        features: [
          'Mobile-optimized responses',
          'PersonaMemory integration',
          'Persistent history',
          'Multilingual support'
        ],
        connect: 'Connect WhatsApp',
        status: 'Active'
      },
      teams: {
        title: 'Microsoft Teams',
        description: 'Assistant integrated into corporate environment',
        features: [
          'Channel mentions',
          'Direct messages',
          'Adaptive Cards',
          'File integration'
        ],
        connect: 'Add to Teams',
        status: 'Beta'
      },
      slack: {
        title: 'Slack Assistant',
        description: 'Integration with Slack workflows',
        features: [
          'Slash commands',
          'Thread replies',
          'Scheduled insights',
          'Channel adaptation'
        ],
        connect: 'Install on Slack',
        status: 'Planned'
      }
    }
  };

  const t = content[lang];

  const channels = [
    {
      id: 'whatsapp',
      icon: MessageSquare,
      color: 'from-green-600 to-emerald-500',
      data: t.whatsapp,
      agentName: 'troyjo_twin'
    },
    {
      id: 'teams',
      icon: Users,
      color: 'from-blue-600 to-indigo-500',
      data: t.teams,
      agentName: 'teams_bot'
    },
    {
      id: 'slack',
      icon: Zap,
      color: 'from-purple-600 to-pink-500',
      data: t.slack,
      agentName: 'slack_assistant'
    }
  ];

  const handleConnect = async (agentName, channelId) => {
    try {
      if (channelId === 'whatsapp') {
        const url = base44.agents.getWhatsAppConnectURL(agentName);
        window.open(url, '_blank');
      } else {
        toast.info(lang === 'pt' ? 'Funcionalidade em desenvolvimento' : 'Feature under development');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">{t.subtitle}</p>
        </motion.div>

        {/* Channel Cards */}
        <div className="grid lg:grid-cols-3 gap-8">
          {channels.map((channel, index) => (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${channel.color} flex items-center justify-center`}>
                      <channel.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      channel.data.status === 'Ativo' || channel.data.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : channel.data.status === 'Beta'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {channel.data.status}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {channel.data.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {channel.data.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {channel.data.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleConnect(channel.agentName, channel.id)}
                    className={`w-full bg-gradient-to-r ${channel.color} hover:opacity-90`}
                    disabled={channel.data.status === 'Planejado' || channel.data.status === 'Planned'}
                  >
                    {channel.data.connect}
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}