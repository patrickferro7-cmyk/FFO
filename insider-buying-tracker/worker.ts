/**
 * Ingestion worker contract.
 * Implement provider-specific collectors here, then POST normalized transactions
 * to /api/ingest. Never scrape around provider terms or bypass access controls.
 */
const endpoint=process.env.APP_URL+"/api/ingest";
if(!process.env.APP_URL || !process.env.INGESTION_TOKEN) throw new Error("Set APP_URL and INGESTION_TOKEN");
async function send(records:unknown[]){
 const r=await fetch(endpoint,{method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${process.env.INGESTION_TOKEN}`},body:JSON.stringify(records)});
 if(!r.ok) throw new Error(`Ingest failed: ${r.status} ${await r.text()}`);
 console.log(await r.json());
}
console.log("Worker scaffold ready. Add SEC Form 4 and ASX announcement adapters, normalize records, then call send(records).");
