import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Palette } from 'lucide-react';

export default function PDFCustomizer({ config, onConfigChange, lang = 'pt' }) {
    const [pdfConfig, setPdfConfig] = useState(config || {
        title: lang === 'pt' ? 'Relatório SSOT' : 'SSOT Report',
        orientation: 'portrait',
        fontSize: 'medium',
        includeHeader: true,
        includeFooter: true,
        includeDate: true,
        includeAuthor: true,
        colorScheme: 'default',
        logoPosition: 'top-left'
    });

    const updateConfig = (key, value) => {
        const updated = { ...pdfConfig, [key]: value };
        setPdfConfig(updated);
        onConfigChange(updated);
    };

    const t = {
        pt: {
            title: 'Customização de PDF',
            reportTitle: 'Título do Relatório',
            orientation: 'Orientação',
            portrait: 'Retrato',
            landscape: 'Paisagem',
            fontSize: 'Tamanho da Fonte',
            small: 'Pequeno',
            medium: 'Médio',
            large: 'Grande',
            includeHeader: 'Incluir Cabeçalho',
            includeFooter: 'Incluir Rodapé',
            includeDate: 'Incluir Data',
            includeAuthor: 'Incluir Autor',
            colorScheme: 'Esquema de Cores',
            default: 'Padrão',
            monochrome: 'Monocromático',
            vibrant: 'Vibrante',
            logoPosition: 'Posição do Logo',
            topLeft: 'Superior Esquerdo',
            topCenter: 'Superior Centro',
            topRight: 'Superior Direito'
        },
        en: {
            title: 'PDF Customization',
            reportTitle: 'Report Title',
            orientation: 'Orientation',
            portrait: 'Portrait',
            landscape: 'Landscape',
            fontSize: 'Font Size',
            small: 'Small',
            medium: 'Medium',
            large: 'Large',
            includeHeader: 'Include Header',
            includeFooter: 'Include Footer',
            includeDate: 'Include Date',
            includeAuthor: 'Include Author',
            colorScheme: 'Color Scheme',
            default: 'Default',
            monochrome: 'Monochrome',
            vibrant: 'Vibrant',
            logoPosition: 'Logo Position',
            topLeft: 'Top Left',
            topCenter: 'Top Center',
            topRight: 'Top Right'
        }
    };

    const text = t[lang];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                    <Palette className="w-4 h-4 text-[#002D62]" />
                    {text.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label className="text-xs">{text.reportTitle}</Label>
                    <Input
                        value={pdfConfig.title}
                        onChange={(e) => updateConfig('title', e.target.value)}
                        className="mt-1"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-xs">{text.orientation}</Label>
                        <Select
                            value={pdfConfig.orientation}
                            onValueChange={(value) => updateConfig('orientation', value)}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="portrait">{text.portrait}</SelectItem>
                                <SelectItem value="landscape">{text.landscape}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-xs">{text.fontSize}</Label>
                        <Select
                            value={pdfConfig.fontSize}
                            onValueChange={(value) => updateConfig('fontSize', value)}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="small">{text.small}</SelectItem>
                                <SelectItem value="medium">{text.medium}</SelectItem>
                                <SelectItem value="large">{text.large}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Separator />

                <div className="space-y-2">
                    {[
                        { key: 'includeHeader', label: text.includeHeader },
                        { key: 'includeFooter', label: text.includeFooter },
                        { key: 'includeDate', label: text.includeDate },
                        { key: 'includeAuthor', label: text.includeAuthor }
                    ].map(({ key, label }) => (
                        <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                                id={key}
                                checked={pdfConfig[key]}
                                onCheckedChange={(checked) => updateConfig(key, checked)}
                            />
                            <Label htmlFor={key} className="text-xs cursor-pointer">
                                {label}
                            </Label>
                        </div>
                    ))}
                </div>

                <Separator />

                <div>
                    <Label className="text-xs">{text.colorScheme}</Label>
                    <Select
                        value={pdfConfig.colorScheme}
                        onValueChange={(value) => updateConfig('colorScheme', value)}
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">{text.default}</SelectItem>
                            <SelectItem value="monochrome">{text.monochrome}</SelectItem>
                            <SelectItem value="vibrant">{text.vibrant}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label className="text-xs">{text.logoPosition}</Label>
                    <Select
                        value={pdfConfig.logoPosition}
                        onValueChange={(value) => updateConfig('logoPosition', value)}
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="top-left">{text.topLeft}</SelectItem>
                            <SelectItem value="top-center">{text.topCenter}</SelectItem>
                            <SelectItem value="top-right">{text.topRight}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}