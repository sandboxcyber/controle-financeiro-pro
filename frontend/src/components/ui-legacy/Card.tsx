import type { CSSProperties, ReactNode } from "react";
export default function Card({children,style}:{children:ReactNode;style?:CSSProperties}){return <section style={{padding:20,border:"1px solid #1f2937",borderRadius:18,background:"#111827",...style}}>{children}</section>}
