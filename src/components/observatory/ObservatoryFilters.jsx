import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function ObservatoryFilters({ lang = 'pt', onClose, onApply }) {
    const [filters, setFilters] = useState({
        risk_level: 'all',
        agency: '',
        min_value: '',
        max_value: '',
        date_from: '',
        date_to: '',
        status: 'all'
    });

    const t = {
        pt: {
            title: 'Filtros',
            riskLevel: 'Nível de Risco',
            agency: 'Órgão',
            valueRange: 'Faixa de Valor',
            minValue: 'Valor Mínimo',
            maxValue: 'Valor Máximo',
            dateRange: 'Período',
            dateFrom: 'De',
            dateTo: 'Até',
            status: 'Status',
            apply: 'Aplicar Filtros',
            clear: 'Limpar',
            all: 'Todos'
        },
        en: {
            title: 'Filters',
            riskLevel: 'Risk Level',
            agency: 'Agency',
            valueRange: 'Value Range',
            minValue: 'Min Value',
            maxValue: 'Max Value',
            dateRange: 'Date Range',
            dateFrom: 'From',
            dateTo: 'To',
            status: 'Status',
            apply: 'Apply Filters',
            clear: 'Clear',
            all: 'All'
        }
    };

    const text = t[lang];

    const handleApply = () => {
        onApply(filters);
    };

    const handleClear = () => {
        setFilters({
            risk_level: 'all',
            agency: '',
            min_value: '',
            max_value: '',
            date_from: '',
            date_to: '',
            status: 'all'
        });
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-lg"
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="w-5 h-5" />
                                    {text.title}
                                </CardTitle>
                                <Button variant="ghost" size="sm" onClick={onClose}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Risk Level */}
                            <div>
                                <Label>{text.riskLevel}</Label>
                                <Select
                                    value={filters.risk_level}
                                    onValueChange={(value) => setFilters({ ...filters, risk_level: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{text.all}</SelectItem>
                                        <SelectItem value="critical">Crítico</SelectItem>
                                        <SelectItem value="high">Alto</SelectItem>
                                        <SelectItem value="medium">Médio</SelectItem>
                                        <SelectItem value="low">Baixo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Agency */}
                            <div>
                                <Label>{text.agency}</Label>
                                <Input
                                    placeholder={text.agency}
                                    value={filters.agency}
                                    onChange={(e) => setFilters({ ...filters, agency: e.target.value })}
                                />
                            </div>

                            {/* Value Range */}
                            <div>
                                <Label>{text.valueRange}</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="number"
                                        placeholder={text.minValue}
                                        value={filters.min_value}
                                        onChange={(e) => setFilters({ ...filters, min_value: e.target.value })}
                                    />
                                    <Input
                                        type="number"
                                        placeholder={text.maxValue}
                                        value={filters.max_value}
                                        onChange={(e) => setFilters({ ...filters, max_value: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Date Range */}
                            <div>
                                <Label>{text.dateRange}</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="date"
                                        value={filters.date_from}
                                        onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                                    />
                                    <Input
                                        type="date"
                                        value={filters.date_to}
                                        onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <Label>{text.status}</Label>
                                <Select
                                    value={filters.status}
                                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{text.all}</SelectItem>
                                        <SelectItem value="active">Ativo</SelectItem>
                                        <SelectItem value="pending">Pendente</SelectItem>
                                        <SelectItem value="completed">Concluído</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4">
                                <Button variant="outline" onClick={handleClear} className="flex-1">
                                    {text.clear}
                                </Button>
                                <Button onClick={handleApply} className="flex-1 bg-[#002D62]">
                                    {text.apply}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}