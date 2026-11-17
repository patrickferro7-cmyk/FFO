import { PrismaClient } from "@prisma/client";
const db=new PrismaClient();
async function main(){
 await db.transaction.upsert({where:{sourceId:"demo-us-001"},update:{},create:{
 source:"DEMO",sourceId:"demo-us-001",market:"US",ticker:"SAMPLE",companyName:"Example Systems",insiderName:"Alex Example",insiderRole:"Director",isFounder:true,transactionDate:new Date("2026-11-16"),shares:10000,price:25,value:250000,currency:"USD",kind:"OPEN_MARKET_PURCHASE",sourceUrl:"https://www.sec.gov/edgar/search/" }});
}
main().finally(()=>db.$disconnect());
