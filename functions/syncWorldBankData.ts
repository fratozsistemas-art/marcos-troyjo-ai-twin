import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { force_sync = false } = await req.json();

        // Check last sync timestamp
        const sources = await base44.asServiceRole.entities.ExternalDataSource.filter({
            source_type: 'world_bank'
        });

        let shouldSync = force_sync;

        if (!force_sync && sources.length > 0) {
            const lastSync = sources[0].last_sync;
            if (lastSync) {
                const hoursSinceSync = (Date.now() - new Date(lastSync).getTime()) / (1000 * 60 * 60);
                shouldSync = hoursSinceSync >= 72;
            } else {
                shouldSync = true;
            }
        } else {
            shouldSync = true;
        }

        if (!shouldSync) {
            const lastSync = sources[0].last_sync;
            const nextSync = new Date(new Date(lastSync).getTime() + 72 * 60 * 60 * 1000);
            return Response.json({
                success: true,
                message: 'Dados já atualizados',
                new_records: 0,
                updated_records: 0,
                next_sync: nextSync.toISOString()
            });
        }

        // Fetch World Bank data
        const indicators = [
            'NY.GDP.MKTP.CD',
            'NY.GDP.PCAP.CD',
            'NE.TRD.GNFS.ZS',
            'NE.EXP.GNFS.ZS',
            'NE.IMP.GNFS.ZS',
            'FP.CPI.TOTL.ZG',
            'NE.GDI.TOTL.ZS',
            'NY.GDP.MKTP.KD.ZG'
        ];

        const countries = ['BRA', 'CHN', 'IND', 'RUS', 'ZAF', 'USA', 'WLD'];
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 5;

        const facts = [];
        let newRecords = 0;
        let updatedRecords = 0;

        for (const indicator of indicators) {
            for (const country of countries) {
                try {
                    const url = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?date=${startYear}:${currentYear}&format=json&per_page=1000`;
                    
                    const response = await fetch(url);
                    
                    if (!response.ok) {
                        continue;
                    }

                    const data = await response.json();
                    
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
                            tags: ['world-bank', 'auto-sync', country.toLowerCase(), indicator],
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

        // Check for existing facts and update or create
        const existing = await base44.asServiceRole.entities.CorporateFact.filter({
            source: 'world_bank'
        });

        const existingMap = new Map();
        existing.forEach(e => {
            const key = `${e.indicator_name}_${e.country}_${e.year}`;
            existingMap.set(key, e);
        });

        for (const fact of facts) {
            const key = `${fact.indicator_name}_${fact.country}_${fact.year}`;
            const existingFact = existingMap.get(key);

            if (existingFact) {
                // Update if value changed
                if (existingFact.numeric_value !== fact.numeric_value) {
                    await base44.asServiceRole.entities.CorporateFact.update(existingFact.id, fact);
                    updatedRecords++;
                }
            } else {
                // Create new
                await base44.asServiceRole.entities.CorporateFact.create(fact);
                newRecords++;
            }
        }

        // Update sync timestamp
        if (sources.length > 0) {
            await base44.asServiceRole.entities.ExternalDataSource.update(sources[0].id, {
                last_sync: new Date().toISOString()
            });
        } else {
            await base44.asServiceRole.entities.ExternalDataSource.create({
                name: 'World Bank Data',
                source_type: 'world_bank',
                api_endpoint: 'https://api.worldbank.org/v2',
                enabled: true,
                sync_frequency: 'manual',
                last_sync: new Date().toISOString()
            });
        }

        return Response.json({
            success: true,
            new_records: newRecords,
            updated_records: updatedRecords,
            total_processed: facts.length,
            message: `Sincronização completa: ${newRecords} novos, ${updatedRecords} atualizados`
        });

    } catch (error) {
        console.error('Error in syncWorldBankData:', error);
        return Response.json({ 
            error: error.message,
            details: error.stack 
        }, { status: 500 });
    }
});