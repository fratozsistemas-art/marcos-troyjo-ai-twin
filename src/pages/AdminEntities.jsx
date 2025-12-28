import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
  Database, Search, Plus, Pencil, Trash2, ArrowLeft, 
  FileText, Users, BookOpen, Award, Calendar, Globe,
  TrendingUp, Shield, AlertCircle, Lightbulb, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminEntities() {
  const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const content = {
    pt: {
      title: 'Gerenciamento de Entidades',
      subtitle: 'Acesso completo a todas as entidades de dados do sistema',
      back: 'Voltar',
      selectEntity: 'Selecione uma entidade',
      search: 'Buscar...',
      noRecords: 'Nenhum registro encontrado',
      loading: 'Carregando...',
      records: 'registros',
      categories: {
        content: 'Conteúdo',
        knowledge: 'Conhecimento',
        governance: 'Governança',
        analytics: 'Analytics',
        subscription: 'Assinatura',
        security: 'Segurança',
        collaboration: 'Colaboração',
        ml: 'Machine Learning'
      }
    },
    en: {
      title: 'Entity Management',
      subtitle: 'Complete access to all system data entities',
      back: 'Back',
      selectEntity: 'Select an entity',
      search: 'Search...',
      noRecords: 'No records found',
      loading: 'Loading...',
      records: 'records',
      categories: {
        content: 'Content',
        knowledge: 'Knowledge',
        governance: 'Governance',
        analytics: 'Analytics',
        subscription: 'Subscription',
        security: 'Security',
        collaboration: 'Collaboration',
        ml: 'Machine Learning'
      }
    }
  };

  const t = content[lang];

  const entityGroups = {
    [t.categories.content]: [
      { name: 'Article', icon: FileText, color: 'blue' },
      { name: 'Publication', icon: BookOpen, color: 'blue' },
      { name: 'Book', icon: BookOpen, color: 'blue' },
      { name: 'EditorialCalendarItem', icon: Calendar, color: 'blue' }
    ],
    [t.categories.knowledge]: [
      { name: 'Document', icon: FileText, color: 'green' },
      { name: 'DocumentFolder', icon: Database, color: 'green' },
      { name: 'DocumentChunk', icon: Database, color: 'green' },
      { name: 'Vocabulary', icon: BookOpen, color: 'green' },
      { name: 'KnowledgeEntry', icon: Lightbulb, color: 'green' },
      { name: 'InterviewTranscript', icon: FileText, color: 'green' }
    ],
    [t.categories.governance]: [
      { name: 'StrategicFact', icon: Shield, color: 'purple' },
      { name: 'GeopoliticalSourceOfTruth', icon: Shield, color: 'purple' },
      { name: 'CorporateFact', icon: Database, color: 'purple' },
      { name: 'GeopoliticalRisk', icon: AlertCircle, color: 'red' }
    ],
    [t.categories.analytics]: [
      { name: 'UserInteraction', icon: TrendingUp, color: 'orange' },
      { name: 'AIResponseFeedback', icon: TrendingUp, color: 'orange' },
      { name: 'AgentPerformanceDashboard', icon: TrendingUp, color: 'orange' },
      { name: 'UserActivity', icon: TrendingUp, color: 'orange' }
    ],
    [t.categories.subscription]: [
      { name: 'Organization', icon: Users, color: 'indigo' },
      { name: 'Subscription', icon: Settings, color: 'indigo' },
      { name: 'SubscriptionRequest', icon: Settings, color: 'indigo' }
    ],
    [t.categories.security]: [
      { name: 'AegisAuditLog', icon: Shield, color: 'red' },
      { name: 'AccessLog', icon: Shield, color: 'red' },
      { name: 'ContentWatermark', icon: Shield, color: 'red' }
    ],
    [t.categories.collaboration]: [
      { name: 'SharedContent', icon: Users, color: 'cyan' },
      { name: 'Comment', icon: FileText, color: 'cyan' },
      { name: 'Version', icon: Database, color: 'cyan' }
    ],
    [t.categories.ml]: [
      { name: 'MLPipeline', icon: Settings, color: 'pink' },
      { name: 'MLAuditLog', icon: Settings, color: 'pink' },
      { name: 'RetrainingJob', icon: Settings, color: 'pink' }
    ]
  };

  const allEntities = Object.values(entityGroups).flat();

  useEffect(() => {
    if (selectedEntity) {
      loadRecords();
    }
  }, [selectedEntity]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await base44.entities[selectedEntity].list('-created_date', 100);
      setRecords(data || []);
    } catch (error) {
      console.error('Error loading records:', error);
      toast.error(lang === 'pt' ? 'Erro ao carregar dados' : 'Error loading data');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(lang === 'pt' ? 'Confirma exclusão?' : 'Confirm deletion?')) return;
    
    try {
      await base44.entities[selectedEntity].delete(id);
      toast.success(lang === 'pt' ? 'Registro excluído!' : 'Record deleted!');
      loadRecords();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredRecords = records.filter(record => {
    const searchLower = searchQuery.toLowerCase();
    return JSON.stringify(record).toLowerCase().includes(searchLower);
  });

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-600 to-cyan-500',
      green: 'from-green-600 to-emerald-500',
      purple: 'from-purple-600 to-pink-500',
      red: 'from-red-600 to-rose-500',
      orange: 'from-orange-600 to-amber-500',
      indigo: 'from-indigo-600 to-blue-500',
      cyan: 'from-cyan-600 to-teal-500',
      pink: 'from-pink-600 to-rose-500'
    };
    return colors[color] || colors.blue;
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
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <Database className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">{t.subtitle}</p>
        </motion.div>

        {/* Entity Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Object.entries(entityGroups).map(([category, entities]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {entities.map(entity => (
                  <button
                    key={entity.name}
                    onClick={() => setSelectedEntity(entity.name)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedEntity === entity.name
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <entity.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{entity.name}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Records View */}
        {selectedEntity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      {selectedEntity}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {filteredRecords.length} {t.records}
                    </p>
                  </div>
                  <Input
                    placeholder={t.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">{t.loading}</p>
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{t.noRecords}</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {filteredRecords.map((record) => (
                      <div
                        key={record.id}
                        className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                ID: {record.id.substring(0, 8)}...
                              </Badge>
                              {record.created_date && (
                                <span className="text-xs text-gray-500">
                                  {new Date(record.created_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {Object.entries(record).map(([key, value]) => {
                                if (key === 'id' || key === 'created_date' || key === 'updated_date') return null;
                                const displayValue = typeof value === 'object' 
                                  ? JSON.stringify(value).substring(0, 50) + '...'
                                  : String(value).substring(0, 50);
                                
                                return (
                                  <div key={key} className="text-xs">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">{key}:</span>{' '}
                                    <span className="text-gray-600 dark:text-gray-400">{displayValue}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!selectedEntity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Database className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-500">{t.selectEntity}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}