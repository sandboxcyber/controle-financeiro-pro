import type { SelectHTMLAttributes } from "react";
export default function Select(props:SelectHTMLAttributes<HTMLSelectElement>){return <select {...props} style={{width:"100%",minHeight:44,padding:"0 14px",border:"1px solid #334155",borderRadius:12,outline:0,background:"#0f172a",color:"#f8fafc",...props.style}}/>}
