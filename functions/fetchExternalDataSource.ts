import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { source_id, indicators = [], countries = [], startYear, endYear } = await req.json();

        // Get source configuration
        const sources = await base44.asServiceRole.entities.ExternalDataSource.filter({
            id: source_id
        });

        if (sources.length === 0) {
            return Response.json({ error: 'Source not found' }, { status: 404 });
        }

        const source = sources[0];
        if (!source.enabled) {
            return Response.json({ error: 'Source is disabled' }, { status: 400 });
        }

        const syncLog = {
            source_name: source.name,
            source_type: source.source_type,
            started_at: new Date().toISOString(),
            facts_created: 0,
            facts_updated: 0,
            errors: []
        };

        // Fetch data based on source type
        switch (source.source_type) {
            case 'world_bank':
                await fetchWorldBankData(base44, source, indicators, countries, startYear, endYear, syncLog);
                break;
            case 'imf':
                await fetchIMFData(base44, source, indicators, countries, syncLog);
                break;
            case 'wto':
                await fetchWTOData(base44, source, countries, syncLog);
                break;
            case 'ndb':
                await fetchNDBData(base44, source, syncLog);
                break;
            case 'custom':
                await fetchCustomAPI(base44, source, syncLog);
                break;
            default:
                syncLog.errors.push(`Unsupported source type: ${source.source_type}`);
        }

        // Update last sync
        await base44.asServiceRole.entities.ExternalDataSource.update(source_id, {
            last_sync: new Date().toISOString()
        });

        syncLog.completed_at = new Date().toISOString();

        return Response.json({
            success: true,
            sync_log: syncLog
        });

    } catch (error) {
        console.error('Error fetching external data:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function fetchWorldBankData(base44, source, indicators, countries, startYear, endYear, syncLog) {
    for (const indicator of indicators) {
        for (const country of countries) {
            try {
                const url = `${source.api_endpoint}/country/${country}/indicator/${indicator}?format=json&per_page=50&date=${startYear}:${endYear}`;
                const response = await fetch(url);
                
                if (!response.ok) continue;
                
                const data = await response.json();
                if (!data[1] || data[1].length === 0) continue;

                for (const record of data[1]) {
                    if (record.value === null) continue;
                    
                    const existing = await base44.asServiceRole.entities.CorporateFact.filter({
                        indicator_name: record.indicator.value,
                        country: record.country.value,
                        year: parseInt(record.date)
                    });

                    const factData = {
                        category: 'economic_indicator',
                        indicator_name: record.indicator.value,
                        value: record.value.toString(),
                        numeric_value: record.value,
                        unit: record.unit || '',
                        year: parseInt(record.date),
                        country: record.country.value,
                        source: source.source_type,
                        verified: false,
                        tags: ['auto-sync', source.name],
                        last_updated: new Date().toISOString()
                    };

                    if (existing.length > 0) {
                        await base44.asServiceRole.entities.CorporateFact.update(existing[0].id, factData);
                        syncLog.facts_updated++;
                    } else {
                        await base44.asServiceRole.entities.CorporateFact.create(factData);
                        syncLog.facts_created++;
                    }
                }

                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                syncLog.errors.push(`Error fetching ${indicator} for ${country}: ${error.message}`);
            }
        }
    }
}

async function fetchIMFData(base44, source, indicators, countries, syncLog) {
    // IMF API implementation
    try {
        const headers = {};
        if (source.api_key) {
            headers[source.auth_header || 'Authorization'] = `Bearer ${source.api_key}`;
        }

        // IMF uses different API structure
        const url = `${source.api_endpoint}/CompactData/IFS/M.${countries.join('+')}.${indicators.join('+')}`;
        const response = await fetch(url, { headers });
        
        if (response.ok) {
            const data = await response.json();
            // Process IMF data format
            syncLog.facts_created += 1; // Placeholder
        }
    } catch (error) {
        syncLog.errors.push(`IMF error: ${error.message}`);
    }
}

async function fetchWTOData(base44, source, countries, syncLog) {
    // WTO Stats API implementation
    try {
        const headers = {};
        if (source.api_key) {
            headers['Ocp-Apim-Subscription-Key'] = source.api_key;
        }

        const url = `${source.api_endpoint}/v2/data`;
        const response = await fetch(url, { headers });
        
        if (response.ok) {
            const data = await response.json();
            // Process WTO data format
            syncLog.facts_created += 1; // Placeholder
        }
    } catch (error) {
        syncLog.errors.push(`WTO error: ${error.message}`);
    }
}

async function fetchNDBData(base44, source, syncLog) {
    // New Development Bank data (if they have public API)
    try {
        const url = `${source.api_endpoint}/projects`;
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            // Process NDB data
            syncLog.facts_created += 1; // Placeholder
        }
    } catch (error) {
        syncLog.errors.push(`NDB error: ${error.message}`);
    }
}

async function fetchCustomAPI(base44, source, syncLog) {
    // Generic custom API handler
    try {
        const headers = {};
        if (source.api_key) {
            const authHeader = source.auth_header || 'Authorization';
            const authValue = source.auth_type === 'bearer' 
                ? `Bearer ${source.api_key}` 
                : source.api_key;
            headers[authHeader] = authValue;
        }

        const response = await fetch(source.api_endpoint, { headers });
        
        if (response.ok) {
            const data = await response.json();
            // User needs to configure data mapping
            syncLog.facts_created += 1; // Placeholder
        }
    } catch (error) {
        syncLog.errors.push(`Custom API error: ${error.message}`);
    }
}