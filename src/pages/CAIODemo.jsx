import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Sparkles, Zap, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ButtonPremium from '@/components/caio/ButtonPremium';
import CardGlow from '@/components/caio/CardGlow';
import BadgeCaio from '@/components/caio/BadgeCaio';
import HeaderCaio from '@/components/caio/HeaderCaio';

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
            <HeaderCaio className="p-8">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">CAIO Design System</h1>
                            <p className="text-white/80">Abyss Blue • Electric Cyan • Metallic Gold</p>
                        </div>
                        <Button
                            onClick={toggleDarkMode}
                            variant="outline"
                            size="lg"
                            className="bg-white/10 border-white/30 hover:bg-white/20 text-white"
                        >
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </Button>
                    </div>
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
                            <div className="grid md:grid-cols-2 gap-6">
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
                            <h3 className="text-xl font-semibold mb-4 text-foreground">Tipografia</h3>
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <h1 className="text-4xl font-bold text-abyss-blue dark:text-electric-cyan">
                                        Heading 1
                                    </h1>
                                    <h2 className="text-3xl font-bold text-abyss-blue dark:text-electric-cyan">
                                        Heading 2
                                    </h2>
                                    <h3 className="text-2xl font-semibold text-abyss-blue dark:text-electric-cyan">
                                        Heading 3
                                    </h3>
                                    <p className="text-base text-foreground">
                                        Parágrafo com texto padrão usando a cor foreground do sistema.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Texto secundário usando muted-foreground.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Usage Guide */}
                <section>
                    <h2 className="text-3xl font-bold mb-6 text-foreground">Guia de Uso</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Como Usar as Cores CAIO</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Classes Tailwind:</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                    <li><code className="bg-muted px-2 py-0.5 rounded">bg-abyss-blue</code> - Fundo azul profundo</li>
                                    <li><code className="bg-muted px-2 py-0.5 rounded">text-electric-cyan</code> - Texto ciano elétrico</li>
                                    <li><code className="bg-muted px-2 py-0.5 rounded">border-metallic-gold</code> - Borda dourada metálica</li>
                                    <li><code className="bg-muted px-2 py-0.5 rounded">bg-gradient-caio</code> - Gradiente CAIO completo</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Variáveis de Tons:</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                    <li>Cada cor tem tons de 50 (mais claro) até 900 (mais escuro)</li>
                                    <li>Exemplo: <code className="bg-muted px-2 py-0.5 rounded">bg-electric-cyan-500</code></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Animações:</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                    <li><code className="bg-muted px-2 py-0.5 rounded">animate-glow-cyan</code> - Brilho ciano pulsante</li>
                                    <li><code className="bg-muted px-2 py-0.5 rounded">animate-glow-gold</code> - Brilho dourado pulsante</li>
                                    <li><code className="bg-muted px-2 py-0.5 rounded">animate-shimmer</code> - Efeito de brilho deslizante</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </main>
        </div>
    );
}