import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
const item=z.object({
 source:z.string(),sourceId:z.string(),market:z.enum(["US","AUS"]),ticker:z.string(),companyName:z.string(),
 insiderName:z.string(),insiderRole:z.string().optional(),isFounder:z.boolean().optional(),
 transactionDate:z.string().optional(),disclosedAt:z.string().optional(),shares:z.number().optional(),
 price:z.number().optional(),value:z.number().optional(),currency:z.string(),kind:z.enum(["OPEN_MARKET_PURCHASE","OTHER_PURCHASE","OPTION_EXERCISE","GRANT","AWARD","SALE","UNKNOWN"]),
 description:z.string().optional(),sourceUrl:z.string().url()
});
export async function POST(req:Request){
 if(!process.env.INGESTION_TOKEN || req.headers.get("authorization")!==`Bearer ${process.env.INGESTION_TOKEN}`) return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=z.array(item).max(1000).safeParse(await req.json());
 if(!body.success)return NextResponse.json({error:body.error.flatten()},{status:400});
 let count=0;
 for(const x of body.data){const d=x;
  await db.transaction.upsert({where:{sourceId:d.sourceId},create:{...d,transactionDate:d.transactionDate?new Date(d.transactionDate):null,disclosedAt:d.disclosedAt?new Date(d.disclosedAt):null},update:{...d,transactionDate:d.transactionDate?new Date(d.transactionDate):null,disclosedAt:d.disclosedAt?new Date(d.disclosedAt):null}});
  count++;
 }
 return NextResponse.json({upserted:count});
}
