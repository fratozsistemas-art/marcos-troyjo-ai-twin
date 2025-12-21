import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { file_name, file_content, mime_type, folder_name } = await req.json();

        if (!file_name || !file_content) {
            return Response.json({ 
                error: 'Missing required fields: file_name, file_content' 
            }, { status: 400 });
        }

        // Get Google Drive access token
        const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');

        // Create folder if specified
        let folderId = null;
        if (folder_name) {
            const folderResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: folder_name,
                    mimeType: 'application/vnd.google-apps.folder'
                })
            });

            if (folderResponse.ok) {
                const folderData = await folderResponse.json();
                folderId = folderData.id;
            }
        }

        // Prepare file metadata
        const metadata = {
            name: file_name,
            parents: folderId ? [folderId] : undefined
        };

        // Convert base64 content if needed
        let fileData;
        if (file_content.startsWith('data:')) {
            const base64Data = file_content.split(',')[1];
            fileData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        } else if (file_content.startsWith('http')) {
            // Fetch from URL
            const response = await fetch(file_content);
            fileData = new Uint8Array(await response.arrayBuffer());
        } else {
            // Assume plain text
            fileData = new TextEncoder().encode(file_content);
        }

        // Upload to Google Drive using multipart upload
        const boundary = '-------314159265358979323846';
        const delimiter = `\r\n--${boundary}\r\n`;
        const close_delim = `\r\n--${boundary}--`;

        const multipartRequestBody = 
            delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            `Content-Type: ${mime_type || 'application/octet-stream'}\r\n\r\n`;

        const multipartRequestBodyEnd = close_delim;

        const combinedData = new Uint8Array(
            new TextEncoder().encode(multipartRequestBody).length +
            fileData.length +
            new TextEncoder().encode(multipartRequestBodyEnd).length
        );

        let offset = 0;
        const bodyStart = new TextEncoder().encode(multipartRequestBody);
        combinedData.set(bodyStart, offset);
        offset += bodyStart.length;
        combinedData.set(fileData, offset);
        offset += fileData.length;
        const bodyEnd = new TextEncoder().encode(multipartRequestBodyEnd);
        combinedData.set(bodyEnd, offset);

        const uploadResponse = await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': `multipart/related; boundary=${boundary}`
                },
                body: combinedData
            }
        );

        if (!uploadResponse.ok) {
            const error = await uploadResponse.text();
            console.error('Google Drive upload error:', error);
            return Response.json({ 
                error: 'Failed to upload to Google Drive',
                details: error
            }, { status: 500 });
        }

        const result = await uploadResponse.json();

        return Response.json({
            success: true,
            file_id: result.id,
            file_name: result.name,
            web_view_link: `https://drive.google.com/file/d/${result.id}/view`,
            message: 'File uploaded successfully to Google Drive'
        });

    } catch (error) {
        console.error('Error uploading to Google Drive:', error);
        return Response.json({ 
            error: error.message,
            details: error.stack
        }, { status: 500 });
    }
});