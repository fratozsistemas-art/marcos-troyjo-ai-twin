import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    BookOpen, CheckCircle, Circle, Award, Clock, TrendingUp, 
    ArrowRight, ArrowLeft, Trophy, Target, Lightbulb, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function StudyMode() {
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [modules, setModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [userProgress, setUserProgress] = useState(null);
    const [currentSection, setCurrentSection] = useState(0);
    const [quizMode, setQuizMode] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [loading, setLoading] = useState(true);

    const t = {
        pt: {
            title: 'Modo de Estudo Interativo',
            subtitle: 'Aprenda de forma estruturada com quizzes e desafios',
            modules: 'Módulos Disponíveis',
            startModule: 'Iniciar Módulo',
            continueModule: 'Continuar',
            difficulty: 'Dificuldade',
            duration: 'Duração',
            minutes: 'min',
            progress: 'Progresso',
            sections: 'Seções',
            quiz: 'Quiz',
            challenges: 'Desafios',
            objectives: 'Objetivos de Aprendizado',
            startQuiz: 'Iniciar Quiz',
            nextQuestion: 'Próxima',
            previousQuestion: 'Anterior',
            submitAnswer: 'Confirmar',
            showExplanation: 'Ver Explicação',
            score: 'Pontuação',
            complete: 'Concluído',
            nextSection: 'Próxima Seção',
            prevSection: 'Seção Anterior',
            completed: 'Completado',
            notStarted: 'Não Iniciado',
            inProgress: 'Em Progresso'
        },
        en: {
            title: 'Interactive Study Mode',
            subtitle: 'Learn in a structured way with quizzes and challenges',
            modules: 'Available Modules',
            startModule: 'Start Module',
            continueModule: 'Continue',
            difficulty: 'Difficulty',
            duration: 'Duration',
            minutes: 'min',
            progress: 'Progress',
            sections: 'Sections',
            quiz: 'Quiz',
            challenges: 'Challenges',
            objectives: 'Learning Objectives',
            startQuiz: 'Start Quiz',
            nextQuestion: 'Next',
            previousQuestion: 'Previous',
            submitAnswer: 'Submit',
            showExplanation: 'Show Explanation',
            score: 'Score',
            complete: 'Complete',
            nextSection: 'Next Section',
            prevSection: 'Previous Section',
            completed: 'Completed',
            notStarted: 'Not Started',
            inProgress: 'In Progress'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadModules();
    }, []);

    const loadModules = async () => {
        setLoading(true);
        try {
            const [allModules, user] = await Promise.all([
                base44.entities.StudyModule.filter({ active: true }),
                base44.auth.me()
            ]);

            const progressData = await base44.entities.UserStudyProgress.filter({
                user_email: user.email
            });

            const modulesWithProgress = allModules.map(module => ({
                ...module,
                progress: progressData.find(p => p.module_id === module.id)
            }));

            setModules(modulesWithProgress);
        } catch (error) {
            console.error('Error loading modules:', error);
        } finally {
            setLoading(false);
        }
    };

    const startModule = async (module) => {
        try {
            const user = await base44.auth.me();
            
            let progress = module.progress;
            if (!progress) {
                progress = await base44.entities.UserStudyProgress.create({
                    user_email: user.email,
                    module_id: module.id,
                    status: 'in_progress',
                    started_date: new Date().toISOString()
                });
            }

            setSelectedModule(module);
            setUserProgress(progress);
            setCurrentSection(0);
            setQuizMode(false);
        } catch (error) {
            console.error('Error starting module:', error);
            toast.error('Erro ao iniciar módulo');
        }
    };

    const completeSection = async (sectionIndex) => {
        try {
            const completedSections = [...(userProgress.sections_completed || [])];
            if (!completedSections.includes(sectionIndex)) {
                completedSections.push(sectionIndex);
            }

            const totalSections = selectedModule.content_sections.length;
            const progressPercentage = (completedSections.length / totalSections) * 100;

            const updated = await base44.entities.UserStudyProgress.update(userProgress.id, {
                sections_completed: completedSections,
                progress_percentage: progressPercentage,
                last_accessed: new Date().toISOString()
            });

            setUserProgress(updated);
        } catch (error) {
            console.error('Error completing section:', error);
        }
    };

    const submitQuizAnswer = () => {
        if (selectedAnswer === null) return;

        const currentQ = selectedModule.quiz_questions[currentQuestion];
        const isCorrect = selectedAnswer === currentQ.correct_answer_index;

        if (isCorrect) {
            setQuizScore(quizScore + 1);
            toast.success('Resposta correta!');
        } else {
            toast.error('Resposta incorreta');
        }

        setShowExplanation(true);
    };

    const nextQuestion = () => {
        if (currentQuestion < selectedModule.quiz_questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        const finalScore = (quizScore / selectedModule.quiz_questions.length) * 100;
        
        try {
            await base44.entities.UserStudyProgress.update(userProgress.id, {
                quiz_score: finalScore,
                quiz_attempts: (userProgress.quiz_attempts || 0) + 1
            });

            toast.success(`Quiz concluído! Pontuação: ${Math.round(finalScore)}%`);
            setQuizMode(false);
        } catch (error) {
            console.error('Error finishing quiz:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <BookOpen className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
                    <p className="text-gray-600">Carregando módulos...</p>
                </div>
            </div>
        );
    }

    if (!selectedModule) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-[#002D62] mb-2">{text.title}</h1>
                        <p className="text-lg text-gray-600">{text.subtitle}</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modules.map((module, idx) => (
                            <motion.div
                                key={module.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="h-full hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between mb-2">
                                            <BookOpen className="w-8 h-8 text-blue-500" />
                                            <Badge className={
                                                module.progress?.status === 'completed' ? 'bg-green-500' :
                                                module.progress?.status === 'in_progress' ? 'bg-yellow-500' :
                                                'bg-gray-400'
                                            }>
                                                {module.progress?.status === 'completed' ? text.completed :
                                                 module.progress?.status === 'in_progress' ? text.inProgress :
                                                 text.notStarted}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl">{module.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 mb-4">{module.description}</p>
                                        
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <Badge variant="outline">{text.difficulty}: {module.difficulty_level}</Badge>
                                            <Badge variant="outline">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {module.estimated_duration_minutes} {text.minutes}
                                            </Badge>
                                        </div>

                                        {module.progress && (
                                            <div className="mb-4">
                                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                    <span>{text.progress}</span>
                                                    <span>{Math.round(module.progress.progress_percentage || 0)}%</span>
                                                </div>
                                                <Progress value={module.progress.progress_percentage || 0} />
                                            </div>
                                        )}

                                        <Button 
                                            className="w-full"
                                            onClick={() => startModule(module)}
                                        >
                                            {module.progress?.status === 'in_progress' ? text.continueModule : text.startModule}
                                            <ArrowRight className="w-4 h-4 ml-2" />
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

    // Module Content View
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-5xl mx-auto">
                <Button 
                    variant="ghost" 
                    onClick={() => setSelectedModule(null)}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar aos módulos
                </Button>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl">{selectedModule.title}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                <span className="font-bold">{Math.round(userProgress?.progress_percentage || 0)}%</span>
                            </div>
                        </div>
                        <Progress value={userProgress?.progress_percentage || 0} className="mt-2" />
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="content" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="content">{text.sections}</TabsTrigger>
                                <TabsTrigger value="quiz">{text.quiz}</TabsTrigger>
                                <TabsTrigger value="challenges">{text.challenges}</TabsTrigger>
                            </TabsList>

                            <TabsContent value="content" className="mt-6">
                                {!quizMode && selectedModule.content_sections[currentSection] && (
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentSection}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                        >
                                            <h3 className="text-xl font-bold mb-4">
                                                {selectedModule.content_sections[currentSection].title}
                                            </h3>
                                            <div className="prose max-w-none mb-6">
                                                <ReactMarkdown>
                                                    {selectedModule.content_sections[currentSection].content}
                                                </ReactMarkdown>
                                            </div>
                                            
                                            <div className="flex justify-between">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                                                    disabled={currentSection === 0}
                                                >
                                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                                    {text.prevSection}
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        completeSection(currentSection);
                                                        if (currentSection < selectedModule.content_sections.length - 1) {
                                                            setCurrentSection(currentSection + 1);
                                                        }
                                                    }}
                                                >
                                                    {currentSection === selectedModule.content_sections.length - 1 ? 
                                                        text.complete : text.nextSection}
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                )}
                            </TabsContent>

                            <TabsContent value="quiz" className="mt-6">
                                {!quizMode ? (
                                    <div className="text-center py-12">
                                        <Target className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold mb-2">Quiz de Avaliação</h3>
                                        <p className="text-gray-600 mb-6">
                                            Teste seus conhecimentos com {selectedModule.quiz_questions?.length || 0} perguntas
                                        </p>
                                        <Button onClick={() => {
                                            setQuizMode(true);
                                            setCurrentQuestion(0);
                                            setQuizScore(0);
                                        }}>
                                            <Zap className="w-4 h-4 mr-2" />
                                            {text.startQuiz}
                                        </Button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600">
                                                Pergunta {currentQuestion + 1} de {selectedModule.quiz_questions.length}
                                            </p>
                                            <Progress 
                                                value={((currentQuestion + 1) / selectedModule.quiz_questions.length) * 100} 
                                                className="mt-2"
                                            />
                                        </div>

                                        <h3 className="text-lg font-bold mb-4">
                                            {selectedModule.quiz_questions[currentQuestion].question}
                                        </h3>

                                        <div className="space-y-2 mb-6">
                                            {selectedModule.quiz_questions[currentQuestion].options.map((option, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => !showExplanation && setSelectedAnswer(idx)}
                                                    disabled={showExplanation}
                                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                                        selectedAnswer === idx ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                                    } ${showExplanation && idx === selectedModule.quiz_questions[currentQuestion].correct_answer_index ? 'border-green-500 bg-green-50' : ''}`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>

                                        {showExplanation && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-blue-50 rounded-lg p-4 mb-4"
                                            >
                                                <p className="text-sm font-medium text-blue-900 mb-1">Explicação:</p>
                                                <p className="text-sm text-blue-800">
                                                    {selectedModule.quiz_questions[currentQuestion].explanation}
                                                </p>
                                            </motion.div>
                                        )}

                                        <div className="flex justify-between">
                                            {!showExplanation ? (
                                                <Button onClick={submitQuizAnswer} disabled={selectedAnswer === null}>
                                                    {text.submitAnswer}
                                                </Button>
                                            ) : (
                                                <Button onClick={nextQuestion}>
                                                    {currentQuestion === selectedModule.quiz_questions.length - 1 ? 
                                                        'Finalizar' : text.nextQuestion}
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="challenges" className="mt-6">
                                <div className="text-center py-12">
                                    <Lightbulb className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Desafios Práticos</h3>
                                    <p className="text-gray-600">Em breve: desafios interativos para aplicar seu conhecimento</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}