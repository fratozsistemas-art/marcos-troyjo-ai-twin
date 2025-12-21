import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { text, article_url, article_title } = await req.json();

        // Get LinkedIn access token
        const accessToken = await base44.asServiceRole.connectors.getAccessToken("linkedin");

        // Get LinkedIn user ID (sub)
        const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        if (!profileResponse.ok) {
            throw new Error('Failed to get LinkedIn profile');
        }

        const profile = await profileResponse.json();
        const linkedinUserId = profile.sub;

        // Create post
        const postData = {
            author: `urn:li:person:${linkedinUserId}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: text || `Novo artigo publicado: ${article_title}\n\n${article_url}`
                    },
                    shareMediaCategory: 'ARTICLE',
                    media: article_url ? [{
                        status: 'READY',
                        originalUrl: article_url,
                        title: {
                            text: article_title
                        }
                    }] : []
                }
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
        };

        const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify(postData)
        });

        if (!postResponse.ok) {
            const errorText = await postResponse.text();
            console.error('LinkedIn API error:', errorText);
            throw new Error(`Failed to post to LinkedIn: ${postResponse.status}`);
        }

        const result = await postResponse.json();

        return Response.json({ 
            success: true, 
            post_id: result.id,
            message: 'Posted to LinkedIn successfully'
        });

    } catch (error) {
        console.error('Error posting to LinkedIn:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});