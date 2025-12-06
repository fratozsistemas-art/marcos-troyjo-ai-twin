import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, FolderOpen, Plus, Search, MoreVertical, 
    Share2, Copy, Trash2, Edit2, X, Check, ChevronRight,
    ChevronDown, Folder
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ConversationSidebar({ 
    lang = 'pt', 
    currentConversationId, 
    onSelectConversation,
    onNewConversation 
}) {
    const [conversations, setConversations] = useState([]);
    const [projects, setProjects] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [expandedProjects, setExpandedProjects] = useState(new Set(['default']));
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const t = {
        pt: {
            history: "Histórico",
            search: "Buscar conversas...",
            newChat: "Nova Conversa",
            project: "Projeto",
            noProject: "Sem Projeto",
            share: "Compartilhar",
            duplicate: "Duplicar",
            rename: "Renomear",
            delete: "Deletar",
            deleteSelected: "Deletar Selecionados",
            selectAll: "Selecionar Todos",
            noConversations: "Nenhuma conversa",
            addToProject: "Adicionar ao Projeto",
            newProject: "Novo Projeto",
        },
        en: {
            history: "History",
            search: "Search conversations...",
            newChat: "New Chat",
            project: "Project",
            noProject: "No Project",
            share: "Share",
            duplicate: "Duplicate",
            rename: "Rename",
            delete: "Delete",
            deleteSelected: "Delete Selected",
            selectAll: "Select All",
            noConversations: "No conversations",
            addToProject: "Add to Project",
            newProject: "New Project",
        }
    }[lang];

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        setIsLoading(true);
        try {
            const convs = await base44.agents.listConversations({
                agent_name: "troyjo_twin"
            });
            
            const organized = organizeByProject(convs || []);
            setConversations(convs || []);
            setProjects(organized);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const organizeByProject = (convs) => {
        const grouped = {};
        convs.forEach(conv => {
            const projectName = conv.metadata?.project || 'default';
            if (!grouped[projectName]) {
                grouped[projectName] = [];
            }
            grouped[projectName].push(conv);
        });
        return grouped;
    };

    const handleShare = async (conversation) => {
        const shareUrl = `${window.location.origin}${window.location.pathname}?conversationId=${conversation.id}`;
        await navigator.clipboard.writeText(shareUrl);
        alert(lang === 'pt' ? 'Link copiado!' : 'Link copied!');
    };

    const handleDuplicate = async (conversation) => {
        try {
            const newConv = await base44.agents.createConversation({
                agent_name: "troyjo_twin",
                metadata: {
                    ...conversation.metadata,
                    name: `${conversation.metadata?.name || 'Conversa'} (cópia)`,
                }
            });

            if (conversation.messages && conversation.messages.length > 0) {
                for (const msg of conversation.messages) {
                    if (msg.role === 'user' || msg.role === 'assistant') {
                        await base44.agents.addMessage(newConv, {
                            role: msg.role,
                            content: msg.content
                        });
                    }
                }
            }

            loadConversations();
        } catch (error) {
            console.error('Error duplicating conversation:', error);
        }
    };

    const handleDelete = async (conversationId) => {
        if (!confirm(lang === 'pt' 
            ? 'Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.' 
            : 'Are you sure you want to delete this conversation? This action cannot be undone.')) {
            return;
        }
        
        try {
            await base44.agents.deleteConversation(conversationId);
            
            if (currentConversationId === conversationId && onNewConversation) {
                onNewConversation();
            }
            
            loadConversations();
        } catch (error) {
            console.error('Error deleting conversation:', error);
            alert(lang === 'pt' ? 'Erro ao excluir conversa. Tente novamente.' : 'Error deleting conversation. Please try again.');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedItems.size === 0) return;
        if (!confirm(lang === 'pt' 
            ? `Deletar ${selectedItems.size} conversas?` 
            : `Delete ${selectedItems.size} conversations?`)) return;

        try {
            for (const id of selectedItems) {
                await base44.agents.deleteConversation(id);
            }
            setSelectedItems(new Set());
            loadConversations();
        } catch (error) {
            console.error('Error bulk deleting:', error);
        }
    };

    const handleRename = async (conversationId) => {
        if (!editingName.trim()) return;

        try {
            await base44.agents.updateConversation(conversationId, {
                metadata: {
                    name: editingName.trim()
                }
            });
            setEditingId(null);
            setEditingName('');
            loadConversations();
        } catch (error) {
            console.error('Error renaming:', error);
        }
    };

    const toggleProject = (projectName) => {
        const newExpanded = new Set(expandedProjects);
        if (newExpanded.has(projectName)) {
            newExpanded.delete(projectName);
        } else {
            newExpanded.add(projectName);
        }
        setExpandedProjects(newExpanded);
    };

    const toggleSelect = (id) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    const filteredProjects = Object.keys(projects).reduce((acc, projectName) => {
        const filtered = projects[projectName].filter(conv => 
            (conv.metadata?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filtered.length > 0) {
            acc[projectName] = filtered;
        }
        return acc;
    }, {});

    return (
        <div className="h-full flex flex-col bg-white border-r border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-[#002D62] flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Hub
                    </h2>
                    <Button
                        data-ai-id="btn_new_conversation_sidebar"
                        data-ai-role="button"
                        onClick={onNewConversation}
                        size="sm"
                        className="bg-[#00654A] hover:bg-[#004d38]"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        data-ai-id="input_search_conversations"
                        data-ai-role="textbox"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.search}
                        className="pl-9 text-sm"
                    />
                </div>

                {selectedItems.size > 0 && (
                    <div className="mt-3 flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                        <span className="text-xs text-blue-900 font-medium">
                            {selectedItems.size} {lang === 'pt' ? 'selecionados' : 'selected'}
                        </span>
                        <Button
                            onClick={handleBulkDelete}
                            size="sm"
                            variant="destructive"
                            className="h-7"
                        >
                            <Trash2 className="w-3 h-3 mr-1" />
                            {t.delete}
                        </Button>
                    </div>
                )}
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                        {lang === 'pt' ? 'Carregando...' : 'Loading...'}
                    </div>
                ) : Object.keys(filteredProjects).length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                        {t.noConversations}
                    </div>
                ) : (
                    <div className="p-2">
                        {Object.entries(filteredProjects).map(([projectName, convs]) => (
                            <div key={projectName} className="mb-2">
                                {/* Project Header */}
                                <button
                                    onClick={() => toggleProject(projectName)}
                                    className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    {expandedProjects.has(projectName) ? (
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-500" />
                                    )}
                                    <Folder className="w-4 h-4 text-[#B8860B]" />
                                    <span className="text-sm font-semibold text-gray-700 flex-1 text-left">
                                        {projectName === 'default' ? t.noProject : projectName}
                                    </span>
                                    <Badge variant="secondary" className="text-xs">
                                        {convs.length}
                                    </Badge>
                                </button>

                                {/* Conversations in Project */}
                                <AnimatePresence>
                                    {expandedProjects.has(projectName) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="ml-4 space-y-1 mt-1"
                                        >
                                            {convs.map((conv) => (
                                                <div
                                                    key={conv.id}
                                                    className={`group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                                                        currentConversationId === conv.id ? 'bg-blue-50 border border-blue-200' : ''
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.has(conv.id)}
                                                        onChange={() => toggleSelect(conv.id)}
                                                        className="w-4 h-4 rounded border-gray-300"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />

                                                    {editingId === conv.id ? (
                                                        <div className="flex-1 flex items-center gap-1">
                                                            <Input
                                                                value={editingName}
                                                                onChange={(e) => setEditingName(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleRename(conv.id);
                                                                    if (e.key === 'Escape') setEditingId(null);
                                                                }}
                                                                className="h-7 text-xs"
                                                                autoFocus
                                                            />
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleRename(conv.id)}
                                                                className="h-7 w-7 p-0"
                                                            >
                                                                <Check className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => setEditingId(null)}
                                                                className="h-7 w-7 p-0"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => onSelectConversation(conv.id)}
                                                                className="flex-1 text-left min-w-0"
                                                            >
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {conv.metadata?.name || `Conversa ${new Date(conv.created_date).toLocaleDateString()}`}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {new Date(conv.created_date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                                                                </p>
                                                            </button>

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                                                                    >
                                                                        <MoreVertical className="w-4 h-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleShare(conv)}>
                                                                        <Share2 className="w-4 h-4 mr-2" />
                                                                        {t.share}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleDuplicate(conv)}>
                                                                        <Copy className="w-4 h-4 mr-2" />
                                                                        {t.duplicate}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => {
                                                                        setEditingId(conv.id);
                                                                        setEditingName(conv.metadata?.name || '');
                                                                    }}>
                                                                        <Edit2 className="w-4 h-4 mr-2" />
                                                                        {t.rename}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDelete(conv.id);
                                                                        }}
                                                                        className="text-red-600"
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                                        {t.delete}
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}