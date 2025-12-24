import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, GripVertical, Plus } from 'lucide-react';

const entityFields = {
    Forum: {
        pt: {
            name: 'Nome', full_name: 'Nome Completo', acronym: 'Sigla', type: 'Tipo',
            members: 'Membros', established_year: 'Ano de Criação', headquarters: 'Sede',
            key_themes: 'Temas Principais', significance: 'Importância'
        },
        en: {
            name: 'Name', full_name: 'Full Name', acronym: 'Acronym', type: 'Type',
            members: 'Members', established_year: 'Established Year', headquarters: 'Headquarters',
            key_themes: 'Key Themes', significance: 'Significance'
        }
    },
    Event: {
        pt: {
            name: 'Nome', event_type: 'Tipo', start_date: 'Data Início', end_date: 'Data Fim',
            location: 'Localização', description: 'Descrição', key_themes: 'Temas',
            status: 'Status', significance: 'Importância'
        },
        en: {
            name: 'Name', event_type: 'Type', start_date: 'Start Date', end_date: 'End Date',
            location: 'Location', description: 'Description', key_themes: 'Themes',
            status: 'Status', significance: 'Significance'
        }
    },
    KeyActor: {
        pt: {
            name: 'Nome', type: 'Tipo', country: 'País', acronym: 'Sigla',
            full_name: 'Nome Completo', description: 'Descrição', role: 'Papel',
            areas_of_influence: 'Áreas de Influência', strategic_importance: 'Importância Estratégica'
        },
        en: {
            name: 'Name', type: 'Type', country: 'Country', acronym: 'Acronym',
            full_name: 'Full Name', description: 'Description', role: 'Role',
            areas_of_influence: 'Areas of Influence', strategic_importance: 'Strategic Importance'
        }
    }
};

export default function ReportBuilder({ selectedEntities, selectedFields, onFieldsChange, lang = 'pt' }) {
    const [availableFields, setAvailableFields] = useState(() => {
        const fields = {};
        selectedEntities.forEach(entity => {
            fields[entity] = Object.keys(entityFields[entity][lang]).filter(
                f => !selectedFields[entity]?.includes(f)
            );
        });
        return fields;
    });

    const handleDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceEntity = source.droppableId.replace('available-', '').replace('selected-', '');
        const destEntity = destination.droppableId.replace('available-', '').replace('selected-', '');
        
        if (source.droppableId.startsWith('available-') && destination.droppableId.startsWith('selected-')) {
            // Moving from available to selected
            const field = availableFields[sourceEntity][source.index];
            const newAvailable = [...availableFields[sourceEntity]];
            newAvailable.splice(source.index, 1);
            
            const newSelected = [...(selectedFields[sourceEntity] || [])];
            newSelected.splice(destination.index, 0, field);

            setAvailableFields({ ...availableFields, [sourceEntity]: newAvailable });
            onFieldsChange({ ...selectedFields, [sourceEntity]: newSelected });
        } else if (source.droppableId.startsWith('selected-') && destination.droppableId.startsWith('selected-')) {
            // Reordering within selected
            const newSelected = [...selectedFields[sourceEntity]];
            const [removed] = newSelected.splice(source.index, 1);
            newSelected.splice(destination.index, 0, removed);
            
            onFieldsChange({ ...selectedFields, [sourceEntity]: newSelected });
        }
    };

    const removeField = (entity, field) => {
        const newSelected = selectedFields[entity].filter(f => f !== field);
        const newAvailable = [...availableFields[entity], field];
        
        setAvailableFields({ ...availableFields, [entity]: newAvailable });
        onFieldsChange({ ...selectedFields, [entity]: newSelected });
    };

    const addField = (entity, field) => {
        const newAvailable = availableFields[entity].filter(f => f !== field);
        const newSelected = [...(selectedFields[entity] || []), field];
        
        setAvailableFields({ ...availableFields, [entity]: newAvailable });
        onFieldsChange({ ...selectedFields, [entity]: newSelected });
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="space-y-4">
                {selectedEntities.map(entity => (
                    <Card key={entity}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-[#002D62]">
                                {entity === 'Forum' ? (lang === 'pt' ? 'Fóruns' : 'Forums') :
                                 entity === 'Event' ? (lang === 'pt' ? 'Eventos' : 'Events') :
                                 (lang === 'pt' ? 'Atores Chave' : 'Key Actors')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Selected Fields */}
                            <div>
                                <div className="text-xs font-semibold text-[#6B6B6B] mb-2">
                                    {lang === 'pt' ? 'Campos Selecionados' : 'Selected Fields'}
                                </div>
                                <Droppable droppableId={`selected-${entity}`}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`min-h-[60px] p-2 rounded-lg border-2 border-dashed transition-colors ${
                                                snapshot.isDraggingOver 
                                                    ? 'border-[#002D62] bg-blue-50' 
                                                    : 'border-gray-200 bg-gray-50'
                                            }`}
                                        >
                                            {selectedFields[entity]?.length === 0 ? (
                                                <p className="text-xs text-[#6B6B6B] text-center py-4">
                                                    {lang === 'pt' ? 'Arraste campos aqui' : 'Drag fields here'}
                                                </p>
                                            ) : (
                                                selectedFields[entity]?.map((field, index) => (
                                                    <Draggable key={field} draggableId={`${entity}-${field}`} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className={`flex items-center justify-between gap-2 p-2 mb-2 rounded bg-white border shadow-sm ${
                                                                    snapshot.isDragging ? 'shadow-lg' : ''
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div {...provided.dragHandleProps}>
                                                                        <GripVertical className="w-4 h-4 text-gray-400" />
                                                                    </div>
                                                                    <span className="text-xs font-medium">
                                                                        {entityFields[entity][lang][field]}
                                                                    </span>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 w-6 p-0"
                                                                    onClick={() => removeField(entity, field)}
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>

                            {/* Available Fields */}
                            {availableFields[entity]?.length > 0 && (
                                <div>
                                    <div className="text-xs font-semibold text-[#6B6B6B] mb-2">
                                        {lang === 'pt' ? 'Campos Disponíveis' : 'Available Fields'}
                                    </div>
                                    <Droppable droppableId={`available-${entity}`} isDropDisabled>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="flex flex-wrap gap-2"
                                            >
                                                {availableFields[entity].map((field, index) => (
                                                    <Badge
                                                        key={field}
                                                        variant="outline"
                                                        className="cursor-pointer hover:bg-[#002D62] hover:text-white transition-colors"
                                                        onClick={() => addField(entity, field)}
                                                    >
                                                        <Plus className="w-3 h-3 mr-1" />
                                                        {entityFields[entity][lang][field]}
                                                    </Badge>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </DragDropContext>
    );
}