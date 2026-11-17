import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSignals } from "@/lib/signals";
export async function GET(req: Request) {
 const url=new URL(req.url), market=url.searchParams.get("market"), q=url.searchParams.get("q")?.trim();
 const rows=await db.transaction.findMany({where:{
  ...(market==="US"||market==="AUS"?{market}:{}),
  ...(q?{OR:[{ticker:{contains:q,mode:"insensitive"}},{companyName:{contains:q,mode:"insensitive"}},{insiderName:{contains:q,mode:"insensitive"}}]}:{})
 },orderBy:{transactionDate:"desc"},take:250});
 const signals=await getSignals();
 return NextResponse.json({rows,signals:{repeatBuyers:signals.repeatBuyers.map(x=>x.id),clusters:signals.clusters,large:signals.large.map(x=>x.id)}});
}
