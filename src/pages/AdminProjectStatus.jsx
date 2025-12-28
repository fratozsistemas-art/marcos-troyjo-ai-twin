import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  CheckCircle2,
  Circle,
  Clock,
  Target,
  Layers,
  Zap,
  Shield,
  Brain,
  TrendingUp,
  Users,
  Globe2,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  Database,
  Lock,
  Sparkles,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminProjectStatus() {
  const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
  const [viewMode, setViewMode] = useState('current');

  const content = {
    pt: {
      title: 'Status do Projeto Twin',
      subtitle: 'Visão geral do desenvolvimento e roadmap',
      back: 'Voltar',
      viewMode: {
        current: 'Status Atual',
        baseline: 'Linha Base',
        updated: 'Atualizado em',
        current_date: '28 de dezembro, 2025'
      },
      tabs: {
        implemented: 'Implementado',
        inProgress: 'Em Progresso',
        planned: 'Planejado',
        architecture: 'Arquitetura'
      },
      progress: {
        frontend: 'Interface & UX',
        backend: 'Backend & IA',
        integrations: 'Integrações',
        governance: 'Governança'
      }
    },
    en: {
      title: 'Twin Project Status',
      subtitle: 'Development overview and roadmap',
      back: 'Back',
      viewMode: {
        current: 'Current Status',
        baseline: 'Baseline',
        updated: 'Updated on',
        current_date: 'December 28, 2025'
      },
      tabs: {
        implemented: 'Implemented',
        inProgress: 'In Progress',
        planned: 'Planned',
        architecture: 'Architecture'
      },
      progress: {
        frontend: 'Interface & UX',
        backend: 'Backend & AI',
        integrations: 'Integrations',
        governance: 'Governance'
      }
    }
  };

  const t = content[lang];

  const currentImplemented = [
    {
      category: lang === 'pt' ? '🎨 Interface & Experiência' : '🎨 Interface & Experience',
      items: [
        { icon: Users, name: lang === 'pt' ? 'Sistema de Personas Adaptativo' : 'Adaptive Persona System', status: 'complete' },
        { icon: MessageSquare, name: lang === 'pt' ? 'Interface de Consulta Estratégica' : 'Strategic Consultation Interface', status: 'complete' },
        { icon: Globe2, name: lang === 'pt' ? 'Multilíngue (8 idiomas)' : 'Multilingual (8 languages)', status: 'complete' },
        { icon: BarChart3, name: 'Dashboard Executivo', status: 'complete' },
        { icon: Sparkles, name: lang === 'pt' ? 'Neologismos & Timeline' : 'Neologisms & Timeline', status: 'complete' }
      ]
    },
    {
      category: lang === 'pt' ? '🤖 Motor Adaptativo' : '🤖 Adaptive Engine',
      items: [
        { icon: Brain, name: 'PersonaMemory', status: 'complete', badge: 'NEW' },
        { icon: Sparkles, name: lang === 'pt' ? 'Ajuste Dinâmico de Profundidade' : 'Dynamic Depth Adjustment', status: 'complete', badge: 'NEW' },
        { icon: Target, name: lang === 'pt' ? 'Sugestões Proativas' : 'Proactive Suggestions', status: 'complete', badge: 'NEW' }
      ]
    },
    {
      category: lang === 'pt' ? '📊 Governança & Qualidade' : '📊 Governance & Quality',
      items: [
        { icon: Shield, name: lang === 'pt' ? 'Protocolo AEGIS' : 'AEGIS Protocol', status: 'complete' },
        { icon: FileText, name: 'Audit Trail', status: 'complete' },
        { icon: Lock, name: 'Governance Panel', status: 'complete' }
      ]
    },
    {
      category: lang === 'pt' ? '📱 Canais Multi-Plataforma' : '📱 Multi-Platform Channels',
      items: [
        { icon: MessageSquare, name: 'WhatsApp Agent', status: 'complete', badge: 'NEW' },
        { icon: Users, name: 'Microsoft Teams Bot', status: 'complete', badge: 'BETA' }
      ]
    }
  ];

  const inProgress = [
    {
      category: lang === 'pt' ? '🤖 Motor de IA Real' : '🤖 Real AI Engine',
      items: [
        { icon: Brain, name: lang === 'pt' ? 'Integração LLM Avançada' : 'Advanced LLM Integration', status: 'progress', progress: 65 },
        { icon: Sparkles, name: 'RAG Multimodal', status: 'progress', progress: 55 },
        { icon: Zap, name: lang === 'pt' ? 'Motor de Persona - Backend' : 'Persona Engine - Backend', status: 'progress', progress: 70 }
      ]
    },
    {
      category: lang === 'pt' ? '⚙️ Backend Functions' : '⚙️ Backend Functions',
      items: [
        { icon: Database, name: lang === 'pt' ? 'Processamento Avançado' : 'Advanced Processing', status: 'progress', progress: 50 },
        { icon: FileText, name: lang === 'pt' ? 'Análise RAG Real' : 'Real RAG Analysis', status: 'progress', progress: 45 }
      ]
    }
  ];

  const progressData = {
    frontend: 85,
    backend: 60,
    integrations: 70,
    governance: 75
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">{t.subtitle}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            {t.viewMode.updated}: {t.viewMode.current_date}
          </p>
        </motion.div>

        {/* Overall Progress */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
              {lang === 'pt' ? 'Progresso Geral' : 'Overall Progress'}
            </h3>
            <div className="space-y-4">
              {Object.entries(t.progress).map(([key, label]) => (
                <div key={key}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                    <span className="text-sm font-semibold text-blue-600">{progressData[key]}%</span>
                  </div>
                  <Progress value={progressData[key]} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="implemented" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="implemented">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {t.tabs.implemented}
            </TabsTrigger>
            <TabsTrigger value="inProgress">
              <Clock className="w-4 h-4 mr-2" />
              {t.tabs.inProgress}
            </TabsTrigger>
            <TabsTrigger value="architecture">
              <Layers className="w-4 h-4 mr-2" />
              {t.tabs.architecture}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="implemented">
            <div className="space-y-6">
              {currentImplemented.map((category, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{category.category}</h3>
                      <div className="space-y-3">
                        {category.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                              <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                            </div>
                            {item.badge && (
                              <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-600 text-white">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inProgress">
            <div className="space-y-6">
              {inProgress.map((category, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{category.category}</h3>
                      <div className="space-y-4">
                        {category.items.map((item, itemIdx) => (
                          <div key={itemIdx}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-orange-600" />
                                <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                              </div>
                              <span className="text-sm font-semibold text-orange-600">{item.progress}%</span>
                            </div>
                            <Progress value={item.progress} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="architecture">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  {lang === 'pt' ? 'Arquitetura dos 4 Pilares' : '4-Pillar Architecture'}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
                    <Users className="w-8 h-8 text-blue-600 mb-3" />
                    <h4 className="font-bold text-lg mb-2">Persona Autêntica</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {lang === 'pt' ? 'Motor multimodal de raciocínio com 4 estilos analíticos' : 'Multimodal reasoning engine with 4 analytical styles'}
                    </p>
                  </div>
                  <div className="p-6 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
                    <Database className="w-8 h-8 text-green-600 mb-3" />
                    <h4 className="font-bold text-lg mb-2">{lang === 'pt' ? 'Base Viva' : 'Living Knowledge'}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {lang === 'pt' ? 'Corpus fundacional + dados externos em tempo real' : 'Foundational corpus + real-time external data'}
                    </p>
                  </div>
                  <div className="p-6 rounded-xl bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800">
                    <Brain className="w-8 h-8 text-purple-600 mb-3" />
                    <h4 className="font-bold text-lg mb-2">{lang === 'pt' ? 'Motor Adaptativo' : 'Adaptive Engine'}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {lang === 'pt' ? 'Aprende com cada interação e refina continuamente' : 'Learns from each interaction and continuously refines'}
                    </p>
                  </div>
                  <div className="p-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800">
                    <Shield className="w-8 h-8 text-amber-600 mb-3" />
                    <h4 className="font-bold text-lg mb-2">{lang === 'pt' ? 'Protocolos Elite' : 'Elite Protocols'}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      HUA 95%+ & AEGIS IP Protection
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}