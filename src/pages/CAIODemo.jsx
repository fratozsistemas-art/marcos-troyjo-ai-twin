import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Sparkles, Zap, Award, MessageSquare, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import ButtonPremium from '@/components/caio/ButtonPremium';
import CardGlow from '@/components/caio/CardGlow';
import BadgeCaio from '@/components/caio/BadgeCaio';
import HeaderCaio from '@/components/caio/HeaderCaio';
import Toast from '@/components/caio/Toast';
import InputCAIO from '@/components/caio/InputCAIO';
import CardBordered from '@/components/caio/CardBordered';

export default function CAIODemo() {
    const [darkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        if (!darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            {/* Header */}
            <HeaderCaio className="py-16 px-8">
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <Badge className="bg-white/10 border-white/20 text-white mb-4 uppercase tracking-wider text-xs">
                        Version 1.1
                    </Badge>
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-3 text-white">
                        CAIO Design System
                    </h1>
                    <p className="text-xl text-electric-cyan-100 font-light mb-6">
                        Marcos Troyjo AI Twin • Visual Identity Guide
                    </p>
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <Button
                            onClick={toggleDarkMode}
                            variant="outline"
                            size="lg"
                            className="bg-white/10 border-white/30 hover:bg-white/20 text-white"
                        >
                            {darkMode ? <Sun className="w-5 h-5 mr-2" /> : <Moon className="w-5 h-5 mr-2" />}
                            {darkMode ? 'Light Mode' : 'Dark Mode'}
                        </Button>
                        <ButtonPremium size="lg">
                            <Sparkles className="w-5 h-5 mr-2" />
                            Premium Features
                        </ButtonPremium>
                    </div>
                    <p className="text-sm text-white/60 uppercase tracking-widest">
                        Powered By <span className="text-abyss-blue-100">●</span> 
                        <span className="text-electric-cyan-400"> ●</span> 
                        <span className="text-metallic-gold"> ●</span> CAIO
                    </p>
                </div>
            </HeaderCaio>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 space-y-12">
                {/* Color Palette */}
                <section>
                    <h2 className="text-3xl font-bold mb-6 text-foreground">Paleta de Cores</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Abyss Blue</CardTitle>
                                <CardDescription>#06101F</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-5 gap-2">
                                    {[50, 100, 200, 400, 500, 600, 700, 800, 900].map((shade) => (
                                        <div
                                            key={shade}
                                            className={`h-12 rounded bg-abyss-blue-${shade} border border-gray-200`}
                                            title={`${shade}`}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Electric Cyan</CardTitle>
                                <CardDescription>#00D4FF</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-5 gap-2">
                                    {[50, 100, 200, 400, 500, 600, 700, 800, 900].map((shade) => (
                                        <div
                                            key={shade}
                                            className={`h-12 rounded bg-electric-cyan-${shade} border border-gray-200`}
                                            title={`${shade}`}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Metallic Gold</CardTitle>
                                <CardDescription>#C7A763</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-5 gap-2">
                                    {[50, 100, 200, 400, 500, 600, 700, 800, 900].map((shade) => (
                                        <div
                                            key={shade}
                                            className={`h-12 rounded bg-metallic-gold-${shade} border border-gray-200`}
                                            title={`${shade}`}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Component Examples */}
                <section>
                    <h2 className="text-3xl font-bold mb-6 text-foreground">Componentes CAIO</h2>
                    
                    <div className="space-y-8">
                        {/* Buttons */}
                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-foreground">Botões</h3>
                            <div className="flex flex-wrap gap-4">
                                <Button className="bg-abyss-blue hover:bg-abyss-blue-600">
                                    Abyss Blue Button
                                </Button>
                                <Button className="bg-electric-cyan hover:bg-electric-cyan-600 text-abyss-blue">
                                    Electric Cyan Button
                                </Button>
                                <ButtonPremium>
                                    <Award className="w-4 h-4 mr-2" />
                                    Premium Gold Button
                                </ButtonPremium>
                            </div>
                        </div>

                        {/* Badges */}
                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-foreground">Badges</h3>
                            <div className="flex flex-wrap gap-3">
                                <BadgeCaio variant="cyan">
                                    <Zap className="w-3 h-3 mr-1" />
                                    Electric Cyan
                                </BadgeCaio>
                                <BadgeCaio variant="gold">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Metallic Gold
                                </BadgeCaio>
                                <BadgeCaio variant="abyss">
                                    Abyss Blue
                                </BadgeCaio>
                                <Badge className="bg-primary text-primary-foreground">Primary</Badge>
                                <Badge className="bg-secondary text-secondary-foreground">Secondary</Badge>
                                <Badge className="bg-accent text-accent-foreground">Accent</Badge>
                            </div>
                        </div>

                        {/* Cards */}
                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-foreground">Cards</h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Card Padrão</CardTitle>
                                        <CardDescription>Usando cores do sistema</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            Este é um card padrão usando as variáveis CSS do CAIO Design System.
                                        </p>
                                    </CardContent>
                                </Card>

                                <CardGlow>
                                    <CardHeader>
                                        <CardTitle className="text-electric-cyan">Card com Glow</CardTitle>
                                        <CardDescription>Efeito Electric Cyan no hover</CardDescription>
                                    </CardHeader>
                                    <p className="text-sm text-muted-foreground mt-4">
                                        Passe o mouse para ver o efeito de brilho Electric Cyan.
                                    </p>
                                </CardGlow>

                                <CardBordered borderColor="cyan">
                                    <h3 className="font-semibold text-electric-cyan mb-2">Bordered Card</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Card com borda lateral destacada em Electric Cyan.
                                    </p>
                                </CardBordered>
                            </div>
                        </div>

                        {/* Gradients */}
                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-foreground">Gradientes</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="h-32 rounded-xl bg-gradient-caio flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">Gradient CAIO</span>
                                </div>
                                <div className="h-32 rounded-xl bg-gradient-caio-dark flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">Gradient CAIO Dark</span>
                                </div>
                            </div>
                        </div>

                        {/* Animations */}
                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-foreground">Animações</h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <Card className="animate-glow-cyan">
                                    <CardContent className="p-6 text-center">
                                        <Zap className="w-8 h-8 mx-auto mb-2 text-electric-cyan" />
                                        <p className="text-sm font-semibold">Glow Cyan</p>
                                    </CardContent>
                                </Card>

                                <Card className="animate-glow-gold">
                                    <CardContent className="p-6 text-center">
                                        <Award className="w-8 h-8 mx-auto mb-2 text-metallic-gold" />
                                        <p className="text-sm font-semibold">Glow Gold</p>
                                    </CardContent>
                                </Card>

                                <Card className="relative overflow-hidden">
                                    <CardContent className="p-6 text-center">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-electric-cyan/20 to-transparent bg-[length:200%_100%] animate-shimmer" />
                                        <Sparkles className="w-8 h-8 mx-auto mb-2 text-electric-cyan relative z-10" />
                                        <p className="text-sm font-semibold relative z-10">Shimmer</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Typography */}
                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-foreground">Tipografia - Inter Font</h3>
                            <Card>
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid grid-cols-[150px_1fr] gap-4 items-baseline border-b pb-4">
                                        <span className="text-xs font-mono text-muted-foreground">Display / 700</span>
                                        <h1 className="text-5xl font-bold text-abyss-blue dark:text-electric-cyan tracking-tight">
                                            Display Heading
                                        </h1>
                                    </div>
                                    <div className="grid grid-cols-[150px_1fr] gap-4 items-baseline border-b pb-4">
                                        <span className="text-xs font-mono text-muted-foreground">H1 / 700</span>
                                        <h1 className="text-4xl font-bold text-abyss-blue dark:text-electric-cyan tracking-tight">
                                            Heading 1
                                        </h1>
                                    </div>
                                    <div className="grid grid-cols-[150px_1fr] gap-4 items-baseline border-b pb-4">
                                        <span className="text-xs font-mono text-muted-foreground">H2 / 600</span>
                                        <h2 className="text-3xl font-semibold text-abyss-blue dark:text-electric-cyan tracking-tight">
                                            Heading 2
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-[150px_1fr] gap-4 items-baseline border-b pb-4">
                                        <span className="text-xs font-mono text-muted-foreground">H3 / 600</span>
                                        <h3 className="text-2xl font-semibold text-abyss-blue dark:text-electric-cyan">
                                            Heading 3
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-[150px_1fr] gap-4 items-baseline border-b pb-4">
                                        <span className="text-xs font-mono text-muted-foreground">Body / 400</span>
                                        <p className="text-base text-foreground font-normal">
                                            Parágrafo com texto padrão usando a tipografia Inter e cor foreground do sistema. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-[150px_1fr] gap-4 items-baseline">
                                        <span className="text-xs font-mono text-muted-foreground">Caption / 400</span>
                                        <p className="text-sm text-muted-foreground">
                                            Texto secundário usando muted-foreground para informações auxiliares e legendas.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Form Elements */}
                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-foreground">Formulários</h3>
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Input Padrão</label>
                                        <Input placeholder="Digite algo..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Input CAIO (com focus cyan)</label>
                                        <InputCAIO placeholder="Digite algo com estilo CAIO..." />
                                    </div>
                                    <div className="flex gap-3">
                                        <InputCAIO placeholder="Email" type="email" className="flex-1" />
                                        <Button className="bg-electric-cyan hover:bg-electric-cyan-600 text-abyss-blue">
                                            Subscribe
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Toasts / Alerts */}
                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-foreground">Toasts & Alerts</h3>
                            <div className="space-y-4">
                                <Toast variant="success">
                                    <strong>Success!</strong> Your changes have been saved successfully.
                                </Toast>
                                <Toast variant="error">
                                    <strong>Error!</strong> Something went wrong. Please try again.
                                </Toast>
                                <Toast variant="warning">
                                    <strong>Warning!</strong> Your session will expire in 5 minutes.
                                </Toast>
                                <Toast variant="info">
                                    <strong>Info:</strong> New features are available. Check them out!
                                </Toast>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Interactive Elements */}
                <section>
                    <h2 className="text-3xl font-bold mb-6 text-foreground">Elementos Interativos</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <CardBordered borderColor="cyan">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">Chat Message</h3>
                                    <MessageSquare className="w-5 h-5 text-electric-cyan" />
                                </div>
                                <div className="bg-electric-cyan-50 dark:bg-electric-cyan-900/20 p-4 rounded-lg border border-electric-cyan-200 dark:border-electric-cyan-800">
                                    <p className="text-sm text-electric-cyan-800 dark:text-electric-cyan-200">
                                        Esta é uma mensagem de chat estilizada com cores CAIO.
                                    </p>
                                </div>
                                <Button className="w-full bg-electric-cyan hover:bg-electric-cyan-600 text-abyss-blue">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Nova Consulta
                                </Button>
                            </div>
                        </CardBordered>

                        <CardBordered borderColor="gold">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">Status Panel</h3>
                                    <CheckCircle2 className="w-5 h-5 text-metallic-gold" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-sm">Sistema Operacional</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-electric-cyan animate-pulse" />
                                        <span className="text-sm">IA Respondendo</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-metallic-gold" />
                                        <span className="text-sm">Premium Ativo</span>
                                    </div>
                                </div>
                            </div>
                        </CardBordered>
                    </div>
                </section>

                {/* Usage Guide */}
                <section>
                    <h2 className="text-3xl font-bold mb-6 text-foreground">Guia de Implementação</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Classes Tailwind</CardTitle>
                                <CardDescription>Acesso direto às cores CAIO</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="bg-muted p-3 rounded-md">
                                    <code className="text-sm font-mono">bg-abyss-blue-500</code>
                                    <p className="text-xs text-muted-foreground mt-1">Fundo azul profundo principal</p>
                                </div>
                                <div className="bg-muted p-3 rounded-md">
                                    <code className="text-sm font-mono">text-electric-cyan</code>
                                    <p className="text-xs text-muted-foreground mt-1">Texto ciano elétrico de destaque</p>
                                </div>
                                <div className="bg-muted p-3 rounded-md">
                                    <code className="text-sm font-mono">border-metallic-gold</code>
                                    <p className="text-xs text-muted-foreground mt-1">Borda dourada premium</p>
                                </div>
                                <div className="bg-muted p-3 rounded-md">
                                    <code className="text-sm font-mono">bg-gradient-caio</code>
                                    <p className="text-xs text-muted-foreground mt-1">Gradiente completo das 3 cores</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Componentes CAIO</CardTitle>
                                <CardDescription>Componentes pré-estilizados</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="bg-muted p-3 rounded-md">
                                    <code className="text-sm font-mono">&lt;ButtonPremium&gt;</code>
                                    <p className="text-xs text-muted-foreground mt-1">Botão dourado premium com glow</p>
                                </div>
                                <div className="bg-muted p-3 rounded-md">
                                    <code className="text-sm font-mono">&lt;CardGlow&gt;</code>
                                    <p className="text-xs text-muted-foreground mt-1">Card com efeito hover cyan</p>
                                </div>
                                <div className="bg-muted p-3 rounded-md">
                                    <code className="text-sm font-mono">&lt;BadgeCaio variant="cyan"&gt;</code>
                                    <p className="text-xs text-muted-foreground mt-1">Badge com 3 variantes de cor</p>
                                </div>
                                <div className="bg-muted p-3 rounded-md">
                                    <code className="text-sm font-mono">&lt;HeaderCaio&gt;</code>
                                    <p className="text-xs text-muted-foreground mt-1">Header com gradiente + shimmer</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>
        </div>
    );
}