import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            query, 
            content_types = ['all'], 
            tags = [], 
            date_from, 
            date_to,
            sort_by = 'relevance',
            limit = 50
        } = await req.json();

        const results = {
            articles: [],
            documents: [],
            facts: [],
            publications: [],
            books: [],
            interviews: []
        };

        const searchInType = content_types.includes('all') || content_types.length === 0;

        // Search Articles
        if (searchInType || content_types.includes('article')) {
            const articles = await base44.asServiceRole.entities.Article.list('-created_date', 100);
            results.articles = articles.filter(a => {
                const matchesQuery = !query || 
                    a.title?.toLowerCase().includes(query.toLowerCase()) ||
                    a.content?.toLowerCase().includes(query.toLowerCase());
                const matchesTags = tags.length === 0 || tags.some(tag => a.tags?.includes(tag));
                const matchesDate = (!date_from || new Date(a.created_date) >= new Date(date_from)) &&
                                  (!date_to || new Date(a.created_date) <= new Date(date_to));
                return matchesQuery && matchesTags && matchesDate;
            }).slice(0, limit);
        }

        // Search Documents
        if (searchInType || content_types.includes('document')) {
            const documents = await base44.asServiceRole.entities.Document.list('-created_date', 100);
            results.documents = documents.filter(d => {
                const matchesQuery = !query || 
                    d.title?.toLowerCase().includes(query.toLowerCase()) ||
                    d.description?.toLowerCase().includes(query.toLowerCase());
                const matchesTags = tags.length === 0 || tags.some(tag => d.tags?.includes(tag));
                const matchesDate = (!date_from || new Date(d.created_date) >= new Date(date_from)) &&
                                  (!date_to || new Date(d.created_date) <= new Date(date_to));
                return matchesQuery && matchesTags && matchesDate;
            }).slice(0, limit);
        }

        // Search Strategic Facts
        if (searchInType || content_types.includes('fact')) {
            const facts = await base44.asServiceRole.entities.StrategicFact.list('-created_date', 100);
            results.facts = facts.filter(f => {
                const matchesQuery = !query || 
                    f.summary?.toLowerCase().includes(query.toLowerCase()) ||
                    f.detail?.toLowerCase().includes(query.toLowerCase()) ||
                    f.topic_label?.toLowerCase().includes(query.toLowerCase());
                const matchesTags = tags.length === 0 || tags.some(tag => f.tags?.includes(tag));
                const matchesDate = (!date_from || new Date(f.start_date) >= new Date(date_from)) &&
                                  (!date_to || new Date(f.start_date) <= new Date(date_to));
                return matchesQuery && matchesTags && matchesDate;
            }).slice(0, limit);
        }

        // Search Publications
        if (searchInType || content_types.includes('publication')) {
            const publications = await base44.asServiceRole.entities.Publication.list('-created_date', 100);
            results.publications = publications.filter(p => {
                const matchesQuery = !query || 
                    p.title?.toLowerCase().includes(query.toLowerCase()) ||
                    p.description?.toLowerCase().includes(query.toLowerCase());
                const matchesTags = tags.length === 0 || tags.some(tag => p.tags?.includes(tag));
                const matchesDate = (!date_from || new Date(p.publication_date) >= new Date(date_from)) &&
                                  (!date_to || new Date(p.publication_date) <= new Date(date_to));
                return matchesQuery && matchesTags && matchesDate;
            }).slice(0, limit);
        }

        // Search Books
        if (searchInType || content_types.includes('book')) {
            const books = await base44.asServiceRole.entities.Book.list('-year', 50);
            results.books = books.filter(b => {
                const matchesQuery = !query || 
                    b.title?.toLowerCase().includes(query.toLowerCase()) ||
                    b.description?.toLowerCase().includes(query.toLowerCase());
                const matchesTags = tags.length === 0 || tags.some(tag => b.tags?.includes(tag));
                return matchesQuery && matchesTags;
            }).slice(0, limit);
        }

        // Search Interview Transcripts
        if (searchInType || content_types.includes('interview')) {
            const interviews = await base44.asServiceRole.entities.InterviewTranscript.list('-created_date', 50);
            results.interviews = interviews.filter(i => {
                const matchesQuery = !query || 
                    i.title?.toLowerCase().includes(query.toLowerCase()) ||
                    i.summary?.toLowerCase().includes(query.toLowerCase());
                const matchesTags = tags.length === 0 || tags.some(tag => i.tags?.includes(tag));
                const matchesDate = (!date_from || new Date(i.interview_date) >= new Date(date_from)) &&
                                  (!date_to || new Date(i.interview_date) <= new Date(date_to));
                return matchesQuery && matchesTags && matchesDate;
            }).slice(0, limit);
        }

        // Calculate statistics
        const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
        
        // Extract all tags for faceted search
        const allTags = new Set();
        Object.values(results).flat().forEach(item => {
            item.tags?.forEach(tag => allTags.add(tag));
        });

        return Response.json({
            success: true,
            query,
            results,
            statistics: {
                total_results: totalResults,
                by_type: {
                    articles: results.articles.length,
                    documents: results.documents.length,
                    facts: results.facts.length,
                    publications: results.publications.length,
                    books: results.books.length,
                    interviews: results.interviews.length
                }
            },
            available_tags: Array.from(allTags).sort(),
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in unified search:', error);
        return Response.json({ 
            error: error.message,
            details: 'Failed to perform unified content search'
        }, { status: 500 });
    }
});