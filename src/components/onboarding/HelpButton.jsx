import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

const HelpButton = ({ content, lang = 'pt', position = 'bottom' }) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-blue-500 transition-colors"
                >
                    <HelpCircle className="w-4 h-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent 
                side={position}
                className="w-80 bg-white border-blue-200 shadow-xl"
            >
                <div className="space-y-2">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {content}
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default HelpButton;