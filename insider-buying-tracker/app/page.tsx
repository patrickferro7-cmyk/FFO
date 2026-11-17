import { db } from "@/lib/db";
import { getSignals } from "@/lib/signals";
export const dynamic="force-dynamic";
const fmt=(v:any,c:string)=>v==null?"—":new Intl.NumberFormat("en-US",{style:"currency",currency:c,maximumFractionDigits:0}).format(Number(v));
export default async function Home(){
 const [data,watch]=await Promise.all([getSignals(),db.watchlist.findMany()]);
 const rows=data.rows;
 const total=rows.length, us=rows.filter(x=>x.market==="US").length, aus=total-us;
 return <main className="wrap">
  <header><div><div className="eyebrow">MARKET INTELLIGENCE · US + ASX</div><h1>Insider Buying Tracker</h1><p>Track disclosed purchases by directors, founders and other company insiders.</p></div><span className="live">DATABASE CONNECTED</span></header>
  <section className="metrics"><Metric label="Purchases loaded" value={total}/><Metric label="US filings" value={us}/><Metric label="ASX disclosures" value={aus}/><Metric label="Watchlist" value={watch.length}/></section>
  <section className="signals"><article><h2>Large purchases</h2><p className="hint">Purchases of at least US$500k or A$500k, using reported transaction currency.</p>{data.large.length?data.large.slice(0,6).map(x=><Signal key={x.id} title={`${x.insiderName} · ${x.ticker}`} detail={`${fmt(x.value,x.currency)} · ${x.transactionDate?.toLocaleDateString("en-AU")??"Date not supplied"}`}/>):<p className="empty">No qualifying records loaded yet.</p>}</article>
  <article><h2>Repeat buyers</h2><p className="hint">Same insider with multiple purchase records for one ticker.</p>{data.repeatBuyers.length?data.repeatBuyers.slice(0,6).map(x=><Signal key={x.id} title={`${x.insiderName} · ${x.ticker}`} detail={x.companyName}/>):<p className="empty">No repeat-buyer signals yet.</p>}</article>
  <article><h2>Multiple insiders buying</h2><p className="hint">Two or more distinct insiders recorded purchases in the same company.</p>{data.clusters.length?data.clusters.slice(0,6).map(x=><Signal key={x.ticker} title={`${x.company} · ${x.ticker}`} detail={`${x.count} insiders: ${x.buyers.join(", ")}`}/>):<p className="empty">No buying clusters yet.</p>}</article></section>
  <section className="panel"><div className="sectionhead"><div><h2>Latest disclosed transactions</h2><p className="hint">Any purchase size · all insider categories</p></div><a href="/api/transactions" className="export">View API data ↗</a></div>
  <div className="tablewrap"><table><thead><tr><th>Company</th><th>Insider</th><th>Market</th><th>Type</th><th>Date</th><th>Value</th><th>Source</th></tr></thead><tbody>{rows.slice(0,100).map(x=><tr key={x.id}><td><b>{x.companyName}</b><small>{x.ticker}</small></td><td>{x.insiderName}<small>{x.insiderRole??"Insider"}{x.isFounder?" · Founder":""}</small></td><td>{x.market}</td><td><span className="kind">{x.kind.replaceAll("_"," ")}</span></td><td>{x.transactionDate?.toLocaleDateString("en-AU")??"—"}</td><td>{fmt(x.value,x.currency)}</td><td><a href={x.sourceUrl} target="_blank" rel="noreferrer">Original filing ↗</a></td></tr>)}</tbody></table></div>
  {!rows.length&&<p className="empty">Your database is ready but no filing data has been ingested. Connect the SEC and ASX ingestion jobs to populate this dashboard.</p>}</section>
  <footer>Dashboard only · Data is based on public disclosures and may be delayed or incomplete. Not investment advice.</footer>
 </main>
}
function Metric({label,value}:{label:string,value:number}){return <div className="metric"><span>{label}</span><strong>{value.toLocaleString()}</strong></div>}
function Signal({title,detail}:{title:string,detail:string}){return <div className="signal"><b>{title}</b><span>{detail}</span></div>}
