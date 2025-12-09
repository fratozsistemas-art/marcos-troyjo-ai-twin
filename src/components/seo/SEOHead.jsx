import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEOHead({ 
    title, 
    description, 
    keywords = [],
    author = 'Marcos Troyjo',
    type = 'article',
    image,
    url,
    publishedTime,
    modifiedTime,
    section,
    tags = [],
    structuredData
}) {
    const siteName = 'Marcos Troyjo Digital Twin';
    const defaultImage = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69335f9184b5ddfb48500fe5/8c955389f_Replace_the_transparent_checkered_background_with_-1765063055494.png';
    
    const finalImage = image || defaultImage;
    const finalUrl = url || window.location.href;
    const finalTitle = title ? `${title} | ${siteName}` : siteName;
    const finalDescription = description || 'Geopolitical analysis and economic intelligence from Marcos Troyjo';

    // Build comprehensive Schema.org structured data
    const buildStructuredData = () => {
        const schemas = [];

        // Organization schema
        schemas.push({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "CAIO.Vision",
            "alternateName": "Troyjo Strategic Intelligence",
            "url": "https://troyjotwin.com",
            "logo": defaultImage,
            "description": "Geopolitical analysis and economic intelligence platform"
        });

        // Person schema for Marcos Troyjo
        schemas.push({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Marcos Prado Troyjo",
            "alternateName": "Marcos Troyjo",
            "jobTitle": "Economist and Former BRICS Bank President",
            "description": "International economist, former President of the New Development Bank (BRICS Bank), and expert in global trade and geopolitics",
            "url": finalUrl,
            "image": defaultImage,
            "sameAs": [
                "https://www.linkedin.com/in/marcostroyjo",
                "https://twitter.com/marcostroyjo"
            ],
            "knowsAbout": [
                "International Economics",
                "Global Trade",
                "BRICS",
                "Geopolitics",
                "Economic Diplomacy",
                "Competitiveness"
            ],
            "alumniOf": [
                {
                    "@type": "EducationalOrganization",
                    "name": "Columbia University"
                },
                {
                    "@type": "EducationalOrganization",
                    "name": "University of Oxford"
                }
            ]
        });

        // Article schema (if type is article)
        if (type === 'article' && title) {
            schemas.push({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": title,
                "description": description,
                "image": finalImage,
                "datePublished": publishedTime,
                "dateModified": modifiedTime || publishedTime,
                "author": {
                    "@type": "Person",
                    "name": author
                },
                "publisher": {
                    "@type": "Organization",
                    "name": siteName,
                    "logo": {
                        "@type": "ImageObject",
                        "url": defaultImage
                    }
                },
                "keywords": keywords.join(', '),
                "articleSection": section,
                "inLanguage": "pt-BR",
                "url": finalUrl
            });
        }

        // Add custom structured data if provided
        if (structuredData) {
            schemas.push(structuredData);
        }

        return schemas;
    };

    const schemas = buildStructuredData();

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{finalTitle}</title>
            <meta name="title" content={finalTitle} />
            <meta name="description" content={finalDescription} />
            {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
            <meta name="author" content={author} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={finalUrl} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDescription} />
            <meta property="og:image" content={finalImage} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content="pt_BR" />
            
            {type === 'article' && publishedTime && (
                <>
                    <meta property="article:published_time" content={publishedTime} />
                    {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
                    <meta property="article:author" content={author} />
                    {section && <meta property="article:section" content={section} />}
                    {tags.map((tag, idx) => (
                        <meta key={idx} property="article:tag" content={tag} />
                    ))}
                </>
            )}

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={finalUrl} />
            <meta name="twitter:title" content={finalTitle} />
            <meta name="twitter:description" content={finalDescription} />
            <meta name="twitter:image" content={finalImage} />
            <meta name="twitter:creator" content="@marcostroyjo" />

            {/* Additional SEO tags */}
            <link rel="canonical" href={finalUrl} />
            <meta name="robots" content="index, follow" />
            <meta name="language" content="Portuguese" />
            <meta name="revisit-after" content="7 days" />

            {/* Schema.org structured data */}
            {schemas.map((schema, idx) => (
                <script key={idx} type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            ))}
        </Helmet>
    );
}