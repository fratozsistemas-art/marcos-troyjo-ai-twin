import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Filter } from 'lucide-react';

export default function AdvancedFilters({ selectedEntities, filters, onFiltersChange, lang = 'pt' }) {
    const [localFilters, setLocalFilters] = useState(filters || []);

    const operators = {
        pt: {
            eq: 'Igual a',
            ne: 'Diferente de',
            gt: 'Maior que',
            gte: 'Maior ou igual',
            lt: 'Menor que',
            lte: 'Menor ou igual',
            contains: 'Contém',
            startsWith: 'Começa com',
            endsWith: 'Termina com'
        },
        en: {
            eq: 'Equals',
            ne: 'Not equals',
            gt: 'Greater than',
            gte: 'Greater or equal',
            lt: 'Less than',
            lte: 'Less or equal',
            contains: 'Contains',
            startsWith: 'Starts with',
            endsWith: 'Ends with'
        }
    };

    const entityFieldsMap = {
        Forum: ['name', 'type', 'established_year', 'headquarters'],
        Event: ['name', 'event_type', 'start_date', 'end_date', 'status'],
        KeyActor: ['name', 'type', 'country', 'strategic_importance']
    };

    const addFilter = () => {
        const newFilter = {
            id: Date.now(),
            entity: selectedEntities[0] || 'Forum',
            field: '',
            operator: 'eq',
            value: ''
        };
        const updated = [...localFilters, newFilter];
        setLocalFilters(updated);
        onFiltersChange(updated);
    };

    const updateFilter = (id, key, value) => {
        const updated = localFilters.map(f => 
            f.id === id ? { ...f, [key]: value } : f
        );
        setLocalFilters(updated);
        onFiltersChange(updated);
    };

    const removeFilter = (id) => {
        const updated = localFilters.filter(f => f.id !== id);
        setLocalFilters(updated);
        onFiltersChange(updated);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Filter className="w-4 h-4 text-[#002D62]" />
                        {lang === 'pt' ? 'Filtros Avançados' : 'Advanced Filters'}
                    </CardTitle>
                    <Button size="sm" variant="outline" onClick={addFilter}>
                        <Plus className="w-4 h-4 mr-1" />
                        {lang === 'pt' ? 'Adicionar' : 'Add'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {localFilters.length === 0 ? (
                    <p className="text-xs text-[#6B6B6B] text-center py-4">
                        {lang === 'pt' ? 'Nenhum filtro configurado' : 'No filters configured'}
                    </p>
                ) : (
                    localFilters.map((filter) => (
                        <div key={filter.id} className="flex gap-2 p-3 bg-gray-50 rounded-lg border">
                            <Select
                                value={filter.entity}
                                onValueChange={(value) => updateFilter(filter.id, 'entity', value)}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedEntities.map(entity => (
                                        <SelectItem key={entity} value={entity}>
                                            {entity === 'Forum' ? (lang === 'pt' ? 'Fórum' : 'Forum') :
                                             entity === 'Event' ? (lang === 'pt' ? 'Evento' : 'Event') :
                                             (lang === 'pt' ? 'Ator' : 'Actor')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filter.field}
                                onValueChange={(value) => updateFilter(filter.id, 'field', value)}
                            >
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder={lang === 'pt' ? 'Campo' : 'Field'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {entityFieldsMap[filter.entity]?.map(field => (
                                        <SelectItem key={field} value={field}>
                                            {field.replace(/_/g, ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filter.operator}
                                onValueChange={(value) => updateFilter(filter.id, 'operator', value)}
                            >
                                <SelectTrigger className="w-36">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(operators[lang]).map(op => (
                                        <SelectItem key={op} value={op}>
                                            {operators[lang][op]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                placeholder={lang === 'pt' ? 'Valor' : 'Value'}
                                value={filter.value}
                                onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                                className="flex-1"
                            />

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFilter(filter.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}