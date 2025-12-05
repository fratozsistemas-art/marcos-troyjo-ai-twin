import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { User } from 'lucide-react';

export default function MessageBubble({ message }) {
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
                                    "text-[15px] prose prose-sm max-w-none",
                                    "prose-headings:text-[#002D62] prose-headings:font-semibold prose-headings:mb-3 prose-headings:mt-4 first:prose-headings:mt-0",
                                    "prose-p:text-[#333F48] prose-p:leading-relaxed prose-p:my-2",
                                    "prose-strong:text-[#002D62] prose-strong:font-semibold",
                                    "prose-em:text-[#00654A] prose-em:italic",
                                    "prose-ul:my-2 prose-ul:ml-4 prose-li:text-[#333F48] prose-li:my-1",
                                    "prose-ol:my-2 prose-ol:ml-4",
                                    "prose-blockquote:border-l-[#B8860B] prose-blockquote:text-[#333F48]/80 prose-blockquote:italic prose-blockquote:pl-4 prose-blockquote:my-3",
                                    "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
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
            </div>
            
            {isUser && (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#333F48]" />
                </div>
            )}
        </div>
    );
}