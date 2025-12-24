import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, LineChart, PieChart, TrendingUp, Plus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CHART_TYPES = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'line', label: 'Line Chart', icon: LineChart },
    { value: 'area', label: 'Area Chart', icon: TrendingUp },
    { value: 'pie', label: 'Pie Chart', icon: PieChart }
];

const AVAILABLE_ENTITIES = [
    'Forum', 'Event', 'KeyActor', 'Document', 'Publication', 
    'Book', 'Award', 'AgentInteractionLog', 'Feedback'
];

export default function ChartBuilder({ onSave, initialConfig, lang = 'pt' }) {
    const [config, setConfig] = useState(initialConfig || {
        title: '',
        entity: '',
        chartType: 'bar',
        fields: [],
        filters: {},
        color: '#002D62'
    });
    const [entityFields, setEntityFields] = useState([]);
    const [preview, setPreview] = useState(null);

    const t = {
        pt: {
            title: 'Construtor de Gráficos',
            chartTitle: 'Título do Gráfico',
            selectEntity: 'Selecionar Entidade',
            chartType: 'Tipo de Gráfico',
            fields: 'Campos',
            addField: 'Adicionar Campo',
            color: 'Cor',
            preview: 'Prévia',
            save: 'Salvar',
            cancel: 'Cancelar'
        },
        en: {
            title: 'Chart Builder',
            chartTitle: 'Chart Title',
            selectEntity: 'Select Entity',
            chartType: 'Chart Type',
            fields: 'Fields',
            addField: 'Add Field',
            color: 'Color',
            preview: 'Preview',
            save: 'Save',
            cancel: 'Cancel'
        }
    };

    const text = t[lang];

    useEffect(() => {
        if (config.entity) {
            loadEntitySchema();
        }
    }, [config.entity]);

    const loadEntitySchema = async () => {
        try {
            const schema = await base44.entities[config.entity].schema();
            const fields = Object.keys(schema.properties || {});
            setEntityFields(fields);
        } catch (error) {
            console.error('Error loading schema:', error);
        }
    };

    const addField = () => {
        setConfig(prev => ({
            ...prev,
            fields: [...prev.fields, { name: '', aggregation: 'count' }]
        }));
    };

    const updateField = (index, key, value) => {
        const newFields = [...config.fields];
        newFields[index][key] = value;
        setConfig(prev => ({ ...prev, fields: newFields }));
    };

    const removeField = (index) => {
        setConfig(prev => ({
            ...prev,
            fields: prev.fields.filter((_, i) => i !== index)
        }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#002D62]" />
                    {text.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label>{text.chartTitle}</Label>
                    <Input
                        value={config.title}
                        onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                        placeholder={text.chartTitle}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>{text.selectEntity}</Label>
                        <Select
                            value={config.entity}
                            onValueChange={(value) => setConfig(prev => ({ ...prev, entity: value, fields: [] }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={text.selectEntity} />
                            </SelectTrigger>
                            <SelectContent>
                                {AVAILABLE_ENTITIES.map(entity => (
                                    <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>{text.chartType}</Label>
                        <Select
                            value={config.chartType}
                            onValueChange={(value) => setConfig(prev => ({ ...prev, chartType: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CHART_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <Label>{text.fields}</Label>
                        <Button size="sm" variant="outline" onClick={addField}>
                            <Plus className="w-4 h-4 mr-1" />
                            {text.addField}
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {config.fields.map((field, index) => (
                            <div key={index} className="flex gap-2">
                                <Select
                                    value={field.name}
                                    onValueChange={(value) => updateField(index, 'name', value)}
                                >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Select field" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {entityFields.map(f => (
                                            <SelectItem key={f} value={f}>{f}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={field.aggregation}
                                    onValueChange={(value) => updateField(index, 'aggregation', value)}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="count">Count</SelectItem>
                                        <SelectItem value="sum">Sum</SelectItem>
                                        <SelectItem value="avg">Average</SelectItem>
                                        <SelectItem value="min">Min</SelectItem>
                                        <SelectItem value="max">Max</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeField(index)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <Label>{text.color}</Label>
                    <Input
                        type="color"
                        value={config.color}
                        onChange={(e) => setConfig(prev => ({ ...prev, color: e.target.value }))}
                        className="h-10"
                    />
                </div>

                <div className="flex gap-2">
                    <Button onClick={() => onSave(config)} className="flex-1">
                        {text.save}
                    </Button>
                    <Button variant="outline" onClick={() => onSave(null)}>
                        {text.cancel}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}