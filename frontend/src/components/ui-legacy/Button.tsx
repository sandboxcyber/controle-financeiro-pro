import type { ButtonHTMLAttributes, ReactNode } from "react";
type Variant = "primary" | "success" | "warning" | "danger" | "secondary";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: Variant };
const bg: Record<Variant,string> = { primary:"#2563eb", success:"#16a34a", warning:"#f59e0b", danger:"#dc2626", secondary:"#334155" };
export default function Button({ children, variant="primary", style, ...props }: Props) {
  return <button {...props} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,minHeight:42,padding:"0 16px",border:0,borderRadius:12,background:props.disabled?"#475569":bg[variant],color:"white",fontWeight:700,cursor:props.disabled?"not-allowed":"pointer",...style}}>{children}</button>;
}
