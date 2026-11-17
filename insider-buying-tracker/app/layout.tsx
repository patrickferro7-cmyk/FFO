import type { Metadata } from "next"; import "./style.css";
export const metadata:Metadata={title:"Insider Buying Tracker",description:"US and ASX insider purchase disclosure dashboard"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
