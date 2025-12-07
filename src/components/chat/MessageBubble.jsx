import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { User, ThumbsUp, ThumbsDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import DeepDiveSuggestions from './DeepDiveSuggestions';
import FeedbackWidget from './FeedbackWidget';

export default function MessageBubble({ message, onSuggestionSelect, lang = 'pt', conversationId, messageIndex }) {
    const isUser = message.role === 'user';
    const isLoading = message.role === 'assistant' && !message.content && message.tool_calls?.some(tc => tc.status === 'running' || tc.status === 'in_progress');
    
    return (
        <div className={cn("flex gap-4", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center shadow-lg">
                    <span className="text-white font-semibold text-xs">MT</span>
                </div>
            )}
            
            <div className={cn("max-w-[80%] md:max-w-[70%]", isUser && "flex flex-col items-end")}>
                {isLoading ? (
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#002D62] animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 rounded-full bg-[#00654A] animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 rounded-full bg-[#B8860B] animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                ) : message.content ? (
                    <div className={cn(
                        "rounded-2xl px-5 py-4 shadow-sm",
                        isUser 
                            ? "bg-[#002D62] text-white rounded-tr-md" 
                            : "bg-white border border-gray-100 rounded-tl-md"
                    )}>
                        {isUser ? (
                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        ) : (
                            <ReactMarkdown 
                                className={cn(
                                    "text-[15px] prose prose-sm max-w-none leading-relaxed",
                                    "prose-headings:text-[#002D62] prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-6 first:prose-headings:mt-0",
                                    "prose-h1:text-xl prose-h2:text-lg prose-h3:text-base",
                                    "prose-p:text-[#333F48] prose-p:leading-[1.75] prose-p:my-3",
                                    "prose-strong:text-[#002D62] prose-strong:font-bold",
                                    "prose-em:text-[#00654A] prose-em:not-italic prose-em:font-medium",
                                    "prose-ul:my-3 prose-ul:ml-6 prose-ul:space-y-2 prose-li:text-[#333F48] prose-li:leading-relaxed",
                                    "prose-ol:my-3 prose-ol:ml-6 prose-ol:space-y-2",
                                    "prose-blockquote:border-l-4 prose-blockquote:border-[#B8860B] prose-blockquote:bg-amber-50/50 prose-blockquote:text-[#333F48] prose-blockquote:italic prose-blockquote:pl-6 prose-blockquote:py-3 prose-blockquote:my-4 prose-blockquote:rounded-r-lg",
                                    "prose-code:text-[#00654A] prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono",
                                    "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
                                    "[&_p:last-child]:bg-gradient-to-r [&_p:last-child]:from-[#002D62]/5 [&_p:last-child]:to-transparent [&_p:last-child]:border-l-2 [&_p:last-child]:border-[#B8860B] [&_p:last-child]:pl-4 [&_p:last-child]:py-2 [&_p:last-child]:rounded-r-md [&_p:last-child]:text-[#002D62] [&_p:last-child]:italic"
                                )}
                                components={{
                                    h1: ({ children }) => <h1 className="text-xl font-bold">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-lg font-semibold">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-base font-semibold">{children}</h3>,
                                    a: ({ children, ...props }) => (
                                        <a {...props} className="text-[#00654A] underline hover:text-[#002D62] transition-colors" target="_blank" rel="noopener noreferrer">
                                            {children}
                                        </a>
                                    ),
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        )}
                        </div>
                        ) : null}

                        {!isUser && message.suggestions && message.suggestions.length > 0 && (
                            <DeepDiveSuggestions 
                                suggestions={message.suggestions}
                                onSelect={onSuggestionSelect}
                                lang={lang}
                            />
                        )}

                        {!isUser && !isLoading && message.content && conversationId && (
                            <FeedbackWidget
                                message={message}
                                conversationId={conversationId}
                                messageIndex={messageIndex}
                                lang={lang}
                            />
                        )}
                        </div>

                        {isUser && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-[#333F48]" />
                        </div>
                        )}
                        </div>
                        );
                        }