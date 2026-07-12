import type { ReactNode } from "react";
type Tone="success"|"warning"|"danger"|"neutral"|"info";
const s:Record<Tone,{color:string;background:string}>={success:{color:"#86efac",background:"rgba(34,197,94,.14)"},warning:{color:"#fcd34d",background:"rgba(245,158,11,.14)"},danger:{color:"#fca5a5",background:"rgba(239,68,68,.14)"},neutral:{color:"#cbd5e1",background:"rgba(100,116,139,.18)"},info:{color:"#93c5fd",background:"rgba(37,99,235,.16)"}};
export default function Badge({children,tone="neutral"}:{children:ReactNode;tone?:Tone}){return <span style={{display:"inline-flex",alignItems:"center",minHeight:28,padding:"0 10px",borderRadius:999,color:s[tone].color,background:s[tone].background,fontSize:12,fontWeight:700}}>{children}</span>}
