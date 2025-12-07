import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.2';
import { checkRateLimit } from './utils/rateLimiter.js';
import { logAccess } from './utils/accessControl.js';
import { watermarkContent } from './utils/watermark.js';

function generatePlainText(conversation, messages, includeMetadata) {
    let text = '';
    
    // Header
    text += '=' .repeat(80) + '\n';
    text += `CONVERSA: ${conversation.metadata?.name || 'Sem título'}\n`;
    text += `Data: ${new Date(conversation.created_date).toLocaleString('pt-BR')}\n`;
    text += '='.repeat(80) + '\n\n';
    
    // Messages
    messages.forEach((msg, idx) => {
        const role = msg.role === 'user' ? 'USUÁRIO' : 'MARCOS TROYJO';
        
        if (includeMetadata) {
            text += `[${role}] - ${new Date(msg.created_date || Date.now()).toLocaleString('pt-BR')}\n`;
        } else {
            text += `${role}:\n`;
        }
        
        text += msg.content + '\n\n';
        
        if (idx < messages.length - 1) {
            text += '-'.repeat(80) + '\n\n';
        }
    });
    
    // Footer
    text += '\n' + '='.repeat(80) + '\n';
    text += 'Exportado em: ' + new Date().toLocaleString('pt-BR') + '\n';
    text += 'Troyjo Digital Twin - Marcos Prado Troyjo\n';
    text += '='.repeat(80);
    
    return text;
}

function generateJSON(conversation, messages, includeMetadata) {
    const data = {
        conversation: {
            id: conversation.id,
            name: conversation.metadata?.name,
            created_date: conversation.created_date,
            language: conversation.metadata?.language || 'pt'
        },
        messages: messages.map(msg => {
            const msgData = {
                role: msg.role,
                content: msg.content
            };
            
            if (includeMetadata) {
                msgData.metadata = {
                    created_date: msg.created_date,
                    tool_calls: msg.tool_calls,
                    id: msg.id
                };
            }
            
            return msgData;
        }),
        export_info: {
            exported_at: new Date().toISOString(),
            format: 'json',
            version: '1.0'
        }
    };
    
    return JSON.stringify(data, null, 2);
}

function generatePDF(conversation, messages, includeMetadata) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;
    
    // Colors
    const primaryColor = [0, 45, 98]; // #002D62
    const secondaryColor = [0, 101, 74]; // #00654A
    const goldColor = [184, 134, 11]; // #B8860B
    
    // Header with gradient effect
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TROYJO DIGITAL TWIN', margin, 20);
    
    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Marcos Prado Troyjo - Conversa Exportada', margin, 28);
    
    yPosition = 55;
    
    // Conversation info box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F');
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Conversa: ${conversation.metadata?.name || 'Sem título'}`, margin + 5, yPosition + 8);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${new Date(conversation.created_date).toLocaleDateString('pt-BR')}`, margin + 5, yPosition + 15);
    doc.text(`Total de mensagens: ${messages.length}`, margin + 5, yPosition + 21);
    
    yPosition += 35;
    
    // Messages
    messages.forEach((msg, idx) => {
        const isUser = msg.role === 'user';
        
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = margin;
        }
        
        // Role badge
        doc.setFillColor(isUser ? ...goldColor : ...secondaryColor);
        const roleText = isUser ? 'USUÁRIO' : 'MARCOS TROYJO';
        const roleWidth = doc.getTextWidth(roleText) + 10;
        doc.roundedRect(margin, yPosition, roleWidth, 8, 2, 2, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(roleText, margin + 5, yPosition + 5.5);
        
        // Timestamp
        if (includeMetadata) {
            doc.setTextColor(128, 128, 128);
            doc.setFont('helvetica', 'normal');
            const timestamp = new Date(msg.created_date || Date.now()).toLocaleString('pt-BR');
            doc.text(timestamp, margin + roleWidth + 5, yPosition + 5.5);
        }
        
        yPosition += 12;
        
        // Message content
        doc.setTextColor(51, 63, 72);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const lines = doc.splitTextToSize(msg.content, contentWidth - 10);
        lines.forEach((line, lineIdx) => {
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = margin;
            }
            doc.text(line, margin + 5, yPosition);
            yPosition += 6;
        });
        
        yPosition += 8;
        
        // Separator line
        if (idx < messages.length - 1) {
            doc.setDrawColor(220, 220, 220);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 10;
        }
    });
    
    // Footer on last page
    const finalY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.setFont('helvetica', 'italic');
    doc.text(
        `Exportado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
        pageWidth / 2,
        finalY,
        { align: 'center' }
    );
    
    return doc.output('arraybuffer');
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limiting
        const rateCheck = checkRateLimit(user.email, 'exportConversation');
        if (!rateCheck.allowed) {
            return Response.json({ 
                error: 'Rate limit exceeded',
                retryAfter: rateCheck.retryAfter 
            }, { status: 429 });
        }

        const { conversation_id, format = 'pdf', include_metadata = true, message_range } = await req.json();
        
        if (!conversation_id) {
            return Response.json({ error: 'conversation_id is required' }, { status: 400 });
        }

        // Get conversation
        const conversation = await base44.agents.getConversation(conversation_id);
        
        if (!conversation) {
            return Response.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Get messages
        let messages = conversation.messages || [];
        
        // Apply range if specified
        if (message_range) {
            messages = messages.slice(message_range.start, message_range.end);
        }

        // Log access
        await logAccess(req, 'export', 'conversation', conversation_id, {
            format,
            message_count: messages.length
        });

        let content, mimeType, extension;
        
        switch (format) {
            case 'pdf':
                content = generatePDF(conversation, messages, include_metadata);
                mimeType = 'application/pdf';
                extension = 'pdf';
                break;
                
            case 'txt':
                content = generatePlainText(conversation, messages, include_metadata);
                mimeType = 'text/plain';
                extension = 'txt';
                break;
                
            case 'json':
                content = generateJSON(conversation, messages, include_metadata);
                mimeType = 'application/json';
                extension = 'json';
                break;
                
            default:
                return Response.json({ error: 'Invalid format' }, { status: 400 });
        }

        const filename = `troyjo_conversa_${new Date().toISOString().split('T')[0]}.${extension}`;

        return Response.json({
            content: format === 'pdf' ? Array.from(new Uint8Array(content)) : content,
            mimeType,
            filename
        });
        
    } catch (error) {
        console.error('Export error:', error);
        return Response.json({ 
            error: 'Export failed',
            details: error.message 
        }, { status: 500 });
    }
});