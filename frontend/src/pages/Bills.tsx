import {useEffect,useState} from "react";
import {billService} from "../services/bills";

export default function Bills(){

const [dados,setDados]=useState<any[]>([]);
const [resumo,setResumo]=useState<any>();

async function carregar(){
const a=await billService.listar();
const b=await billService.resumo();
setDados(a.data);
setResumo(b.data);
}

useEffect(()=>{
carregar();
},[]);

const dinheiro=(v:number)=>
new Intl.NumberFormat("pt-BR",{
style:"currency",
currency:"BRL"
}).format(v);

return(
<div className="space-y-6">

<h1 className="text-4xl font-black text-white">
Contas a pagar
</h1>

{resumo&&(

<div className="grid gap-4 md:grid-cols-4">

<div className="rounded-2xl bg-slate-900 p-5">
<div className="text-slate-500">Atrasadas</div>
<div className="text-red-400 text-2xl font-black">
{dinheiro(resumo.total_atrasado)}
</div>
</div>

<div className="rounded-2xl bg-slate-900 p-5">
<div className="text-slate-500">Vencem hoje</div>
<div className="text-yellow-400 text-2xl font-black">
{resumo.vencendo_hoje}
</div>
</div>

<div className="rounded-2xl bg-slate-900 p-5">
<div className="text-slate-500">Pendentes</div>
<div className="text-blue-400 text-2xl font-black">
{dinheiro(resumo.total_pendente)}
</div>
</div>

<div className="rounded-2xl bg-slate-900 p-5">
<div className="text-slate-500">Total</div>
<div className="text-green-400 text-2xl font-black">
{resumo.total_contas}
</div>
</div>

</div>

)}

<div className="rounded-3xl overflow-hidden border border-slate-800">

<table className="w-full">

<thead className="bg-slate-900">

<tr>

<th className="p-4 text-left">
Conta
</th>

<th>
Categoria
</th>

<th>
Vencimento
</th>

<th>
Valor
</th>

<th>
Status
</th>

</tr>

</thead>

<tbody>

{dados.map((c:any)=>(

<tr key={c.id}
className="border-t border-slate-800">

<td className="p-4">
{c.description}
</td>

<td>
{c.category}
</td>

<td>
{new Date(c.due_date).toLocaleDateString("pt-BR")}
</td>

<td>
{dinheiro(c.updated_amount)}
</td>

<td>

<span className={
c.status==="Paga"
?"text-green-400":
c.status==="Atrasada"
?"text-red-400":
c.status==="Vence hoje"
?"text-yellow-400":
"text-blue-400"
}>

{c.status}

</span>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

);

}
