import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Service role for admin operations
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { indicators = [], countries = ['BRA', 'CHN', 'IND', 'RUS', 'ZAF'], force_update = false } = await req.json();

        const syncLog = {
            started_at: new Date().toISOString(),
            indicators_processed: 0,
            facts_created: 0,
            facts_updated: 0,
            facts_skipped: 0,
            errors: []
        };

        // Default indicators if none provided
        const defaultIndicators = [
            'NY.GDP.MKTP.CD',        // GDP (current US$)
            'NY.GDP.PCAP.CD',        // GDP per capita
            'SP.POP.TOTL',           // Population, total
            'NE.EXP.GNFS.ZS',        // Exports of goods and services (% of GDP)
            'NE.IMP.GNFS.ZS',        // Imports of goods and services (% of GDP)
            'FP.CPI.TOTL.ZG',        // Inflation, consumer prices (annual %)
            'SL.UEM.TOTL.ZS',        // Unemployment, total (% of total labor force)
            'BX.KLT.DINV.WD.GD.ZS',  // Foreign direct investment, net inflows (% of GDP)
            'GC.DOD.TOTL.GD.ZS',     // Central government debt, total (% of GDP)
            'BN.CAB.XOKA.GD.ZS'      // Current account balance (% of GDP)
        ];

        const indicatorsToSync = indicators.length > 0 ? indicators : defaultIndicators;

        for (const indicator of indicatorsToSync) {
            syncLog.indicators_processed++;

            for (const country of countries) {
                try {
                    // Fetch latest data from World Bank
                    const wbUrl = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&per_page=5&date=2018:2023`;
                    const response = await fetch(wbUrl);

                    if (!response.ok) {
                        syncLog.errors.push(`Failed to fetch ${indicator} for ${country}`);
                        continue;
                    }

                    const data = await response.json();

                    if (!data[1] || data[1].length === 0) {
                        syncLog.facts_skipped++;
                        continue;
                    }

                    // Get indicator metadata
                    const metaUrl = `https://api.worldbank.org/v2/indicator/${indicator}?format=json`;
                    const metaResponse = await fetch(metaUrl);
                    let indicatorName = indicator;
                    let sourceNote = '';

                    if (metaResponse.ok) {
                        const metaData = await metaResponse.json();
                        if (metaData[1] && metaData[1][0]) {
                            indicatorName = metaData[1][0].name;
                            sourceNote = metaData[1][0].sourceNote || '';
                        }
                    }

                    // Process each year's data
                    for (const record of data[1]) {
                        if (record.value === null) continue;

                        const year = parseInt(record.date);
                        
                        // Check if fact already exists
                        const existing = await base44.asServiceRole.entities.CorporateFact.filter({
                            indicator_name: indicatorName,
                            country: record.country.value,
                            year: year,
                            source: 'world_bank'
                        });

                        const factData = {
                            category: 'economic_indicator',
                            indicator_name: indicatorName,
                            value: record.value.toString(),
                            numeric_value: record.value,
                            unit: record.unit || '',
                            year: year,
                            country: record.country.value,
                            region: getRegion(country),
                            source: 'world_bank',
                            source_url: `https://data.worldbank.org/indicator/${indicator}?locations=${country}`,
                            description: sourceNote,
                            verified: false,
                            tags: ['auto-sync', indicator, country],
                            confidence_score: 100,
                            last_updated: new Date().toISOString()
                        };

                        if (existing.length > 0) {
                            // Update if value changed or force_update is true
                            const existingFact = existing[0];
                            if (force_update || existingFact.numeric_value !== record.value) {
                                await base44.asServiceRole.entities.CorporateFact.update(
                                    existingFact.id,
                                    factData
                                );
                                syncLog.facts_updated++;
                            } else {
                                syncLog.facts_skipped++;
                            }
                        } else {
                            // Create new fact
                            await base44.asServiceRole.entities.CorporateFact.create(factData);
                            syncLog.facts_created++;
                        }
                    }

                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 100));

                } catch (error) {
                    syncLog.errors.push(`Error processing ${indicator} for ${country}: ${error.message}`);
                }
            }
        }

        syncLog.completed_at = new Date().toISOString();

        // Log sync operation
        await base44.asServiceRole.entities.CorporateFact.create({
            category: 'institutional_fact',
            indicator_name: 'World Bank Sync Log',
            value: JSON.stringify(syncLog),
            source: 'world_bank',
            description: `Sync completed: ${syncLog.facts_created} created, ${syncLog.facts_updated} updated`,
            verified: true,
            tags: ['sync-log'],
            year: new Date().getFullYear()
        });

        return Response.json({
            success: true,
            sync_log: syncLog
        });

    } catch (error) {
        console.error('Error syncing World Bank data:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});

function getRegion(countryCode) {
    const regions = {
        'BRA': 'Latin America & Caribbean',
        'CHN': 'East Asia & Pacific',
        'IND': 'South Asia',
        'RUS': 'Europe & Central Asia',
        'ZAF': 'Sub-Saharan Africa',
        'USA': 'North America',
        'GBR': 'Europe & Central Asia',
        'JPN': 'East Asia & Pacific',
        'DEU': 'Europe & Central Asia',
        'FRA': 'Europe & Central Asia'
    };
    return regions[countryCode] || 'Unknown';
}