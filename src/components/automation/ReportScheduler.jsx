import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Trash2, Play, Pause, FileText, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Automação de Relatórios',
        description: 'Agende geração automática de relatórios executivos',
        createSchedule: 'Criar Agendamento',
        name: 'Nome do Agendamento',
        scenario: 'Cenário',
        template: 'Template',
        frequency: 'Frequência',
        time: 'Horário',
        dayOfWeek: 'Dia da Semana',
        dayOfMonth: 'Dia do Mês',
        notifications: 'Notificações',
        notificationEmails: 'Emails para Notificação',
        enabled: 'Ativo',
        save: 'Salvar',
        cancel: 'Cancelar',
        delete: 'Excluir',
        schedules: 'Agendamentos',
        noSchedules: 'Nenhum agendamento criado',
        lastRun: 'Última Execução',
        nextRun: 'Próxima Execução',
        status: 'Status',
        runCount: 'Execuções',
        frequencies: {
            daily: 'Diário',
            weekly: 'Semanal',
            monthly: 'Mensal'
        },
        templates: {
            executive_summary: 'Sumário Executivo',
            complete: 'Análise Completa',
            deep_dive: 'Deep Dive',
            comparative: 'Comparativa'
        },
        days: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    },
    en: {
        title: 'Report Automation',
        description: 'Schedule automatic generation of executive reports',
        createSchedule: 'Create Schedule',
        name: 'Schedule Name',
        scenario: 'Scenario',
        template: 'Template',
        frequency: 'Frequency',
        time: 'Time',
        dayOfWeek: 'Day of Week',
        dayOfMonth: 'Day of Month',
        notifications: 'Notifications',
        notificationEmails: 'Notification Emails',
        enabled: 'Enabled',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        schedules: 'Schedules',
        noSchedules: 'No schedules created',
        lastRun: 'Last Run',
        nextRun: 'Next Run',
        status: 'Status',
        runCount: 'Runs',
        frequencies: {
            daily: 'Daily',
            weekly: 'Weekly',
            monthly: 'Monthly'
        },
        templates: {
            executive_summary: 'Executive Summary',
            complete: 'Complete Analysis',
            deep_dive: 'Deep Dive',
            comparative: 'Comparative'
        },
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }
};

export default function ReportScheduler({ lang = 'pt' }) {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        scenario: '',
        template: 'executive_summary',
        schedule_type: 'weekly',
        time: '09:00',
        day_of_week: 1,
        day_of_month: 1,
        notification_emails: [],
        enabled: true,
        format: 'pdf'
    });
    const t = translations[lang];

    useEffect(() => {
        loadSchedules();
    }, []);

    const loadSchedules = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            const data = await base44.entities.ScheduledReport.filter({
                created_by: user.email
            });
            setSchedules(data);
        } catch (error) {
            console.error('Error loading schedules:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar agendamentos' : 'Error loading schedules');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.scenario) {
            toast.error(lang === 'pt' ? 'Preencha todos os campos' : 'Fill all fields');
            return;
        }

        try {
            const nextRun = calculateNextRun(formData);
            
            if (editingSchedule) {
                await base44.entities.ScheduledReport.update(editingSchedule.id, {
                    ...formData,
                    next_run: nextRun.toISOString()
                });
                toast.success(lang === 'pt' ? 'Agendamento atualizado!' : 'Schedule updated!');
            } else {
                await base44.entities.ScheduledReport.create({
                    ...formData,
                    next_run: nextRun.toISOString(),
                    run_count: 0
                });
                toast.success(lang === 'pt' ? 'Agendamento criado!' : 'Schedule created!');
            }
            
            setDialogOpen(false);
            setEditingSchedule(null);
            resetForm();
            loadSchedules();
        } catch (error) {
            console.error('Error saving schedule:', error);
            toast.error(lang === 'pt' ? 'Erro ao salvar' : 'Error saving');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(lang === 'pt' ? 'Excluir este agendamento?' : 'Delete this schedule?')) return;
        
        try {
            await base44.entities.ScheduledReport.delete(id);
            toast.success(lang === 'pt' ? 'Agendamento excluído!' : 'Schedule deleted!');
            loadSchedules();
        } catch (error) {
            console.error('Error deleting schedule:', error);
            toast.error(lang === 'pt' ? 'Erro ao excluir' : 'Error deleting');
        }
    };

    const toggleEnabled = async (schedule) => {
        try {
            await base44.entities.ScheduledReport.update(schedule.id, {
                enabled: !schedule.enabled
            });
            loadSchedules();
        } catch (error) {
            console.error('Error toggling schedule:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            scenario: '',
            template: 'executive_summary',
            schedule_type: 'weekly',
            time: '09:00',
            day_of_week: 1,
            day_of_month: 1,
            notification_emails: [],
            enabled: true,
            format: 'pdf'
        });
    };

    const calculateNextRun = (schedule) => {
        const now = new Date();
        let next = new Date(now);

        if (schedule.schedule_type === 'daily') {
            next.setDate(next.getDate() + 1);
        } else if (schedule.schedule_type === 'weekly') {
            const targetDay = schedule.day_of_week || 1;
            const currentDay = next.getDay();
            const daysUntilNext = (targetDay - currentDay + 7) % 7 || 7;
            next.setDate(next.getDate() + daysUntilNext);
        } else if (schedule.schedule_type === 'monthly') {
            next.setMonth(next.getMonth() + 1);
            next.setDate(schedule.day_of_month || 1);
        }

        if (schedule.time) {
            const [hours, minutes] = schedule.time.split(':');
            next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }

        return next;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <Calendar className="w-5 h-5" />
                            {t.title}
                        </CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => { resetForm(); setEditingSchedule(null); }}>
                                <Plus className="w-4 h-4 mr-2" />
                                {t.createSchedule}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingSchedule ? t.edit : t.createSchedule}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>{t.name}</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder={lang === 'pt' ? 'Relatório Semanal de Riscos' : 'Weekly Risk Report'}
                                    />
                                </div>
                                
                                <div>
                                    <Label>{t.scenario}</Label>
                                    <Textarea
                                        value={formData.scenario}
                                        onChange={(e) => setFormData({...formData, scenario: e.target.value})}
                                        rows={3}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>{t.template}</Label>
                                        <Select value={formData.template} onValueChange={(v) => setFormData({...formData, template: v})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(t.templates).map((key) => (
                                                    <SelectItem key={key} value={key}>{t.templates[key]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>{t.frequency}</Label>
                                        <Select value={formData.schedule_type} onValueChange={(v) => setFormData({...formData, schedule_type: v})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(t.frequencies).map((key) => (
                                                    <SelectItem key={key} value={key}>{t.frequencies[key]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>{t.time}</Label>
                                        <Input
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => setFormData({...formData, time: e.target.value})}
                                        />
                                    </div>

                                    {formData.schedule_type === 'weekly' && (
                                        <div>
                                            <Label>{t.dayOfWeek}</Label>
                                            <Select value={String(formData.day_of_week)} onValueChange={(v) => setFormData({...formData, day_of_week: parseInt(v)})}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {t.days.map((day, idx) => (
                                                        <SelectItem key={idx} value={String(idx)}>{day}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {formData.schedule_type === 'monthly' && (
                                        <div>
                                            <Label>{t.dayOfMonth}</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="31"
                                                value={formData.day_of_month}
                                                onChange={(e) => setFormData({...formData, day_of_month: parseInt(e.target.value)})}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label>{t.notificationEmails}</Label>
                                    <Input
                                        placeholder="email1@example.com, email2@example.com"
                                        value={formData.notification_emails.join(', ')}
                                        onChange={(e) => setFormData({
                                            ...formData, 
                                            notification_emails: e.target.value.split(',').map(e => e.trim()).filter(e => e)
                                        })}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={formData.enabled}
                                        onCheckedChange={(checked) => setFormData({...formData, enabled: checked})}
                                    />
                                    <Label>{t.enabled}</Label>
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={handleSave} className="flex-1">
                                        {t.save}
                                    </Button>
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                        {t.cancel}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                    </div>
                ) : schedules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>{t.noSchedules}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {schedules.map((schedule) => (
                            <div
                                key={schedule.id}
                                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-[#002D62]">{schedule.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{schedule.scenario}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleEnabled(schedule)}
                                        >
                                            {schedule.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(schedule.id)}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                    <Badge variant="outline">
                                        {t.templates[schedule.template]}
                                    </Badge>
                                    <Badge variant="outline">
                                        {t.frequencies[schedule.schedule_type]}
                                    </Badge>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {schedule.time}
                                    </span>
                                    {schedule.notification_emails?.length > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {schedule.notification_emails.length}
                                        </span>
                                    )}
                                    {schedule.last_status && (
                                        <Badge variant={schedule.last_status === 'success' ? 'default' : 'destructive'}>
                                            {schedule.last_status}
                                        </Badge>
                                    )}
                                    <span>{t.runCount}: {schedule.run_count || 0}</span>
                                </div>
                                {schedule.next_run && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        {t.nextRun}: {new Date(schedule.next_run).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}