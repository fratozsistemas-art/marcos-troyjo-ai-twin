import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, Info, AlertTriangle, Lightbulb, TrendingUp, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const iconMap = {
    info: <Info className="w-4 h-4 text-blue-600" />,
    success: <Check className="w-4 h-4 text-green-600" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600" />,
    alert: <AlertTriangle className="w-4 h-4 text-red-600" />,
    insight: <Lightbulb className="w-4 h-4 text-purple-600" />
};

const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-amber-100 text-amber-700',
    urgent: 'bg-red-100 text-red-700'
};

export default function NotificationCenter({ lang = 'pt' }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            const user = await base44.auth.me();
            const data = await base44.entities.UserNotification.filter(
                { user_email: user.email },
                '-created_date',
                50
            );
            setNotifications(data);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await base44.entities.UserNotification.update(id, {
                read: true,
                read_at: new Date().toISOString()
            });
            setNotifications(notifications.map(n => 
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await base44.entities.UserNotification.delete(id);
            setNotifications(notifications.filter(n => n.id !== id));
            toast.success(lang === 'pt' ? 'Notificação removida' : 'Notification removed');
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
            await Promise.all(unreadIds.map(id => 
                base44.entities.UserNotification.update(id, {
                    read: true,
                    read_at: new Date().toISOString()
                })
            ));
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            toast.success(lang === 'pt' ? 'Todas marcadas como lidas' : 'All marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        if (notification.action_url) {
            navigate(notification.action_url);
            setOpen(false);
        }
    };

    const filteredNotifications = filter === 'all' 
        ? notifications 
        : filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications.filter(n => n.category === filter);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-semibold"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
                <Card className="border-0 shadow-none">
                    <CardHeader className="pb-3 border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                                {lang === 'pt' ? 'Notificações' : 'Notifications'}
                            </CardTitle>
                            {unreadCount > 0 && (
                                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                                    <Check className="w-4 h-4 mr-1" />
                                    {lang === 'pt' ? 'Marcar todas' : 'Mark all'}
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
                        <div className="px-4 pt-3">
                            <TabsList className="w-full grid grid-cols-3">
                                <TabsTrigger value="all">
                                    {lang === 'pt' ? 'Todas' : 'All'}
                                </TabsTrigger>
                                <TabsTrigger value="unread">
                                    {lang === 'pt' ? 'Não lidas' : 'Unread'}
                                    {unreadCount > 0 && (
                                        <Badge className="ml-2 bg-red-600 text-white" variant="secondary">
                                            {unreadCount}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="insight">
                                    <Lightbulb className="w-4 h-4" />
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">
                                        {lang === 'pt' ? 'Nenhuma notificação' : 'No notifications'}
                                    </p>
                                </div>
                            ) : (
                                <ScrollArea className="h-96">
                                    <AnimatePresence>
                                        {filteredNotifications.map((notification) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                className={`border-b last:border-0 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                                                    !notification.read ? 'bg-blue-50/50' : ''
                                                }`}
                                                onClick={() => handleNotificationClick(notification)}
                                            >
                                                <div className="flex gap-3">
                                                    <div className="flex-shrink-0 mt-1">
                                                        {iconMap[notification.type]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2 mb-1">
                                                            <h4 className={`font-semibold text-sm ${!notification.read ? 'text-[#002D62]' : 'text-gray-700'}`}>
                                                                {notification.title}
                                                            </h4>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 flex-shrink-0"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteNotification(notification.id);
                                                                }}
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                        <p className="text-xs text-gray-600 mb-2">
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className={`text-xs ${priorityColors[notification.priority]}`}>
                                                                {notification.priority}
                                                            </Badge>
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(notification.created_date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Tabs>
                </Card>
            </PopoverContent>
        </Popover>
    );
}