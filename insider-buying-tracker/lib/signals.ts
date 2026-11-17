import { db } from "./db";
export async function getSignals() {
 const rows = await db.transaction.findMany({where:{kind:{in:["OPEN_MARKET_PURCHASE","OTHER_PURCHASE"]}},orderBy:{transactionDate:"desc"},take:500});
 const grouped = new Map<string, typeof rows>();
 for (const row of rows) grouped.set(row.ticker,[...(grouped.get(row.ticker)??[]),row]);
 const repeatBuyers = rows.filter(r => rows.filter(x=>x.ticker===r.ticker && x.insiderName===r.insiderName).length>=2);
 const clusters = [...grouped.entries()].filter(([,v])=>new Set(v.map(x=>x.insiderName)).size>=2).map(([ticker,v])=>({ticker,company:v[0].companyName,buyers:[...new Set(v.map(x=>x.insiderName))],count:new Set(v.map(x=>x.insiderName)).size}));
 const large = rows.filter(r=>r.value && Number(r.value)>=500000);
 return {rows,repeatBuyers,clusters,large};
}
