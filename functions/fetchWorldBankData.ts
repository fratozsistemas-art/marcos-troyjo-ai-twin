import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { indicators, countries, startYear, endYear } = await req.json();

        // Default indicators if none provided
        const defaultIndicators = [
            'NY.GDP.MKTP.CD', // GDP (current US$)
            'NY.GDP.PCAP.CD', // GDP per capita (current US$)
            'NE.TRD.GNFS.ZS', // Trade (% of GDP)
            'NE.EXP.GNFS.ZS', // Exports of goods and services (% of GDP)
            'NE.IMP.GNFS.ZS', // Imports of goods and services (% of GDP)
            'FP.CPI.TOTL.ZG', // Inflation, consumer prices (annual %)
        ];

        const defaultCountries = ['BRA', 'CHN', 'IND', 'RUS', 'ZAF', 'USA', 'WLD'];
        
        const indicatorList = indicators || defaultIndicators;
        const countryList = countries || defaultCountries;
        const yearStart = startYear || 2018;
        const yearEnd = endYear || 2023;

        const facts = [];

        for (const indicator of indicatorList) {
            for (const country of countryList) {
                try {
                    // World Bank API v2 format
                    const url = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?date=${yearStart}:${yearEnd}&format=json&per_page=1000`;
                    
                    const response = await fetch(url);
                    
                    if (!response.ok) {
                        console.error(`Failed to fetch ${indicator} for ${country}: ${response.status}`);
                        continue;
                    }

                    const data = await response.json();
                    
                    // World Bank returns array with metadata in [0] and data in [1]
                    if (!data || !Array.isArray(data) || data.length < 2) {
                        continue;
                    }

                    const records = data[1];
                    
                    if (!records || records.length === 0) {
                        continue;
                    }

                    for (const record of records) {
                        if (record.value === null || record.value === undefined) {
                            continue;
                        }

                        const fact = {
                            category: 'economic_indicator',
                            indicator_name: record.indicator.value,
                            value: record.value.toString(),
                            numeric_value: record.value,
                            unit: record.unit || 'N/A',
                            year: parseInt(record.date),
                            country: record.country.value,
                            region: record.countryiso3code,
                            source: 'world_bank',
                            source_url: `https://data.worldbank.org/indicator/${indicator}?locations=${country}`,
                            description: `${record.indicator.value} for ${record.country.value} in ${record.date}`,
                            verified: false,
                            tags: ['world-bank', 'auto-imported', country.toLowerCase(), indicator],
                            confidence_score: 95,
                            last_updated: new Date().toISOString()
                        };

                        facts.push(fact);
                    }
                } catch (error) {
                    console.error(`Error processing ${indicator} for ${country}:`, error.message);
                }
            }
        }

        // Bulk insert facts
        if (facts.length > 0) {
            const existing = await base44.asServiceRole.entities.CorporateFact.filter({
                source: 'world_bank'
            });

            // Remove duplicates by checking indicator + country + year
            const existingKeys = new Set(
                existing.map(e => `${e.indicator_name}_${e.country}_${e.year}`)
            );

            const newFacts = facts.filter(f => 
                !existingKeys.has(`${f.indicator_name}_${f.country}_${f.year}`)
            );

            if (newFacts.length > 0) {
                await base44.asServiceRole.entities.CorporateFact.bulkCreate(newFacts);
            }

            return Response.json({
                success: true,
                total_fetched: facts.length,
                new_records: newFacts.length,
                skipped_duplicates: facts.length - newFacts.length,
                message: `Imported ${newFacts.length} new facts from World Bank`
            });
        }

        return Response.json({
            success: false,
            message: 'No data found for the specified parameters'
        });

    } catch (error) {
        console.error('Error in fetchWorldBankData:', error);
        return Response.json({ 
            error: error.message,
            details: error.stack 
        }, { status: 500 });
    }
});