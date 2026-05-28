import { useState, useContext, createContext, useMemo, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line } from "recharts";

const A1="#10b981",A2="#0ea5e9",A3="#f43f5e",A4="#8b5cf6",A5="#f59e0b",A6="#ec4899";

const LIGHT=(a="#10b981")=>({bg:"#f0f4ff",card:"#ffffff",sidebar:"#ffffff",nav:"rgba(255,255,255,0.97)",border:"rgba(0,0,0,0.07)",text:"#111827",sub:"#4b5563",muted:"#9ca3af",track:"rgba(0,0,0,0.08)",inputBg:"#eef2f8",tag:"rgba(0,0,0,0.03)",tip:"#ffffff",tipBorder:"rgba(0,0,0,0.1)",toggleBg:"rgba(0,0,0,0.05)",ok:"rgba(16,185,129,0.08)",okB:"rgba(16,185,129,0.2)",warn:"rgba(244,63,94,0.06)",warnB:"rgba(244,63,94,0.2)",navActive:a+"14",words:"#059669",a});
const DARK=(a="#10b981")=>({bg:"#070b14",card:"rgba(255,255,255,0.04)",sidebar:"#0d1117",nav:"rgba(7,11,20,0.97)",border:"rgba(255,255,255,0.07)",text:"#f1f5f9",sub:"#8892a4",muted:"#3d4460",track:"rgba(255,255,255,0.08)",inputBg:"rgba(255,255,255,0.07)",tag:"rgba(255,255,255,0.04)",tip:"#111829",tipBorder:"rgba(255,255,255,0.12)",toggleBg:"rgba(255,255,255,0.05)",ok:"rgba(16,185,129,0.08)",okB:"rgba(16,185,129,0.25)",warn:"rgba(244,63,94,0.08)",warnB:"rgba(244,63,94,0.25)",navActive:a+"18",words:"#34d399",a});

const sipFV=(p,r,m)=>{const mr=r/100/12;return mr?p*((Math.pow(1+mr,m)-1)/mr)*(1+mr):p*m;};
const lsFV=(p,r,y)=>p*Math.pow(1+r/100,y);
const emiC=(p,r,m)=>{const mr=r/100/12;return mr?p*mr*Math.pow(1+mr,m)/(Math.pow(1+mr,m)-1):p/m;};
const sipReq=(t,r,m)=>{const mr=r/100/12;return mr?t*mr/((Math.pow(1+mr,m)-1)*(1+mr)):t/m;};
const cagrC=(pv,fv,y)=>(Math.pow(fv/pv,1/y)-1)*100;
const realR=(n,i)=>((1+n/100)/(1+i/100)-1)*100;
const clamp2=v=>Math.round(v*100)/100;

const fmt=n=>{const a=Math.abs(Math.round(n||0));if(a>=10000000)return"₹"+(n/10000000).toFixed(2)+"Cr";if(a>=100000)return"₹"+(n/100000).toFixed(2)+"L";if(a>=1000)return"₹"+(n/1000).toFixed(1)+"K";return"₹"+Math.round(n||0);};
const fmtS=n=>{const a=Math.abs(n||0);if(a>=10000000)return(n/10000000).toFixed(1)+"Cr";if(a>=100000)return(n/100000).toFixed(1)+"L";if(a>=1000)return(n/1000).toFixed(0)+"K";return Math.round(n||0);};

const ON=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
const TN=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
const b100=n=>n<20?ON[n]:TN[Math.floor(n/10)]+(n%10?" "+ON[n%10]:"");
const b1k=n=>n<100?b100(n):ON[Math.floor(n/100)]+" Hundred"+(n%100?" "+b100(n%100):"");
const toW=num=>{num=Math.round(Math.abs(num||0));if(!num)return"";const p=[];const cr=Math.floor(num/10000000);num%=10000000;const lk=Math.floor(num/100000);num%=100000;const th=Math.floor(num/1000);num%=1000;if(cr)p.push(b1k(cr)+" Crore");if(lk)p.push(b1k(lk)+" Lakh");if(th)p.push(b1k(th)+" Thousand");if(num)p.push(b1k(num));return"₹ "+p.join(" ");};

const DB={
  users:{
    "pro@finpulse.app":{name:"Pro Demo",password:"demo1234",plan:"pro",avatar:"P",joined:"Jan 2025",prefs:{dark:false}},
    "free@finpulse.app":{name:"Free Demo",password:"demo1234",plan:"free",avatar:"F",joined:"May 2025",prefs:{dark:false}},
  },
  plans:{},notes:{},
};
function useStorage(uid){
  if(!uid)return{getPlans:()=>[],savePlan:()=>{},delPlan:()=>{},dupPlan:()=>{},getPrefs:()=>({dark:false}),savePrefs:()=>{}};
  return{
    getPlans:()=>DB.plans[uid]||[],
    savePlan:p=>{if(!DB.plans[uid])DB.plans[uid]=[];const i=DB.plans[uid].findIndex(x=>x.id===p.id);if(i>=0)DB.plans[uid][i]=p;else DB.plans[uid].unshift(p);},
    delPlan:id=>{DB.plans[uid]=(DB.plans[uid]||[]).filter(p=>p.id!==id);},
    dupPlan:id=>{const s=(DB.plans[uid]||[]).find(p=>p.id===id);if(s){const c={...s,id:Date.now(),name:s.name+" (Copy)"};if(!DB.plans[uid])DB.plans[uid]=[];DB.plans[uid].unshift(c);}},
    getPrefs:()=>DB.users[uid]?.prefs||{dark:false},
    savePrefs:p=>{if(DB.users[uid])DB.users[uid].prefs=p;},
  };
}

const Ctx=createContext();

function Tip({text,children,pos="top"}){
  const[show,setShow]=useState(false);
  const P={top:{bottom:"calc(100% + 6px)",left:"50%",transform:"translateX(-50%)"},right:{left:"calc(100% + 8px)",top:"50%",transform:"translateY(-50%)"}};
  return(
    <div style={{position:"relative",display:"inline-flex"}} onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      {children}
      {show&&text&&<div style={{position:"absolute",...P[pos],background:"#1a2035",color:"#e2e8f0",fontSize:11,padding:"5px 10px",borderRadius:6,whiteSpace:"nowrap",zIndex:9999,boxShadow:"0 4px 12px rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.1)",pointerEvents:"none",fontWeight:500,maxWidth:220,textAlign:"center",lineHeight:1.4}}>{text}</div>}
    </div>
  );
}

function Words({n,color}){const{th}=useContext(Ctx);if(!n||n<=0)return null;return <div style={{fontSize:10,color:color||th.words,fontStyle:"italic",marginTop:2}}>{toW(n)}</div>;}

function KCard({label,value,raw,color,icon,sub,warn,tip}){
  const{th}=useContext(Ctx);
  const card=(
    <div style={{background:warn?th.warn:th.card,border:`1px solid ${warn?th.warnB:th.border}`,borderRadius:13,padding:"14px 13px",position:"relative",overflow:"hidden",transition:"transform 0.18s,box-shadow 0.18s",cursor:tip?"help":"default"}}
      onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.1)";}}
      onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
      <div style={{position:"absolute",top:-4,right:-2,fontSize:32,opacity:0.07}}>{icon}</div>
      <div style={{fontSize:9,color:th.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>{label}</div>
      <div style={{fontWeight:800,fontSize:17,color,lineHeight:1.2}}>{value}</div>
      {raw>0&&<Words n={raw}/>}
      {sub&&<div style={{fontSize:10,color:th.muted,marginTop:2}}>{sub}</div>}
    </div>
  );
  return tip?<Tip text={tip}>{card}</Tip>:card;
}

function KGrid({cols=4,children}){return <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:10}}>{children}</div>;}

function InfoBox({children,color}){
  const{th}=useContext(Ctx);const c=color||A1;
  return <div style={{padding:"12px 14px",background:`${c}0a`,border:`1px solid ${c}22`,borderRadius:10,fontSize:12,color:th.sub,lineHeight:1.8}}>{children}</div>;
}

function CTip({active,payload,label}){
  const{th}=useContext(Ctx);
  if(!active||!payload?.length)return null;
  return(
    <div style={{background:th.tip,border:`1px solid ${th.tipBorder}`,borderRadius:10,padding:"10px 14px"}}>
      <div style={{fontSize:10,color:th.muted,marginBottom:5}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{marginBottom:3}}>
          <div style={{fontSize:12,fontWeight:700,color:p.color}}>{p.name}: {fmt(p.value)}</div>
          <div style={{fontSize:9,color:th.words,fontStyle:"italic"}}>{toW(p.value)}</div>
        </div>
      ))}
    </div>
  );
}

function Slider({label,value,min,softMax,step,onChange,suffix="",isCurrency=false,accent,showWords=false,tip}){
  const{th}=useContext(Ctx);
  const[editing,setEditing]=useState(false);
  const[live,setLive]=useState("");
  const isRate=suffix==="%";
  const pct=Math.min(100,Math.max(0,((value-min)/(softMax-min))*100));
  const round=v=>isRate?clamp2(v):step<1?parseFloat(v.toFixed(2)):Math.round(v);
  const commit=s=>{const n=parseFloat(s.replace(/[^0-9.]/g,""));if(!isNaN(n)&&n>=min)onChange(round(n));setEditing(false);};
  const display=isRate?Number(value).toFixed(2)+"%":isCurrency?fmt(value):value+suffix;
  const[focused,setFocused]=useState(false);
  const inner=(
    <div style={{marginBottom:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        {label&&<span style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.07em",color:th.muted}}>{label}</span>}
        {editing
          ?<input autoFocus value={live} onChange={e=>setLive(e.target.value)}
              onBlur={e=>commit(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")commit(live);if(e.key==="Escape")setEditing(false);}}
              style={{width:120,textAlign:"right",fontSize:14,fontWeight:700,color:accent,background:th.inputBg,border:`1.5px solid ${accent}`,borderRadius:7,padding:"2px 7px",outline:"none"}}/>
          :<span onClick={()=>{setEditing(true);setLive(String(value));}}
              style={{fontSize:15,fontWeight:700,color:accent,cursor:"text",borderBottom:`1.5px dashed ${accent}55`,paddingBottom:1}}>
              {display}
            </span>
        }
      </div>
      {!editing&&showWords&&isCurrency&&value>0&&<div style={{textAlign:"right",marginBottom:4}}><Words n={value}/></div>}
      <div style={{position:"relative",height:20,display:"flex",alignItems:"center"}}>
        <div style={{position:"absolute",left:0,right:0,height:4,background:th.track,borderRadius:99}}/>
        <div style={{position:"absolute",left:0,width:pct+"%",height:4,background:accent,borderRadius:99,transition:"width 0.05s"}}/>
        <div style={{position:"absolute",left:pct+"%",transform:"translateX(-50%)",width:14,height:14,borderRadius:"50%",background:accent,border:`2px solid ${th.sidebar||th.bg}`,boxShadow:focused?`0 0 0 4px ${accent}55`:`0 0 0 3px ${accent}30`,pointerEvents:"none",transition:"box-shadow 0.15s"}}/>
        <input type="range" min={min} max={softMax} step={step} value={Math.min(value,softMax)}
          onChange={e=>onChange(round(Number(e.target.value)))}
          onFocus={()=>setFocused(true)}
          onBlur={()=>setFocused(false)}
          onKeyDown={e=>{
            if(e.key==="ArrowRight"||e.key==="ArrowUp"){e.preventDefault();onChange(round(Math.min(softMax,value+step)));}
            else if(e.key==="ArrowLeft"||e.key==="ArrowDown"){e.preventDefault();onChange(round(Math.max(min,value-step)));}
            else if(e.key==="PageUp"){e.preventDefault();onChange(round(Math.min(softMax,value+step*10)));}
            else if(e.key==="PageDown"){e.preventDefault();onChange(round(Math.max(min,value-step*10)));}
            else if(e.key==="Home"){e.preventDefault();onChange(round(min));}
            else if(e.key==="End"){e.preventDefault();onChange(round(softMax));}
          }}
          style={{position:"absolute",left:0,right:0,width:"100%",height:"100%",opacity:0,cursor:"pointer",zIndex:2,margin:0,padding:0}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:3,fontSize:10,color:th.muted}}>
        <span>{isCurrency?fmt(min):min+suffix}</span>
        <span style={{opacity:0.4}}>{focused?"← → keys":"click to type"}</span>
      </div>
    </div>
  );
  return tip?<Tip text={tip} pos="right">{inner}</Tip>:inner;
}

function InputPanel({width=300,children}){
  const{th}=useContext(Ctx);
  return <div style={{width,minWidth:width,borderRight:`1px solid ${th.border}`,background:th.sidebar,flexShrink:0,overflowY:"auto",padding:"16px 18px 24px"}}>{children}</div>;
}
function InputSection({title,icon,color,children,first=false}){
  const{th}=useContext(Ctx);
  return(
    <div style={{marginTop:first?0:22}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:14,paddingBottom:8,borderBottom:`2px solid ${color||A1}`}}>
        {icon&&<span style={{fontSize:15}}>{icon}</span>}
        <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:th.text}}>{title}</span>
      </div>
      {children}
    </div>
  );
}
function ResultPanel({children}){
  return <div style={{flex:1,minWidth:0,overflowY:"auto",padding:"20px 22px",display:"flex",flexDirection:"column",gap:14}}>{children}</div>;
}
function RCard({title,children}){
  const{th}=useContext(Ctx);
  return(
    <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:13,overflow:"hidden"}}>
      {title&&<div style={{padding:"10px 16px",borderBottom:`1px solid ${th.border}`,fontSize:12,fontWeight:700,color:th.text,background:th.tag}}>{title}</div>}
      <div style={{padding:"14px 16px"}}>{children}</div>
    </div>
  );
}
function SIPPage(){
  const{th}=useContext(Ctx);

  /* ─── top tab ─── */
  const[tab,setTab]=useState("sip");         // "sip" | "lump"

  /* ─── SIP state ─── */
  const[sipMode,setSipMode]=useState("normal"); // "normal"|"stepup"
  const[stepKind,setStepKind]=useState("pct"); // "pct"|"amt"
  const[sipAmt,setSipAmt]=useState(10000);
  const[sipRate,setSipRate]=useState(12);
  const[sipYrs,setSipYrs]=useState(15);
  const[stepPct,setStepPct]=useState(10);
  const[stepAmt,setStepAmt]=useState(1000);
  const[sipPf,setSipPf]=useState(0);

  /* ─── Lumpsum state ─── */
  const[lsAmt,setLsAmt]=useState(500000);
  const[lsRate,setLsRate]=useState(12);
  const[lsYrs,setLsYrs]=useState(15);
  const[lsPf,setLsPf]=useState(0);

  /* ════ SIP MATH ════ */
  const sipRes=useMemo(()=>{
    const months=sipYrs*12, mr=sipRate/100/12;
    let inv=0,corpus=0,curSip=sipAmt;
    const yearly=[];

    /* baseline normal SIP */
    let normCorpus=0;
    for(let m=1;m<=months;m++) normCorpus=normCorpus*(1+mr)+sipAmt;
    const pfFV0=sipPf?lsFV(sipPf,sipRate,sipYrs):0;
    normCorpus+=pfFV0;

    /* step-up / normal run + yearly snapshot */
    curSip=sipAmt; corpus=0; inv=0;
    for(let m=1;m<=months;m++){
      if(sipMode==="stepup"&&m>1&&(m-1)%12===0)
        curSip=stepKind==="pct"?curSip*(1+stepPct/100):curSip+stepAmt;
      inv+=curSip;
      corpus=corpus*(1+mr)+curSip;
      if(m%12===0){
        const y=m/12;
        const pfFV=sipPf?lsFV(sipPf,sipRate,y):0;
        let ni=0,nc=0;
        for(let mm=1;mm<=m;mm++){ni+=sipAmt;nc=nc*(1+mr)+sipAmt;}
        const normPfFV=sipPf?lsFV(sipPf,sipRate,y):0;
        yearly.push({
          y:"Y"+y, yr:y,
          inv:Math.round(inv+sipPf),
          corp:Math.round(corpus+pfFV),
          ret:Math.round(corpus+pfFV-inv-sipPf),
          normCorp:Math.round(nc+normPfFV),
          advantage:Math.round((corpus+pfFV)-(nc+normPfFV)),
        });
      }
    }

    /* 5yr slabs */
    const slabs=[];
    [5,10,15,20,25,30].filter(y=>y<=sipYrs).forEach(y=>{
      const d=yearly.find(r=>r.yr===y);
      if(d) slabs.push({slab:y+"y",corpus:d.corp,invested:d.inv,ret:d.ret,mult:(d.corp/Math.max(1,d.inv)).toFixed(2)+"×"});
    });
    if(sipYrs%5!==0&&yearly.length){
      const d=yearly[yearly.length-1];
      slabs.push({slab:sipYrs+"y",corpus:d.corp,invested:d.inv,ret:d.ret,mult:(d.corp/Math.max(1,d.inv)).toFixed(2)+"×"});
    }

    /* rate sensitivity */
    const sens=[6,8,10,12,15,18,20].map(r=>{
      let c=0,cs=sipAmt;
      const mmr=r/100/12;
      for(let m=1;m<=months;m++){
        if(sipMode==="stepup"&&m>1&&(m-1)%12===0)
          cs=stepKind==="pct"?cs*(1+stepPct/100):cs+stepAmt;
        c=c*(1+mmr)+cs;
      }
      const pfFV=sipPf?lsFV(sipPf,r,sipYrs):0;
      return{rate:r+"%",corp:Math.round(c+pfFV),highlight:Math.abs(r-sipRate)<0.5};
    });

    const pfFV=sipPf?lsFV(sipPf,sipRate,sipYrs):0;
    const totalC=corpus+pfFV;
    const totalI=inv+sipPf;
    return{yearly,slabs,sens,totalC,totalI,ret:totalC-totalI,
      mult:totalI>0?totalC/totalI:1,normCorpus,
      stepupExtra:totalC-normCorpus};
  },[sipAmt,sipRate,sipYrs,sipMode,stepKind,stepPct,stepAmt,sipPf]);

  /* ════ LUMPSUM MATH ════ */
  const lsRes=useMemo(()=>{
    const yearly=[], slabs=[];
    for(let y=1;y<=lsYrs;y++){
      const pfFV=lsPf?lsFV(lsPf,lsRate,y):0;
      const c=lsFV(lsAmt,lsRate,y)+pfFV;
      const inv=lsAmt+lsPf;
      yearly.push({y:"Y"+y,yr:y,inv,corp:Math.round(c),ret:Math.round(c-inv)});
    }
    [5,10,15,20,25,30].filter(y=>y<=lsYrs).forEach(y=>{
      const d=yearly.find(r=>r.yr===y);
      if(d) slabs.push({slab:y+"y",corpus:d.corp,invested:d.inv,ret:d.ret,mult:(d.corp/Math.max(1,d.inv)).toFixed(2)+"×"});
    });
    if(lsYrs%5!==0&&yearly.length){
      const d=yearly[yearly.length-1];
      slabs.push({slab:lsYrs+"y",corpus:d.corp,invested:d.inv,ret:d.ret,mult:(d.corp/Math.max(1,d.inv)).toFixed(2)+"×"});
    }
    const sens=[6,8,10,12,15,18,20].map(r=>{
      const pfFV=lsPf?lsFV(lsPf,r,lsYrs):0;
      const c=lsFV(lsAmt,r,lsYrs)+pfFV;
      return{rate:r+"%",corp:Math.round(c),highlight:Math.abs(r-lsRate)<0.5};
    });
    const pfFV=lsPf?lsFV(lsPf,lsRate,lsYrs):0;
    const totalC=lsFV(lsAmt,lsRate,lsYrs)+pfFV;
    const totalI=lsAmt+lsPf;
    return{yearly,slabs,sens,totalC,totalI,ret:totalC-totalI,mult:totalI>0?totalC/totalI:1};
  },[lsAmt,lsRate,lsYrs,lsPf]);

  const r   = tab==="sip"?sipRes:lsRes;
  const yrs = tab==="sip"?sipYrs:lsYrs;
  const rate= tab==="sip"?sipRate:lsRate;

  /* ─── tiny helpers ─── */
  const PillToggle=({value,onChange,opts,accent=A1})=>(
    <div style={{display:"flex",background:th.toggleBg,borderRadius:20,padding:3,gap:2}}>
      {opts.map(o=>(
        <button key={o.id} onClick={()=>onChange(o.id)} style={{
          flex:1,padding:"5px 12px",borderRadius:17,border:"none",cursor:"pointer",
          fontSize:11,fontWeight:600,whiteSpace:"nowrap",
          background:value===o.id?accent:"transparent",
          color:value===o.id?"#fff":th.sub,transition:"all 0.18s"}}>
          {o.l}
        </button>
      ))}
    </div>
  );

  const Legend=({items})=>(
    <div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:8}}>
      {items.map(d=>(
        <div key={d.l} style={{display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:20,height:3,borderRadius:2,background:d.c,opacity:d.dash?0.7:1,
            backgroundImage:d.dash?`repeating-linear-gradient(90deg,${d.c} 0,${d.c} 5px,transparent 5px,transparent 8px)`:"none"}}/>
          <span style={{fontSize:10,color:th.muted}}>{d.l}</span>
        </div>
      ))}
    </div>
  );

  /* SIP projection label at year Y */
  const sipAtYear=y=>{
    if(sipMode==="normal") return sipAmt;
    let c=sipAmt;
    for(let i=1;i<y;i++) c=stepKind==="pct"?c*(1+stepPct/100):c+stepAmt;
    return Math.round(c);
  };

  /* ── donut ring (corpus breakdown) ── */
  const retPct  = r.totalC>0 ? (r.ret/r.totalC*100) : 0;
  const invPct  = 100-retPct;
  const R=44, C=2*Math.PI*R;

  return(
    <div style={{display:"flex",flex:1,minHeight:0,overflow:"hidden"}}>

      {/* ══════════════ LEFT INPUT PANEL ══════════════ */}
      <div style={{width:300,minWidth:300,borderRight:`1px solid ${th.border}`,background:th.sidebar,
        flexShrink:0,overflowY:"auto",padding:"16px 18px 32px",display:"flex",flexDirection:"column",gap:0}}>

        {/* SIP / Lump Sum master toggle */}
        <div style={{marginBottom:20}}>
          <PillToggle value={tab} onChange={setTab}
            opts={[{id:"sip",l:"📅 SIP"},{id:"lump",l:"💰 Lump Sum"}]} accent={A1}/>
        </div>

        {/* ── SIP INPUTS ── */}
        {tab==="sip"&&(
          <div>
            {/* Normal / Step-Up pill */}
            <div style={{marginBottom:18}}>
              <div style={{fontSize:9,color:th.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:7,fontWeight:700}}>SIP MODE</div>
              <PillToggle value={sipMode} onChange={setSipMode}
                opts={[{id:"normal",l:"Normal"},{id:"stepup",l:"⬆ Step-Up"}]} accent={A4}/>
            </div>

            <InputSection title="Portfolio" icon="💼" color={A2} first>
              <Slider label="Present Portfolio Value" value={sipPf} min={0} softMax={20000000} step={10000}
                isCurrency showWords accent={A2} onChange={setSipPf}
                tip="Current corpus: MF, FD, stocks, PPF etc."/>
              <Slider label="Time Period" value={sipYrs} min={1} softMax={50} step={1}
                suffix=" yrs" accent={A4} onChange={setSipYrs} tip="Investment horizon"/>
              <Slider label="Expected Return p.a." value={sipRate} min={1} softMax={36} step={0.5}
                suffix="%" accent={A1} onChange={setSipRate} tip="Equity ~12%, Balanced ~10%, Debt ~7%"/>
            </InputSection>

            <InputSection title="Monthly Investment" icon="📅" color={A1}>
              <Slider label="Monthly SIP" value={sipAmt} min={500} softMax={500000} step={500}
                isCurrency showWords accent={A1} onChange={setSipAmt} tip="Fixed monthly SIP amount"/>
            </InputSection>

            {sipMode==="stepup"&&(
              <InputSection title="Annual Step-Up" icon="📈" color={A4}>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:9,color:th.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:7,fontWeight:700}}>INCREASE BY</div>
                  <PillToggle value={stepKind} onChange={setStepKind}
                    opts={[{id:"pct",l:"% Rate"},{id:"amt",l:"₹ Amount"}]} accent={A4}/>
                </div>
                {stepKind==="pct"
                  ?<Slider label="Annual Increase %" value={stepPct} min={1} softMax={50} step={1}
                      suffix="%" accent={A4} onChange={setStepPct} tip="SIP grows by this % every year"/>
                  :<Slider label="Annual Increase ₹" value={stepAmt} min={100} softMax={50000} step={100}
                      isCurrency accent={A4} onChange={setStepAmt} tip="SIP grows by this rupee amount every year"/>
                }
                {/* Step ladder preview */}
                <div style={{background:`${A4}0c`,border:`1px solid ${A4}28`,borderRadius:10,padding:"10px 12px"}}>
                  <div style={{fontSize:9,color:A4,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>SIP Growth Ladder</div>
                  {[1,3,5,10,sipYrs].filter((y,i,a)=>y<=sipYrs&&a.indexOf(y)===i).map(y=>(
                    <div key={y} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:3,height:16,borderRadius:2,background:A4,opacity:0.4+(y/sipYrs*0.6)}}/>
                        <span style={{fontSize:10,color:th.sub}}>Year {y}</span>
                      </div>
                      <span style={{fontWeight:700,fontSize:11,color:A4}}>{fmt(sipAtYear(y))}/mo</span>
                    </div>
                  ))}
                </div>
              </InputSection>
            )}
          </div>
        )}

        {/* ── LUMPSUM INPUTS ── */}
        {tab==="lump"&&(
          <div>
            <InputSection title="Portfolio" icon="💼" color={A2} first>
              <Slider label="Present Portfolio Value" value={lsPf} min={0} softMax={20000000} step={10000}
                isCurrency showWords accent={A2} onChange={setLsPf} tip="Existing investments"/>
              <Slider label="Time Period" value={lsYrs} min={1} softMax={50} step={1}
                suffix=" yrs" accent={A4} onChange={setLsYrs} tip="How long to stay invested"/>
              <Slider label="Expected Return p.a." value={lsRate} min={1} softMax={36} step={0.5}
                suffix="%" accent={A1} onChange={setLsRate} tip="Expected annual return"/>
            </InputSection>
            <InputSection title="Lump Sum Investment" icon="💰" color={A1}>
              <Slider label="One-Time Investment" value={lsAmt} min={10000} softMax={50000000} step={10000}
                isCurrency showWords accent={A1} onChange={setLsAmt} tip="Total one-time investment"/>
            </InputSection>
          </div>
        )}
      </div>

      {/* ══════════════ RIGHT OUTPUT PANEL ══════════════ */}
      <div style={{flex:1,minWidth:0,overflowY:"auto",background:th.bg,padding:"22px 24px",display:"flex",flexDirection:"column",gap:18}}>

        {/* ── SECTION 1: HERO STRIP ── */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
          {[
            {label:"Total Corpus",  value:fmt(r.totalC), raw:r.totalC,   color:A1, icon:"🏆", tip:"Final value of all investments"},
            {label:"Wealth Gained", value:fmt(r.ret),    raw:r.ret,      color:A2, icon:"📈", tip:"Total returns on your investment"},
            {label:"Total Invested",value:fmt(r.totalI), raw:r.totalI,   color:A4, icon:"💰", tip:"Total amount you put in"},
            {label:"Money Grew",    value:r.mult.toFixed(2)+"×", raw:0,  color:A3, icon:"⚡", tip:"Your money multiplied this many times"},
          ].map(k=><KCard key={k.label} {...k}/>)}
        </div>

        {/* ── SECTION 2: CORPUS BREAKDOWN + STEPUP BANNER ── */}
        <div style={{display:"grid",gridTemplateColumns:tab==="sip"&&sipMode==="stepup"?"1fr 1fr":"1fr 1fr",gap:12}}>

          {/* Donut breakdown */}
          <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"18px 20px",display:"flex",alignItems:"center",gap:20}}>
            {/* SVG donut */}
            <div style={{position:"relative",flexShrink:0}}>
              <svg width={110} height={110} viewBox="0 0 110 110">
                <circle cx={55} cy={55} r={R} fill="none" stroke={th.track} strokeWidth={14}/>
                <circle cx={55} cy={55} r={R} fill="none" stroke={A4} strokeWidth={14}
                  strokeDasharray={`${invPct/100*C} ${C}`}
                  strokeDashoffset={C*0.25} strokeLinecap="butt"/>
                <circle cx={55} cy={55} r={R} fill="none" stroke={A1} strokeWidth={14}
                  strokeDasharray={`${retPct/100*C} ${C}`}
                  strokeDashoffset={C*0.25-invPct/100*C} strokeLinecap="butt"/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontWeight:800,fontSize:15,color:th.text,lineHeight:1}}>{r.mult.toFixed(1)}×</div>
                <div style={{fontSize:8,color:th.muted,letterSpacing:"0.08em"}}>GROWTH</div>
              </div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:700,color:th.text,marginBottom:10}}>Corpus Breakdown</div>
              {[
                {label:"Returns",  value:r.ret,    pct:retPct, color:A1},
                {label:"Invested", value:r.totalI, pct:invPct, color:A4},
              ].map(b=>(
                <div key={b.label} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <div style={{width:8,height:8,borderRadius:2,background:b.color}}/>
                      <span style={{fontSize:10,color:th.sub}}>{b.label}</span>
                    </div>
                    <span style={{fontSize:10,fontWeight:700,color:b.color}}>{fmt(b.value)} <span style={{color:th.muted,fontWeight:400}}>({b.pct.toFixed(0)}%)</span></span>
                  </div>
                  <div style={{height:4,background:th.track,borderRadius:99}}>
                    <div style={{height:"100%",width:b.pct+"%",background:b.color,borderRadius:99,transition:"width 0.5s"}}/>
                  </div>
                </div>
              ))}
              <div style={{marginTop:10,paddingTop:8,borderTop:`1px solid ${th.border}`,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:10,color:th.muted}}>Total Corpus</span>
                <span style={{fontSize:12,fontWeight:800,color:A1}}>{fmt(r.totalC)}</span>
              </div>
            </div>
          </div>

          {/* Step-up extra OR lumpsum compounding card */}
          {tab==="sip"&&sipMode==="stepup"?(
            <div style={{background:`linear-gradient(135deg,${A1}0d,${A2}08)`,border:`1px solid ${A1}25`,borderRadius:14,padding:"18px 20px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <span style={{fontSize:22}}>🚀</span>
                  <div style={{fontWeight:700,fontSize:13,color:th.text}}>Step-Up Advantage</div>
                </div>
                <div style={{fontSize:11,color:th.sub,lineHeight:1.8,marginBottom:14}}>
                  By stepping up your SIP by <strong style={{color:A4}}>{stepKind==="pct"?stepPct+"% p.a.":"₹"+stepAmt.toLocaleString("en-IN")+" p.a."}</strong>, you earn extra wealth compared to a flat <strong style={{color:th.text}}>{fmt(sipAmt)}/mo</strong> SIP.
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[
                    {l:"Step-Up Corpus",v:sipRes.totalC,c:A1},
                    {l:"Normal SIP Corpus",v:sipRes.normCorpus,c:A5},
                    {l:"Extra Earned",v:sipRes.stepupExtra,c:A2},
                    {l:"% More",v:(sipRes.stepupExtra/Math.max(1,sipRes.normCorpus)*100).toFixed(1)+"%",c:A3,str:true},
                  ].map(d=>(
                    <div key={d.l} style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:9,padding:"9px 11px"}}>
                      <div style={{fontSize:9,color:th.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{d.l}</div>
                      <div style={{fontWeight:800,fontSize:13,color:d.c}}>{d.str?d.v:fmt(d.v)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ):(
            <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"18px 20px"}}>
              <div style={{fontWeight:700,fontSize:12,color:th.text,marginBottom:12}}>
                {tab==="sip"?"📅 SIP Summary":"💡 Power of Compounding"}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {tab==="sip"?[
                  {l:"Monthly SIP",     v:fmt(sipAmt)+"/mo", c:A1},
                  {l:"Time Horizon",    v:sipYrs+" years",   c:A4},
                  {l:"Expected Return", v:Number(sipRate).toFixed(1)+"%", c:A2},
                  {l:"Interest Earned", v:fmt(sipRes.ret),   c:A1},
                ]:[
                  {l:"One-Time Investment",v:fmt(lsAmt),                   c:A1},
                  {l:"Time Horizon",       v:lsYrs+" years",               c:A4},
                  {l:"Expected Return",    v:Number(lsRate).toFixed(1)+"%",c:A2},
                  {l:"CAGR Check",         v:cagrC(lsAmt,lsRes.totalC,lsYrs).toFixed(2)+"%", c:A5},
                ].map(d=>(
                  <div key={d.l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${th.border}`}}>
                    <span style={{fontSize:11,color:th.sub}}>{d.l}</span>
                    <span style={{fontSize:11,fontWeight:700,color:d.c}}>{d.v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── SECTION 3: GROWTH CHART ── */}
        <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,overflow:"hidden"}}>
          <div style={{padding:"12px 18px",borderBottom:`1px solid ${th.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:th.tag}}>
            <span style={{fontWeight:700,fontSize:12,color:th.text}}>
              {tab==="sip"&&sipMode==="stepup"?"📈 Step-Up vs Normal SIP Growth":"📈 Corpus Growth Over Time"}
            </span>
          </div>
          <div style={{padding:"16px"}}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={r.yearly} margin={{top:8,right:8,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="sg1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={A1} stopOpacity={0.32}/>
                    <stop offset="95%" stopColor={A1} stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={A4} stopOpacity={0.14}/>
                    <stop offset="95%" stopColor={A4} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="sg3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={A5} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={A5} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={th.border} vertical={false} strokeDasharray="3 3"/>
                <XAxis dataKey="y" tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                <YAxis tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={fmtS} width={46}/>
                <Tooltip content={<CTip/>}/>
                <Area type="monotone" dataKey="corp" name="Corpus" stroke={A1} strokeWidth={2.5} fill="url(#sg1)" dot={false}/>
                <Area type="monotone" dataKey="inv"  name="Invested" stroke={A4} strokeWidth={1.5} fill="url(#sg2)" dot={false} strokeDasharray="5 4"/>
                {tab==="sip"&&sipMode==="stepup"&&(
                  <Area type="monotone" dataKey="normCorp" name="Normal SIP" stroke={A5} strokeWidth={1.5} fill="url(#sg3)" dot={false} strokeDasharray="4 4"/>
                )}
              </AreaChart>
            </ResponsiveContainer>
            <Legend items={[
              {c:A1,l:"Total Corpus"},
              {c:A4,l:"Amount Invested",dash:true},
              ...(tab==="sip"&&sipMode==="stepup"?[{c:A5,l:"Normal SIP Corpus",dash:true}]:[]),
            ]}/>
          </div>
        </div>

        {/* ── SECTION 4: STEP-UP ADVANTAGE CHART (conditional) ── */}
        {tab==="sip"&&sipMode==="stepup"&&sipRes.stepupExtra>0&&(
          <div style={{background:th.card,border:`1px solid ${A1}22`,borderRadius:14,overflow:"hidden"}}>
            <div style={{padding:"12px 18px",borderBottom:`1px solid ${th.border}`,background:`${A1}06`}}>
              <span style={{fontWeight:700,fontSize:12,color:th.text}}>🚀 Step-Up Extra Gain vs Normal SIP</span>
            </div>
            <div style={{padding:"16px"}}>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={sipRes.yearly} margin={{top:8,right:8,left:0,bottom:0}}>
                  <defs>
                    <linearGradient id="adv1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={A2} stopOpacity={0.35}/>
                      <stop offset="95%" stopColor={A2} stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={th.border} vertical={false} strokeDasharray="3 3"/>
                  <XAxis dataKey="y" tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                  <YAxis tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={fmtS} width={46}/>
                  <Tooltip content={<CTip/>}/>
                  <Area type="monotone" dataKey="advantage" name="Extra Earned" stroke={A2} strokeWidth={2.5} fill="url(#adv1)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
              <Legend items={[{c:A2,l:"Extra corpus earned by stepping up vs flat SIP"}]}/>
            </div>
          </div>
        )}

        {/* ── SECTION 5: 5-YEAR SLAB BAR CHART ── */}
        <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,overflow:"hidden"}}>
          <div style={{padding:"12px 18px",borderBottom:`1px solid ${th.border}`,background:th.tag}}>
            <span style={{fontWeight:700,fontSize:12,color:th.text}}>📊 5-Year Milestone Slabs</span>
          </div>
          <div style={{padding:"16px"}}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={r.slabs} margin={{top:8,right:8,left:0,bottom:0}} barSize={28}>
                <CartesianGrid stroke={th.border} vertical={false}/>
                <XAxis dataKey="slab" tick={{fill:th.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={fmtS} width={46}/>
                <Tooltip content={<CTip/>}/>
                <Bar dataKey="invested" name="Invested" fill={A4} fillOpacity={0.45} radius={[0,0,5,5]} stackId="s"/>
                <Bar dataKey="ret"      name="Gains"    fill={A1} radius={[5,5,0,0]} stackId="s"/>
              </BarChart>
            </ResponsiveContainer>
            <Legend items={[{c:A1,l:"Returns / Gains"},{c:A4,l:"Amount Invested"}]}/>
          </div>
        </div>

        {/* ── SECTION 6: SLAB TABLE ── */}
        <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,overflow:"hidden"}}>
          <div style={{padding:"12px 18px",borderBottom:`1px solid ${th.border}`,background:th.tag}}>
            <span style={{fontWeight:700,fontSize:12,color:th.text}}>📋 Year-by-Milestone Breakdown</span>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead>
                <tr>
                  {["Period","Invested","Corpus","Gains","Multiple"].map((h,i)=>(
                    <th key={h} style={{padding:"10px 14px",textAlign:i===0?"left":"right",color:th.muted,fontWeight:700,fontSize:9,textTransform:"uppercase",letterSpacing:"0.07em",borderBottom:`2px solid ${th.border}`,background:th.tag,whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {r.slabs.map((s,i)=>(
                  <tr key={i} style={{borderBottom:`1px solid ${th.border}`,transition:"background 0.12s"}}
                    onMouseOver={e=>e.currentTarget.style.background=th.tag}
                    onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"10px 14px",color:A2,fontWeight:700,fontSize:12}}>{s.slab}</td>
                    <td style={{padding:"10px 14px",textAlign:"right",color:th.sub}}>{fmt(s.invested)}</td>
                    <td style={{padding:"10px 14px",textAlign:"right",color:A1,fontWeight:700}}>{fmt(s.corpus)}</td>
                    <td style={{padding:"10px 14px",textAlign:"right",color:A1}}>{fmt(s.ret)}</td>
                    <td style={{padding:"10px 14px",textAlign:"right"}}>
                      <span style={{background:`${A5}18`,color:A5,fontWeight:800,fontSize:11,padding:"3px 9px",borderRadius:20}}>{s.mult}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SECTION 7: RATE SENSITIVITY ── */}
        <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,overflow:"hidden"}}>
          <div style={{padding:"12px 18px",borderBottom:`1px solid ${th.border}`,background:th.tag,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:700,fontSize:12,color:th.text}}>🎯 Return Rate Sensitivity</span>
            <span style={{fontSize:10,color:th.muted}}>What if returns are different?</span>
          </div>
          <div style={{padding:"14px 16px"}}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={r.sens} margin={{top:6,right:8,left:0,bottom:0}} barSize={24}>
                <CartesianGrid stroke={th.border} vertical={false}/>
                <XAxis dataKey="rate" tick={{fill:th.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={fmtS} width={46}/>
                <Tooltip content={<CTip/>}/>
                <Bar dataKey="corp" name="Final Corpus" radius={[5,5,0,0]}>
                  {r.sens.map((d,i)=><Cell key={i} fill={d.highlight?A1:A2} opacity={d.highlight?1:0.5}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{display:"flex",gap:10,marginTop:10,alignItems:"center"}}>
              <div style={{width:12,height:12,borderRadius:3,background:A1}}/>
              <span style={{fontSize:10,color:th.muted}}>Your selected rate ({Number(rate).toFixed(1)}%) highlighted</span>
            </div>
          </div>
        </div>

        {/* ── SECTION 8: INSIGHT BOX ── */}
        <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"16px 20px"}}>
          <div style={{fontWeight:700,fontSize:12,color:th.text,marginBottom:10}}>💡 Key Insights</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[
              {icon:"📈",text:`At ${Number(rate).toFixed(1)}% return, ${fmt(r.totalI)} grows to ${fmt(r.totalC)} in ${yrs} years — a ${r.mult.toFixed(2)}× multiplication.`},
              {icon:"⏰",text:`Rule of 72: money doubles every ${(72/rate).toFixed(1)} years at ${Number(rate).toFixed(1)}% — so ${yrs} years = ~${(yrs/(72/rate)).toFixed(1)} doublings.`},
              ...(tab==="sip"&&sipMode==="stepup"&&sipRes.stepupExtra>0
                ?[{icon:"🚀",text:`Step-Up earns ${fmt(sipRes.stepupExtra)} more than a flat SIP — a ${(sipRes.stepupExtra/Math.max(1,sipRes.normCorpus)*100).toFixed(1)}% larger corpus for the same return rate.`}]
                :[]),
              {icon:"🏆",text:`Your gains (${fmt(r.ret)}) are ${retPct.toFixed(0)}% of final corpus — the higher this %, the harder your money is working.`},
            ].map((ins,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"9px 12px",background:th.tag,borderRadius:9,border:`1px solid ${th.border}`}}>
                <span style={{fontSize:16,flexShrink:0}}>{ins.icon}</span>
                <span style={{fontSize:11,color:th.sub,lineHeight:1.7}}>{ins.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>{/* end right panel */}
    </div>
  );
}

function SWPPage(){
  const{th}=useContext(Ctx);
  const[corpus,setCorpus]=useState(5000000);
  const[wd,setWd]=useState(25000);
  const[rate,setRate]=useState(10);
  const[yrs,setYrs]=useState(20);
  const[wdG,setWdG]=useState(0);
  const res=useMemo(()=>{
    const mr=rate/100/12;let bal=corpus,tot=0,dep=null,wdNow=wd;const data=[];
    for(let m=1;m<=yrs*12;m++){if(m>1&&(m-1)%12===0)wdNow*=(1+wdG/100);bal=bal*(1+mr)-wdNow;tot+=wdNow;if(bal<=0&&!dep)dep=Math.ceil(m/12);bal=Math.max(bal,0);if(m%12===0)data.push({y:"Y"+m/12,bal:Math.round(bal),tot:Math.round(tot)});}
    return{data,tot,final:bal,dep,ok:!dep};
  },[corpus,wd,rate,yrs,wdG]);
  return(
    <div style={{display:"flex",flex:1,minHeight:0,overflow:"hidden"}}>
      <InputPanel>
        <InputSection title="Corpus" icon="🏦" color={A1} first>
          <Slider label="Starting Corpus" value={corpus} min={100000} softMax={100000000} step={100000} isCurrency showWords accent={A1} onChange={setCorpus} tip="Total corpus"/>
          <Slider label="Return p.a." value={rate} min={1} softMax={20} step={0.5} suffix="%" accent={A3} onChange={setRate} tip="Return on corpus"/>
        </InputSection>
        <InputSection title="Withdrawal Plan" icon="💸" color={A2}>
          <Slider label="Monthly Withdrawal" value={wd} min={1000} softMax={300000} step={1000} isCurrency showWords accent={A2} onChange={setWd} tip="Monthly withdrawal"/>
          <Slider label="Period" value={yrs} min={1} softMax={50} step={1} suffix=" yrs" accent={A4} onChange={setYrs} tip="Duration"/>
          <Slider label="Annual WD Growth" value={wdG} min={0} softMax={12} step={0.5} suffix="%" accent={A5} onChange={setWdG} tip="Annual withdrawal increase"/>
        </InputSection>
        <div style={{marginTop:14,padding:"11px 13px",background:res.ok?th.ok:th.warn,border:`1px solid ${res.ok?th.okB:th.warnB}`,borderRadius:10,fontSize:12,color:th.sub}}>
          {res.ok?`✅ Corpus lasts ${yrs} years`:`⚠️ Depletes at Year ${res.dep}`}
        </div>
      </InputPanel>
      <ResultPanel>
        <KGrid cols={3}>
          <KCard label="Starting Corpus" value={fmt(corpus)} raw={corpus} color={A1} icon="🏦" tip="Total corpus"/>
          <KCard label="Total Withdrawn" value={fmt(res.tot)} raw={res.tot} color={A2} icon="💸" tip="Cumulative withdrawals"/>
          <KCard label="Final Balance" value={fmt(res.final)} raw={res.final} color={res.ok?A1:A3} icon="📊" warn={!res.ok} tip="Remaining corpus"/>
        </KGrid>
        <RCard title="📊 Balance Over Time">
          <ResponsiveContainer width="100%" height={250}><AreaChart data={res.data} margin={{top:4,right:4,left:0,bottom:0}}>
            <defs><linearGradient id="swg1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={A1} stopOpacity={0.25}/><stop offset="95%" stopColor={A1} stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid stroke={th.border} vertical={false}/><XAxis dataKey="y" tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} interval="preserveStartEnd"/><YAxis tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={fmtS}/><Tooltip content={<CTip/>}/>
            <Area type="monotone" dataKey="bal" name="Balance" stroke={A1} strokeWidth={2} fill="url(#swg1)" dot={false}/>
            <Line type="monotone" dataKey="tot" name="Withdrawn" stroke={A2} strokeWidth={1.5} dot={false} strokeDasharray="4 3"/>
          </AreaChart></ResponsiveContainer>
        </RCard>
        <InfoBox color={res.ok?A1:A3}>{fmt(wd)}/mo from {fmt(corpus)} @ {Number(rate).toFixed(2)}% — {res.ok?`lasts ${yrs} years, ${fmt(res.final)} remaining`:`depletes at Year ${res.dep}`}</InfoBox>
      </ResultPanel>
    </div>
  );
}

function EMIPage(){
  const{th}=useContext(Ctx);
  const[prin,setPrin]=useState(5000000);
  const[rate,setRate]=useState(8.5);
  const[ten,setTen]=useState(20);
  const[pre,setPre]=useState(0);
  const res=useMemo(()=>{
    const months=ten*12,emi=emiC(prin,rate,months),tot=emi*months,int=tot-prin;
    const sched=[];let bal=prin;
    for(let m=1;m<=months;m++){const ip=bal*rate/100/12;const pp=emi-ip;bal=Math.max(0,bal-pp);if(m%12===0)sched.push({y:"Y"+m/12,bal:Math.round(bal),int:Math.round(ip*12)});}
    let bal2=prin,nm=0;
    for(let m=1;m<=months*2;m++){const ip=bal2*rate/100/12;const pp=emi-ip+pre/12;bal2=Math.max(0,bal2-pp);nm++;if(bal2<=0)break;}
    return{emi,tot,int,sched,saved:pre>0?(months-nm)*emi:0,nm};
  },[prin,rate,ten,pre]);
  return(
    <div style={{display:"flex",flex:1,minHeight:0,overflow:"hidden"}}>
      <InputPanel>
        <InputSection title="Loan Details" icon="🏠" color={A1} first>
          <Slider label="Loan Amount" value={prin} min={10000} softMax={50000000} step={10000} isCurrency showWords accent={A1} onChange={setPrin} tip="Total loan amount"/>
          <Slider label="Interest Rate p.a." value={rate} min={1} softMax={25} step={0.01} suffix="%" accent={A3} onChange={setRate} tip="Annual interest rate"/>
          <Slider label="Tenure" value={ten} min={1} softMax={30} step={1} suffix=" yrs" accent={A4} onChange={setTen} tip="Repayment period"/>
        </InputSection>
        <InputSection title="Prepayment" icon="💰" color={A5}>
          <Slider label="Extra Annual Payment" value={pre} min={0} softMax={500000} step={5000} isCurrency showWords accent={A5} onChange={setPre} tip="Extra annual principal payment"/>
          {pre>0&&<div style={{padding:"9px 11px",background:th.ok,border:`1px solid ${th.okB}`,borderRadius:9,fontSize:11,color:th.sub}}>Saves <strong style={{color:A1}}>{fmt(res.saved)}</strong> · Done in <strong style={{color:A1}}>{Math.ceil(res.nm/12)}y {res.nm%12}mo</strong></div>}
        </InputSection>
      </InputPanel>
      <ResultPanel>
        <KGrid cols={4}>
          <KCard label="Monthly EMI" value={fmt(res.emi)} raw={res.emi} color={A1} icon="📅" tip="Fixed monthly payment"/>
          <KCard label="Total Payment" value={fmt(res.tot)} raw={res.tot} color={A2} icon="💳" tip="Total outflow"/>
          <KCard label="Total Interest" value={fmt(res.int)} raw={res.int} color={A3} icon="📊" warn={res.int/res.tot>0.45} tip="Interest paid"/>
          <KCard label="Interest %" value={(res.int/res.tot*100).toFixed(1)+"%"} raw={0} color={res.int/res.tot>0.45?A3:A1} icon="⚖️" tip="Interest as % of total"/>
        </KGrid>
        <RCard title="📉 Outstanding Balance">
          <ResponsiveContainer width="100%" height={250}><AreaChart data={res.sched} margin={{top:4,right:4,left:0,bottom:0}}>
            <defs><linearGradient id="eg1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={A2} stopOpacity={0.22}/><stop offset="95%" stopColor={A2} stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid stroke={th.border} vertical={false}/><XAxis dataKey="y" tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} interval="preserveStartEnd"/><YAxis tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={fmtS}/><Tooltip content={<CTip/>}/>
            <Area type="monotone" dataKey="bal" name="Outstanding" stroke={A2} strokeWidth={2} fill="url(#eg1)" dot={false}/>
            <Line type="monotone" dataKey="int" name="Annual Interest" stroke={A3} strokeWidth={1.5} dot={false} strokeDasharray="4 3"/>
          </AreaChart></ResponsiveContainer>
        </RCard>
        <InfoBox color={A1}>EMI <strong style={{color:A1}}>{fmt(res.emi)}/mo</strong> on {fmt(prin)} @ {Number(rate).toFixed(2)}% for {ten}yrs · Interest <strong style={{color:A3}}>{fmt(res.int)}</strong></InfoBox>
      </ResultPanel>
    </div>
  );
}

function PPFPage(){
  const{th}=useContext(Ctx);
  const[dep,setDep]=useState(150000);
  const[yrs,setYrs]=useState(15);
  const mat=useMemo(()=>{let b=0;for(let y=0;y<yrs;y++)b=(b+dep)*1.071;return Math.round(b);},[dep,yrs]);
  const inv=dep*yrs,gain=mat-inv;
  const chart=Array.from({length:yrs},(_,i)=>{let b=0;for(let y=0;y<=i;y++)b=(b+dep)*1.071;return{y:"Y"+(i+1),mat:Math.round(b),inv:Math.round(dep*(i+1))};});
  return(
    <div style={{display:"flex",flex:1,minHeight:0,overflow:"hidden"}}>
      <InputPanel width={280}>
        <InputSection title="PPF Details" icon="🏛️" color={A1} first>
          <div style={{padding:"9px 11px",background:`${A1}0a`,border:`1px solid ${A1}22`,borderRadius:9,fontSize:11,color:th.sub,marginBottom:14,lineHeight:1.7}}><strong style={{color:A1}}>Rate: 7.1% p.a.</strong> · EEE · Tax-free · Max ₹1.5L/yr</div>
          <Slider label="Yearly Deposit" value={dep} min={500} softMax={150000} step={500} isCurrency showWords accent={A1} onChange={setDep} tip="Annual PPF deposit"/>
          <Slider label="Period" value={yrs} min={15} softMax={50} step={5} suffix=" yrs" accent={A2} onChange={setYrs} tip="Min 15 years"/>
        </InputSection>
        <InputSection title="Summary" icon="📊" color={A2}>
          {[{l:"Maturity Value",v:mat,c:A1},{l:"Total Invested",v:inv,c:A2},{l:"Tax-Free Gain",v:gain,c:A1}].map(it=>(
            <div key={it.l} style={{marginBottom:12}}>
              <div style={{fontSize:9,color:th.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>{it.l}</div>
              <div style={{fontWeight:800,fontSize:17,color:it.c}}>{fmt(it.v)}</div><Words n={it.v}/>
            </div>
          ))}
          <div style={{padding:"8px 10px",background:th.ok,border:`1px solid ${th.okB}`,borderRadius:8,fontSize:11,color:th.sub}}>Effective CAGR: <strong style={{color:A1}}>{cagrC(inv,mat,yrs).toFixed(2)}%</strong></div>
        </InputSection>
      </InputPanel>
      <ResultPanel>
        <KGrid cols={3}>
          <KCard label="Maturity Value" value={fmt(mat)} raw={mat} color={A1} icon="🏛️" tip="Final PPF value"/>
          <KCard label="Total Invested" value={fmt(inv)} raw={inv} color={A2} icon="💰" tip="Sum of deposits"/>
          <KCard label="Tax-Free Gain" value={fmt(gain)} raw={gain} color={A1} icon="🎁" sub="0% tax" tip="Completely tax-free"/>
        </KGrid>
        <RCard title="📈 PPF Growth">
          <ResponsiveContainer width="100%" height={270}><AreaChart data={chart} margin={{top:4,right:4,left:0,bottom:0}}>
            <defs><linearGradient id="ppfg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={A1} stopOpacity={0.25}/><stop offset="95%" stopColor={A1} stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid stroke={th.border} vertical={false}/><XAxis dataKey="y" tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} interval="preserveStartEnd"/><YAxis tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={fmtS}/><Tooltip content={<CTip/>}/>
            <Area type="monotone" dataKey="mat" name="Maturity" stroke={A1} strokeWidth={2} fill="url(#ppfg)" dot={false}/>
            <Line type="monotone" dataKey="inv" name="Invested" stroke={A2} strokeWidth={1.5} dot={false} strokeDasharray="4 3"/>
          </AreaChart></ResponsiveContainer>
        </RCard>
        <InfoBox color={A1}>PPF {fmt(dep)}/yr × {yrs}yrs @ 7.1% = <strong style={{color:A1}}>{fmt(mat)}</strong> · Tax-free · CAGR {cagrC(inv,mat,yrs).toFixed(2)}%</InfoBox>
      </ResultPanel>
    </div>
  );
}

function CAGRPage(){
  const{th}=useContext(Ctx);
  const[pv,setPv]=useState(100000);
  const[fv,setFv]=useState(500000);
  const[yrs,setYrs]=useState(10);
  const cagr=cagrC(pv,fv,yrs);
  const r72=72/cagr;
  const chart=Array.from({length:Math.min(yrs,50)},(_,i)=>({y:"Y"+(i+1),val:Math.round(lsFV(pv,cagr,i+1))}));
  const rates=[4,6,8,10,12,15,18,20,25].map(r=>({r:r+"%",val:Math.round(lsFV(pv,r,yrs)),mine:Math.abs(r-Math.round(cagr))<1.5}));
  return(
    <div style={{display:"flex",flex:1,minHeight:0,overflow:"hidden"}}>
      <InputPanel>
        <InputSection title="Investment Values" icon="💰" color={A2} first>
          <Slider label="Amount Invested (PV)" value={pv} min={1000} softMax={10000000} step={1000} isCurrency showWords accent={A2} onChange={setPv} tip="Original amount"/>
          <Slider label="Current Value (FV)" value={fv} min={pv+1} softMax={100000000} step={1000} isCurrency showWords accent={A1} onChange={v=>setFv(Math.max(v,pv+1))} tip="Current value"/>
          <Slider label="Holding Period" value={yrs} min={0.5} softMax={50} step={0.5} suffix=" yrs" accent={A3} onChange={setYrs} tip="Years held"/>
        </InputSection>
        <InputSection title="Results" icon="📊" color={A1}>
          {[{l:"CAGR",v:cagr.toFixed(2)+"%",c:A1,d:"Compound Annual Growth Rate"},{l:"Absolute Return",v:((fv/pv-1)*100).toFixed(1)+"%",c:A4,d:"Total % gain"},{l:"Multiple",v:(fv/pv).toFixed(3)+"×",c:A2,d:"Final ÷ initial"},{l:"Rule of 72",v:r72.toFixed(1)+" yrs",c:A5,d:"Time to double"},].map(it=>(
            <div key={it.l} style={{marginBottom:14,paddingBottom:14,borderBottom:`1px solid ${th.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div><div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:th.muted,marginBottom:1}}>{it.l}</div><div style={{fontSize:9,color:th.muted,fontStyle:"italic"}}>{it.d}</div></div>
                <div style={{fontWeight:800,fontSize:19,color:it.c}}>{it.v}</div>
              </div>
            </div>
          ))}
        </InputSection>
      </InputPanel>
      <ResultPanel>
        <KGrid cols={4}>
          <KCard label="Your CAGR" value={cagr.toFixed(2)+"%"} raw={0} color={A1} icon="📈" tip="Annualised return"/>
          <KCard label="Absolute Return" value={((fv/pv-1)*100).toFixed(1)+"%"} raw={0} color={A4} icon="⚡" tip="Total % gain"/>
          <KCard label="Profit" value={fmt(fv-pv)} raw={fv-pv} color={A2} icon="💰" tip="Net profit"/>
          <KCard label="Doubles In" value={r72.toFixed(1)+" yrs"} raw={0} color={A5} icon="⏱️" tip="Rule of 72"/>
        </KGrid>
        <RCard title="📈 Growth Curve">
          <ResponsiveContainer width="100%" height={200}><AreaChart data={chart} margin={{top:4,right:4,left:0,bottom:0}}>
            <defs><linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={A1} stopOpacity={0.22}/><stop offset="95%" stopColor={A1} stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid stroke={th.border} vertical={false}/><XAxis dataKey="y" tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} interval="preserveStartEnd"/><YAxis tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={fmtS}/><Tooltip content={<CTip/>}/>
            <Area type="monotone" dataKey="val" name="Value" stroke={A1} strokeWidth={2.5} fill="url(#cg1)" dot={false}/>
          </AreaChart></ResponsiveContainer>
        </RCard>
        <RCard title={`📊 ${fmt(pv)} at Different Rates (${yrs} years)`}>
          <ResponsiveContainer width="100%" height={180}><BarChart data={rates} margin={{top:4,right:4,left:0,bottom:0}}>
            <CartesianGrid stroke={th.border} vertical={false}/><XAxis dataKey="r" tick={{fill:th.muted,fontSize:10}} axisLine={false} tickLine={false}/><YAxis tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={fmtS}/><Tooltip content={<CTip/>}/>
            <Bar dataKey="val" name="Final Value" radius={[4,4,0,0]}>{rates.map((d,i)=><Cell key={i} fill={d.mine?A1:A2} opacity={d.mine?1:0.45}/>)}</Bar>
          </BarChart></ResponsiveContainer>
        </RCard>
        <InfoBox color={A1}>{fmt(pv)} → {fmt(fv)} in {yrs}yrs = <strong style={{color:A1}}>{cagr.toFixed(2)}% CAGR</strong> · doubles every <strong style={{color:A5}}>{r72.toFixed(1)} yrs</strong></InfoBox>
      </ResultPanel>
    </div>
  );
}

function CAGRReturnPage(){
  const{th}=useContext(Ctx);
  const[pv,setPv]=useState(100000);
  const[fv,setFv]=useState(500000);
  const[yrs,setYrs]=useState(10);
  const cagr=cagrC(pv,fv,yrs);
  const rates=[4,6,8,10,12,15,18,20,25].map(r=>({r:r+"%",val:Math.round(lsFV(pv,r,yrs)),mine:Math.abs(r-Math.round(cagr))<1.5}));
  return(
    <div style={{display:"flex",flex:1,minHeight:0,overflow:"hidden"}}>
      <InputPanel>
        <InputSection title="Know CAGR Return" icon="📐" color={A5} first>
          <div style={{padding:"9px 11px",background:`${A5}0a`,border:`1px solid ${A5}22`,borderRadius:9,fontSize:11,color:th.sub,marginBottom:14,lineHeight:1.7}}>Enter PV, FV and years to find exact CAGR of any investment.</div>
          <Slider label="Amount Invested (PV)" value={pv} min={1000} softMax={10000000} step={1000} isCurrency showWords accent={A2} onChange={setPv}/>
          <Slider label="Current Value (FV)" value={fv} min={pv+1} softMax={100000000} step={1000} isCurrency showWords accent={A1} onChange={v=>setFv(Math.max(v,pv+1))}/>
          <Slider label="Holding Period" value={yrs} min={0.5} softMax={50} step={0.5} suffix=" yrs" accent={A3} onChange={setYrs}/>
        </InputSection>
      </InputPanel>
      <ResultPanel>
        <KGrid cols={4}>
          <KCard label="CAGR" value={cagr.toFixed(2)+"%"} raw={0} color={A1} icon="📈" tip="Compound Annual Growth Rate"/>
          <KCard label="Absolute Return" value={((fv/pv-1)*100).toFixed(1)+"%"} raw={0} color={A4} icon="⚡" tip="Total % gain"/>
          <KCard label="Profit" value={fmt(fv-pv)} raw={fv-pv} color={A2} icon="💰" tip="Net profit"/>
          <KCard label="Doubles In" value={(72/cagr).toFixed(1)+" yrs"} raw={0} color={A5} icon="⏱️" tip="Rule of 72"/>
        </KGrid>
        <RCard title={`📊 Rate Comparison — ${fmt(pv)} over ${yrs} years`}>
          <ResponsiveContainer width="100%" height={220}><BarChart data={rates} margin={{top:4,right:4,left:0,bottom:0}}>
            <CartesianGrid stroke={th.border} vertical={false}/><XAxis dataKey="r" tick={{fill:th.muted,fontSize:10}} axisLine={false} tickLine={false}/><YAxis tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={fmtS}/><Tooltip content={<CTip/>}/>
            <Bar dataKey="val" name="Final Value" radius={[4,4,0,0]}>{rates.map((d,i)=><Cell key={i} fill={d.mine?A1:A2} opacity={d.mine?1:0.45}/>)}</Bar>
          </BarChart></ResponsiveContainer>
        </RCard>
        <InfoBox color={A1}>{fmt(pv)} → {fmt(fv)} in {yrs}yrs = <strong style={{color:A1}}>{cagr.toFixed(2)}% CAGR</strong></InfoBox>
      </ResultPanel>
    </div>
  );
}

function InflationPage(){
  const{th}=useContext(Ctx);
  const[amt,setAmt]=useState(50000);
  const[inf,setInf]=useState(6);
  const[yrs,setYrs]=useState(20);
  const fv=lsFV(amt,inf,yrs),pp=amt/Math.pow(1+inf/100,yrs);
  const chart=Array.from({length:yrs},(_,i)=>({y:"Y"+(i+1),fp:Math.round(lsFV(amt,inf,i+1)),pp:Math.round(amt/Math.pow(1+inf/100,i+1))}));
  const items=[{n:"Monthly Grocery (₹10K)",b:10000},{n:"School Fees/yr (₹50K)",b:50000},{n:"Hospital (₹1L)",b:100000},{n:"Car (₹8L)",b:800000},{n:"House (₹50L)",b:5000000}];
  return(
    <div style={{display:"flex",flex:1,minHeight:0,overflow:"hidden"}}>
      <InputPanel width={285}>
        <InputSection title="Inputs" icon="📉" color={A3} first>
          <Slider label="Amount Today" value={amt} min={1000} softMax={10000000} step={1000} isCurrency showWords accent={A3} onChange={setAmt} tip="Today's cost"/>
          <Slider label="Inflation Rate" value={inf} min={1} softMax={20} step={0.5} suffix="%" accent={A5} onChange={setInf} tip="Expected annual inflation"/>
          <Slider label="Years Ahead" value={yrs} min={1} softMax={50} step={1} suffix=" yrs" accent={A4} onChange={setYrs} tip="Projection horizon"/>
        </InputSection>
        <InputSection title="Common Items" icon="🛒" color={A5}>
          {items.map(it=>(
            <div key={it.n} style={{marginBottom:9,padding:"8px 10px",background:th.card,border:`1px solid ${th.border}`,borderRadius:8}}>
              <div style={{fontSize:11,color:th.sub,marginBottom:3}}>{it.n}</div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:10,color:th.muted}}>In {yrs}yrs:</span><strong style={{fontSize:12,color:A3}}>{fmt(lsFV(it.b,inf,yrs))}</strong></div>
            </div>
          ))}
        </InputSection>
      </InputPanel>
      <ResultPanel>
        <KGrid cols={3}>
          <KCard label={`${fmt(amt)} will cost`} value={fmt(fv)} raw={fv} color={A3} icon="📈" sub={`In ${yrs} years`} tip="Future cost"/>
          <KCard label="Purchasing Power" value={fmt(pp)} raw={pp} color={A5} icon="💸" sub="Today's real value" tip="What your money buys"/>
          <KCard label="Value Erosion" value={((1-pp/amt)*100).toFixed(0)+"%"} raw={0} color={A3} icon="📉" warn tip="Buying power lost"/>
        </KGrid>
        <RCard title="Future Price vs Purchasing Power">
          <ResponsiveContainer width="100%" height={260}><LineChart data={chart} margin={{top:4,right:4,left:0,bottom:0}}>
            <CartesianGrid stroke={th.border} vertical={false}/><XAxis dataKey="y" tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} interval="preserveStartEnd"/><YAxis tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={fmtS}/><Tooltip content={<CTip/>}/>
            <Line type="monotone" dataKey="fp" name="Future Price" stroke={A3} strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="pp" name="Purchasing Power" stroke={A1} strokeWidth={2} dot={false} strokeDasharray="5 3"/>
          </LineChart></ResponsiveContainer>
        </RCard>
        <InfoBox color={A3}>At {inf}% inflation: {fmt(amt)} today costs <strong style={{color:A3}}>{fmt(fv)}</strong> in {yrs}yrs. Invest at {inf+3}%+ to beat inflation.</InfoBox>
      </ResultPanel>
    </div>
  );
}

function TaxPage(){
  const{th}=useContext(Ctx);
  const[inc,setInc]=useState(1200000);
  const[s80c,setS80c]=useState(150000);
  const[nps,setNps]=useState(50000);
  const[hra,setHra]=useState(120000);
  const[med,setMed]=useState(25000);
  const[hl,setHl]=useState(0);
  const calcOld=gross=>{const ded=50000+Math.min(s80c,150000)+Math.min(nps,50000)+Math.min(hra,gross*0.5)+Math.min(med,25000)+Math.min(hl,200000);const ti=Math.max(0,gross-ded);const slabs=[[250000,0],[250000,0.05],[500000,0.2],[Infinity,0.3]];let tax=0,rem=Math.max(0,ti-250000);for(const[s,r]of slabs){if(rem<=0)break;const c=Math.min(rem,s);tax+=c*r;rem-=c;}if(ti<=500000)tax=0;return{tax:Math.round(tax*1.04),ti,ded};};
  const calcNew=gross=>{const slabs=[[300000,0],[300000,0.05],[300000,0.1],[300000,0.15],[300000,0.2],[Infinity,0.3]];let tax=0,rem=Math.max(0,gross-300000);for(const[s,r]of slabs){if(rem<=0)break;const c=Math.min(rem,s);tax+=c*r;rem-=c;}if(gross<=700000)tax=0;return Math.round(tax*1.04);};
  const old=calcOld(inc),newT=calcNew(inc),saves=old.tax-newT,better=saves>0?"old":"new";
  return(
    <div style={{display:"flex",flex:1,minHeight:0,overflow:"hidden"}}>
      <InputPanel width={305}>
        <InputSection title="Income" icon="💵" color={A1} first><Slider label="Gross Annual Income" value={inc} min={250000} softMax={10000000} step={25000} isCurrency showWords accent={A1} onChange={setInc} tip="Total annual income"/></InputSection>
        <InputSection title="Old Regime Deductions" icon="📋" color={A2}>
          <Slider label="80C — PF / ELSS / LIC" value={s80c} min={0} softMax={150000} step={5000} isCurrency accent={A2} onChange={setS80c} tip="Max ₹1.5L"/>
          <Slider label="80CCD(1B) — NPS" value={nps} min={0} softMax={50000} step={5000} isCurrency accent={A4} onChange={setNps} tip="Max ₹50K"/>
          <Slider label="HRA Exemption" value={hra} min={0} softMax={600000} step={5000} isCurrency accent={A3} onChange={setHra} tip="HRA received"/>
          <Slider label="Home Loan Interest" value={hl} min={0} softMax={200000} step={10000} isCurrency accent={A5} onChange={setHl} tip="Sec 24b, max ₹2L"/>
          <Slider label="80D — Medical Ins." value={med} min={0} softMax={75000} step={5000} isCurrency accent={A6} onChange={setMed} tip="Health insurance"/>
        </InputSection>
      </InputPanel>
      <ResultPanel>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[{l:"Old Regime",tax:old.tax,ti:old.ti,c:A3,id:"old"},{l:"New Regime",tax:newT,ti:Math.max(0,inc-300000),c:A2,id:"new"}].map(r=>(
            <div key={r.l} style={{background:th.card,border:`2px solid ${better===r.id?A1+"44":th.border}`,borderRadius:13,padding:"16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                <div style={{fontWeight:700,fontSize:14,color:th.text}}>{r.l}</div>
                {better===r.id&&<span style={{fontSize:10,color:A1,background:`${A1}15`,padding:"3px 9px",borderRadius:10,fontWeight:700}}>✓ Better</span>}
              </div>
              {[{l:"Taxable Income",v:r.ti},{l:"Tax Payable",v:r.tax,bold:true},{l:"Effective Rate",s:(r.tax/inc*100).toFixed(1)+"%"}].map(it=>(
                <div key={it.l} style={{display:"flex",justifyContent:"space-between",marginBottom:8,paddingBottom:8,borderBottom:`1px solid ${th.border}`}}>
                  <span style={{fontSize:11,color:th.sub}}>{it.l}</span>
                  <div style={{textAlign:"right"}}><span style={{fontSize:12,fontWeight:it.bold?800:500,color:it.bold?r.c:th.text}}>{it.s||fmt(it.v)}</span>{it.v>0&&<Words n={it.v}/>}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <KGrid cols={3}>
          <KCard label="Old Regime Tax" value={fmt(old.tax)} raw={old.tax} color={A3} icon="📋" tip="Tax under old regime"/>
          <KCard label="New Regime Tax" value={fmt(newT)} raw={newT} color={A2} icon="📋" tip="Tax under new regime"/>
          <KCard label="You Save" value={fmt(Math.abs(saves))} raw={Math.abs(saves)} color={A1} icon="🎉" sub={`Use ${better==="old"?"Old":"New"} regime`} tip="Annual savings"/>
        </KGrid>
        <InfoBox color={A1}>For ₹{(inc/100000).toFixed(1)}L: <strong style={{color:better==="old"?A3:A2}}>{better==="old"?"Old":"New"} Regime saves ₹{Math.abs(saves).toLocaleString("en-IN")}/yr</strong>. {better==="old"?"Max out 80C + NPS + health insurance.":"New regime simplifies filing."}</InfoBox>
      </ResultPanel>
    </div>
  );
}
function GoalCard({gk,goals,ret}){
  const{th}=useContext(Ctx);
  const p=goals[gk];
  const[cost,setCost]=useState(p.cost);
  const[yrs,setYrs]=useState(p.yrs);
  const[inf,setInf]=useState(p.inf);
  const[open,setOpen]=useState(true);
  const fv=lsFV(cost,inf,yrs),sipN=sipReq(fv,ret,yrs*12),lump=fv/Math.pow(1+ret/100,yrs);
  return(
    <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:13,marginBottom:4}}>
      <div onClick={()=>setOpen(!open)} style={{display:"flex",justifyContent:"space-between",padding:"13px 16px",cursor:"pointer",background:open?`${p.c}07`:"transparent",borderBottom:open?`1px solid ${th.border}`:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>{p.icon}</span>
          <div>
            <div style={{fontWeight:700,fontSize:13,color:th.text}}>{p.l}</div>
            <div style={{fontSize:10,color:th.muted}}>{fmt(cost)} today → <strong style={{color:p.c}}>{fmt(fv)}</strong> in {yrs}yrs</div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontWeight:800,fontSize:14,color:p.c}}>{fmt(sipN)}<span style={{fontSize:10,color:th.muted}}>/mo</span></div>
          <div style={{fontSize:9,color:th.muted}}>SIP NEEDED</div>
        </div>
      </div>
      {open&&(
        <div style={{padding:"14px 16px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
            <Slider label="Present Cost" value={cost} min={10000} softMax={20000000} step={10000} isCurrency showWords accent={p.c} onChange={setCost}/>
            <Slider label="Years to Goal" value={yrs} min={1} softMax={30} step={1} suffix=" yrs" accent={p.c} onChange={setYrs}/>
            <Slider label="Inflation" value={inf} min={2} softMax={20} step={0.5} suffix="%" accent={p.c} onChange={setInf}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[{l:"Future Goal",v:fv,c:p.c},{l:"Monthly SIP",v:sipN,c:A1},{l:"Lump Sum Now",v:lump,c:A2}].map(it=>(
              <div key={it.l} style={{background:th.tag,border:`1px solid ${th.border}`,borderRadius:9,padding:"10px"}}>
                <div style={{fontSize:9,color:th.muted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>{it.l}</div>
                <div style={{fontWeight:800,fontSize:14,color:it.c}}>{fmt(it.v)}</div>
                <Words n={it.v}/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KidsPage(){
  const{th}=useContext(Ctx);
  const[ret,setRet]=useState(12);
  const[active,setActive]=useState(["school","college","marriage"]);
  const GOALS={school:{l:"Higher School",icon:"🎒",cost:300000,yrs:8,inf:8,c:A2},college:{l:"College Education",icon:"🎓",cost:2000000,yrs:15,inf:10,c:A1},marriage:{l:"Marriage",icon:"💍",cost:4000000,yrs:22,inf:7,c:A3},study:{l:"Study Abroad",icon:"✈️",cost:5000000,yrs:18,inf:6,c:A4},startup:{l:"Startup Fund",icon:"🚀",cost:2000000,yrs:20,inf:5,c:A5}};
  const toggle=k=>setActive(a=>a.includes(k)?a.filter(x=>x!==k):[...a,k]);
  return(
    <div style={{display:"flex",flex:1,minHeight:0,overflow:"hidden"}}>
      <InputPanel width={240}>
        <InputSection title="Return Rate" icon="📈" color={A1} first><Slider label="Expected Return p.a." value={ret} min={4} softMax={25} step={0.5} suffix="%" accent={A1} onChange={setRet} tip="Annual return on investments"/></InputSection>
        <InputSection title="Select Goals" icon="🎯" color={A4}>
          {Object.entries(GOALS).map(([k,v])=>{const on=active.includes(k);return(
            <button key={k} onClick={()=>toggle(k)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 10px",marginBottom:6,borderRadius:9,border:`1px solid ${on?v.c+"44":th.border}`,background:on?`${v.c}0d`:"transparent",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
              <span style={{fontSize:17}}>{v.icon}</span>
              <span style={{fontSize:12,color:on?th.text:th.sub,flex:1}}>{v.l}</span>
              <span style={{color:on?v.c:th.muted,fontWeight:700}}>{on?"✓":"+"}</span>
            </button>
          );})}
        </InputSection>
      </InputPanel>
      <ResultPanel>
        {active.length===0
          ?<div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:th.muted,gap:10}}><span style={{fontSize:48}}>🎯</span><span style={{fontSize:13}}>Select goals from the panel</span></div>
          :active.map(k=><GoalCard key={k} gk={k} goals={GOALS} ret={ret}/>)
        }
      </ResultPanel>
    </div>
  );
}

function PlanPage(){
  const{th,a}=useContext(Ctx);
  const accent=a||A1;
  const[curAge,setCurAge]=useState(30);
  const[retAge,setRetAge]=useState(60);
  const[lifeExp,setLifeExp]=useState(85);
  const[life,setLife]=useState("comfortable");
  const[expense,setExpense]=useState(40000);
  const[income,setIncome]=useState(80000);
  const[inf,setInf]=useState(6);
  const[corpus,setCorpus]=useState(500000);
  const[sip,setSip]=useState(10000);
  const[retRate,setRetRate]=useState(12);
  const lifeMult={frugal:0.7,comfortable:1.0,lavish:1.5};
  const yrs=Math.max(1,retAge-curAge),retYrs=Math.max(1,lifeExp-retAge);
  const adjExp=expense*lifeMult[life];
  const rr=Math.max(0.001,realR(retRate,inf)/100);
  const futMonthly=Math.round(adjExp*Math.pow(1+inf/100,yrs));
  const futYearly=futMonthly*12;
  const corpNeeded=futYearly/rr;
  const fvCorpus=lsFV(corpus,retRate,yrs),fvSip=sipFV(sip,retRate,yrs*12),totalFV=fvCorpus+fvSip;
  const gap=corpNeeded-totalFV,addSip=gap>0?Math.max(0,sipReq(gap,retRate,yrs*12)):0;
  const safeWd=Math.round(totalFV*rr/12),fire=Math.min(100,Math.round((totalFV/corpNeeded)*100));
  const fireC=fire>=80?A1:fire>=50?A5:A3,earlyOk=totalFV>=corpNeeded;
  const simData=useMemo(()=>{
    const total=yrs+retYrs;
    return Array.from({length:total},(_,i)=>{
      const y=i+1;let c;
      if(y<=yrs){c=lsFV(corpus,retRate,y)+sipFV(sip,retRate,y*12);}
      else{const yt=y-yrs,mr=(retRate-2)/100/12;let b=totalFV,wd=safeWd;for(let m=0;m<yt*12;m++){b=b*(1+mr)-wd;if(b<0)b=0;if(m%12===0)wd*=1.05;}c=Math.max(0,b);}
      return{age:curAge+y,corp:Math.round(c),tgt:Math.round(corpNeeded)};
    });
  },[corpus,sip,retRate,yrs,retYrs,corpNeeded,safeWd,curAge]);
  const LBtn=({id,icon,label,sub})=>{const sel=life===id;return(
    <button onClick={()=>setLife(id)} style={{flex:1,padding:"10px 6px",borderRadius:10,cursor:"pointer",textAlign:"center",border:`1.5px solid ${sel?A4:th.border}`,background:sel?`${A4}12`:th.card,transition:"all 0.18s"}}>
      <div style={{fontSize:20,marginBottom:4}}>{icon}</div>
      <div style={{fontSize:11,fontWeight:sel?700:500,color:sel?A4:th.text}}>{label}</div>
      <div style={{fontSize:9,color:th.muted,marginTop:2}}>{sub}</div>
    </button>
  );};
  return(
    <div style={{display:"flex",flex:1,minHeight:0,overflow:"hidden"}}>
      <InputPanel width={320}>
        <InputSection title="Retirement Basics" icon="🗓️" color={A2} first>
          <Slider label="Your Current Age" value={curAge} min={18} softMax={65} step={1} suffix=" yrs" accent={A2} onChange={v=>{setCurAge(v);if(v>=retAge)setRetAge(v+5);}} tip="Your age today"/>
          <Slider label="Target Retirement Age" value={retAge} min={curAge+1} softMax={75} step={1} suffix=" yrs" accent={accent} onChange={v=>{setRetAge(v);if(v>=lifeExp)setLifeExp(v+5);}} tip="When you want to stop working"/>
          <Slider label="Life Expectancy" value={lifeExp} min={retAge+1} softMax={100} step={1} suffix=" yrs" accent={A5} onChange={setLifeExp} tip="Planning horizon"/>
          <div style={{marginBottom:18}}>
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.07em",color:th.muted,marginBottom:8}}>Retirement Lifestyle</div>
            <div style={{display:"flex",gap:7}}><LBtn id="frugal" icon="🌿" label="Frugal" sub="0.7×"/><LBtn id="comfortable" icon="🏡" label="Comfortable" sub="1×"/><LBtn id="lavish" icon="✈️" label="Lavish" sub="1.5×"/></div>
          </div>
        </InputSection>
        <InputSection title="Income & Expenses" icon="💼" color={A3}>
          <Slider label="Present Monthly Expenses" value={expense} min={5000} softMax={300000} step={1000} isCurrency showWords accent={A3} onChange={setExpense} tip="Current monthly spending"/>
          <Slider label="Present Monthly Income" value={income} min={10000} softMax={1000000} step={5000} isCurrency showWords accent={A4} onChange={setIncome} tip="Current take-home income"/>
          <Slider label="Expected Inflation Rate" value={inf} min={2} softMax={15} step={0.5} suffix="%" accent={A5} onChange={setInf} tip="India avg 5-8%"/>
        </InputSection>
        <InputSection title="Current Investments" icon="📈" color={A1}>
          <Slider label="Existing Corpus / Portfolio" value={corpus} min={0} softMax={50000000} step={50000} isCurrency showWords accent={A2} onChange={setCorpus} tip="Current investments"/>
          <Slider label="Monthly SIP" value={sip} min={0} softMax={200000} step={500} isCurrency showWords accent={A1} onChange={setSip} tip="Monthly investment today"/>
          <Slider label="Expected Return p.a." value={retRate} min={4} softMax={20} step={0.5} suffix="%" accent={A1} onChange={setRetRate} tip="Equity ~12%, Balanced ~10%"/>
        </InputSection>
      </InputPanel>
      <ResultPanel>
        <RCard title="📊 Result 1 — Future Expense Requirement">
          <div style={{fontSize:11,color:th.muted,marginBottom:12,lineHeight:1.7}}>Your <strong style={{color:th.text}}>{fmt(expense)}/mo</strong> expenses at <strong style={{color:A3}}>{inf}%</strong> inflation for <strong style={{color:A2}}>{yrs} years</strong>, with <strong style={{color:A4}}>{life}</strong> lifestyle:</div>
          <KGrid cols={3}>
            <KCard label="Monthly at Retirement" value={fmt(futMonthly)} raw={futMonthly} color={A3} icon="📅" tip="Inflated monthly expenses"/>
            <KCard label="Yearly at Retirement" value={fmt(futYearly)} raw={futYearly} color={A5} icon="📆" tip="Annual expense at retirement"/>
            <KCard label="Corpus Required" value={fmt(corpNeeded)} raw={corpNeeded} color={A1} icon="🎯" tip="Total corpus needed"/>
          </KGrid>
          <div style={{marginTop:12,padding:"10px 13px",background:`${A3}08`,border:`1px solid ${A3}20`,borderRadius:9,fontSize:11,color:th.sub,lineHeight:1.8}}>To sustain <strong style={{color:A3}}>{fmt(futMonthly)}/mo</strong> in retirement, you need <strong style={{color:A1}}>{fmt(corpNeeded)}</strong>.<Words n={corpNeeded}/></div>
        </RCard>
        <RCard title="📈 Result 2 — Future Value of Your Investments">
          <div style={{fontSize:11,color:th.muted,marginBottom:12,lineHeight:1.7}}>Your investments at <strong style={{color:A1}}>{retRate}%</strong> return over <strong style={{color:A2}}>{yrs} years</strong>:</div>
          <KGrid cols={2}>
            <KCard label="Corpus Growth" value={fmt(fvCorpus)} raw={fvCorpus} color={A2} icon="💰" tip="Existing corpus compounded"/>
            <KCard label="SIP Corpus" value={fmt(fvSip)} raw={fvSip} color={A1} icon="📅" tip="SIP contributions compounded"/>
          </KGrid>
          <div style={{marginTop:14}}>
            {[{l:"Corpus Growth",v:fvCorpus,c:A2},{l:"SIP Contributions",v:fvSip,c:A1}].map(b=>(
              <div key={b.l} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:9,height:9,borderRadius:2,background:b.c}}/><span style={{fontSize:11,color:th.sub}}>{b.l}</span></div>
                  <span style={{fontSize:11,fontWeight:700,color:b.c}}>{fmt(b.v)} ({totalFV>0?(b.v/totalFV*100).toFixed(0):0}%)</span>
                </div>
                <div style={{height:6,background:th.track,borderRadius:99}}><div style={{height:"100%",width:(totalFV>0?b.v/totalFV*100:0)+"%",background:b.c,borderRadius:99,transition:"width 0.5s"}}/></div>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:10,borderTop:`1px solid ${th.border}`}}>
              <span style={{fontSize:12,fontWeight:700,color:th.text}}>Total Corpus at Retirement</span>
              <div style={{textAlign:"right"}}><div style={{fontWeight:800,fontSize:18,color:earlyOk?A1:A3}}>{fmt(totalFV)}</div><Words n={totalFV}/></div>
            </div>
          </div>
        </RCard>
        <div style={{background:th.card,border:`1.5px solid ${fireC}30`,borderRadius:14,padding:"18px 20px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-30,right:-30,width:150,height:150,borderRadius:"50%",background:`radial-gradient(circle,${fireC}18 0%,transparent 70%)`}}/>
          <div style={{display:"flex",gap:20,alignItems:"center",position:"relative"}}>
            <div style={{position:"relative",width:96,height:96,flexShrink:0}}>
              <svg viewBox="0 0 120 120" width={96} height={96} style={{transform:"rotate(-90deg)"}}>
                <circle cx={60} cy={60} r={48} fill="none" stroke={th.track} strokeWidth={10}/>
                <circle cx={60} cy={60} r={48} fill="none" stroke={fireC} strokeWidth={10} strokeDasharray={`${fire/100*2*Math.PI*48} ${2*Math.PI*48}`} strokeLinecap="round"/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontWeight:800,fontSize:24,color:fireC,lineHeight:1}}>{fire}</div>
                <div style={{fontSize:8,color:th.muted,letterSpacing:"0.1em",fontWeight:700}}>FIRE SCORE</div>
              </div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:16,color:th.text,marginBottom:6}}>{earlyOk?"🎉 Your retirement plan is on track!":"📋 Action needed to reach your goal"}</div>
              <div style={{fontSize:12,color:th.sub,lineHeight:1.8}}>{earlyOk?`Corpus ${fmt(totalFV)} exceeds the ${fmt(corpNeeded)} needed. Safe withdrawal: ${fmt(safeWd)}/mo.`:`Need ${fmt(corpNeeded)} but building ${fmt(totalFV)}. Invest ${fmt(addSip)}/mo extra to close ${fmt(gap)} gap.`}</div>
            </div>
          </div>
        </div>
        <KGrid cols={4}>
          <KCard label="Years to Retire" value={yrs+"y"} raw={0} color={A2} icon="⏳" sub={`Age ${curAge}→${retAge}`} tip="Time to build corpus"/>
          <KCard label="Extra SIP Needed" value={addSip>0?fmt(addSip)+"/mo":"None ✅"} raw={addSip} color={addSip>0?A3:A1} icon="📅" warn={addSip>0} tip="Additional monthly investment"/>
          <KCard label="Monthly Surplus" value={fmt(Math.abs(income-expense-sip))} raw={Math.abs(income-expense-sip)} color={(income-expense-sip)>=0?A1:A3} icon="💼" warn={(income-expense-sip)<0} tip="Income minus expenses minus SIP"/>
          <KCard label="Corpus Gap" value={gap>0?fmt(gap):"Surplus ✅"} raw={Math.max(0,gap)} color={gap>0?A3:A1} icon="🎯" warn={gap>0} tip="Gap to close"/>
        </KGrid>
        <RCard title="📈 Lifetime Portfolio Simulation">
          <ResponsiveContainer width="100%" height={210}><AreaChart data={simData} margin={{top:6,right:8,left:0,bottom:0}}>
            <defs><linearGradient id="rpg1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={A1} stopOpacity={0.2}/><stop offset="95%" stopColor={A1} stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid stroke={th.border} vertical={false} strokeDasharray="3 3"/>
            <XAxis dataKey="age" tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} interval={Math.max(1,Math.floor(simData.length/12))}/>
            <YAxis tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={fmtS} width={44}/>
            <Tooltip content={<CTip/>}/>
            <Area type="monotone" dataKey="corp" name="Portfolio" stroke={A1} strokeWidth={2.5} fill="url(#rpg1)" dot={false}/>
            <Line type="monotone" dataKey="tgt" name="Target" stroke={A3} strokeWidth={1.5} dot={false} strokeDasharray="6 3"/>
          </AreaChart></ResponsiveContainer>
        </RCard>
      </ResultPanel>
    </div>
  );
}
function AuthScreen({onLogin,onBack}){
  const{th}=useContext(Ctx);
  const[mode,setMode]=useState("login");
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[name,setName]=useState("");
  const[err,setErr]=useState("");
  const[loading,setLoading]=useState(false);
  const inp={width:"100%",marginTop:5,padding:"11px 13px",background:th.inputBg,border:`1px solid ${th.border}`,borderRadius:9,color:th.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
  const submit=()=>{setErr("");setLoading(true);setTimeout(()=>{setLoading(false);if(mode==="login"){const u=DB.users[email.toLowerCase()];if(!u){setErr("Account not found. Use demo credentials below.");return;}if(u.password!==pass){setErr("Incorrect password.");return;}onLogin({email:email.toLowerCase(),...u});}else{if(!name.trim()){setErr("Please enter your name");return;}if(!email.includes("@")){setErr("Enter a valid email");return;}if(pass.length<6){setErr("Password must be 6+ chars");return;}const nu={name:name.trim(),password:pass,plan:"free",avatar:name.trim()[0].toUpperCase(),joined:new Date().toLocaleDateString("en-IN",{month:"short",year:"numeric"}),prefs:{dark:false}};DB.users[email.toLowerCase()]=nu;onLogin({email:email.toLowerCase(),...nu});}},800);};
  return(
    <div style={{minHeight:"100vh",display:"flex",background:th.bg,fontFamily:"system-ui,sans-serif"}}>
      <div style={{flex:1,background:"linear-gradient(160deg,#060e1a 0%,#091520 55%,#05100c 100%)",display:"flex",flexDirection:"column",justifyContent:"center",padding:"60px 52px",position:"relative"}}>
        <div style={{position:"absolute",top:"15%",left:"5%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(16,185,129,0.12) 0%,transparent 65%)",pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:48}}>
            <div style={{width:38,height:38,borderRadius:11,background:"linear-gradient(135deg,#10b981,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:"#fff"}}>₹</div>
            <div><div style={{fontWeight:800,fontSize:18,color:"#f1f5f9"}}>FinPulse</div><div style={{fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:"0.08em"}}>YOUR FINANCIAL COMPANION</div></div>
          </div>
          <div style={{fontSize:80,color:"#10b981",lineHeight:0.7,opacity:0.18,marginBottom:20}}>"</div>
          <p style={{fontWeight:700,fontSize:22,color:"#e8f0f8",lineHeight:1.6,marginBottom:20,maxWidth:440}}>Every rupee you invest today is a soldier working for your future.</p>
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>{["📊 10 Calculators","💾 Named Plans","📝 Notes","🔒 100% Private"].map(t=><span key={t} style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>{t}</span>)}</div>
        </div>
      </div>
      <div style={{width:460,background:th.bg,display:"flex",flexDirection:"column",justifyContent:"center",padding:"52px 44px",position:"relative"}}>
        <button onClick={onBack} style={{position:"absolute",top:20,left:20,padding:"6px 12px",borderRadius:8,border:`1px solid ${th.border}`,background:"transparent",color:th.sub,fontSize:12,cursor:"pointer"}}>← Back</button>
        <div style={{textAlign:"center",marginBottom:24}}><div style={{fontWeight:800,fontSize:22,color:th.text,marginBottom:6}}>Welcome to FinPulse</div><div style={{fontSize:13,color:th.sub}}>Your personal financial command centre</div></div>
        <div style={{display:"flex",gap:3,background:th.toggleBg,borderRadius:10,padding:3,marginBottom:20}}>
          {[{id:"login",l:"Sign In"},{id:"register",l:"Create Account"}].map(t=>(
            <button key={t.id} onClick={()=>{setMode(t.id);setErr("");}} style={{flex:1,padding:"9px",borderRadius:7,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:mode===t.id?A1:"transparent",color:mode===t.id?"#fff":th.sub}}>{t.l}</button>
          ))}
        </div>
        {mode==="register"&&<div style={{marginBottom:13}}><label style={{fontSize:11,color:th.sub,textTransform:"uppercase",letterSpacing:"0.06em"}}>Your Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Arjun Sharma" style={inp}/></div>}
        <div style={{marginBottom:13}}><label style={{fontSize:11,color:th.sub,textTransform:"uppercase",letterSpacing:"0.06em"}}>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" type="email" style={inp}/></div>
        <div style={{marginBottom:20}}><label style={{fontSize:11,color:th.sub,textTransform:"uppercase",letterSpacing:"0.06em"}}>Password</label><input value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" type="password" onKeyDown={e=>e.key==="Enter"&&submit()} style={inp}/></div>
        {err&&<div style={{padding:"9px 12px",background:th.warn,border:`1px solid ${th.warnB}`,borderRadius:8,fontSize:12,color:A3,marginBottom:14}}>{err}</div>}
        <button onClick={submit} disabled={loading} style={{width:"100%",padding:"13px",borderRadius:10,border:"none",cursor:"pointer",fontSize:14,fontWeight:700,background:"linear-gradient(135deg,#10b981,#0ea5e9)",color:"#fff",opacity:loading?0.7:1,boxShadow:"0 4px 20px rgba(16,185,129,0.3)"}}>
          {loading?"Authenticating…":mode==="login"?"Sign In →":"Create Account →"}
        </button>
        <div style={{marginTop:16,padding:"12px",background:th.tag,border:`1px solid ${th.border}`,borderRadius:9,textAlign:"center"}}>
          <div style={{fontSize:10,color:th.muted,marginBottom:4}}>Demo Credentials</div>
          <div style={{fontSize:12,color:th.sub}}>✦ PRO: pro@finpulse.app / demo1234</div>
          <div style={{fontSize:12,color:th.sub,marginTop:2}}>Free: free@finpulse.app / demo1234</div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({user,plans,onNav}){
  const{th}=useContext(Ctx);
  const isPro=user.plan==="pro";
  const tools=[{id:"sip",icon:"📈",l:"SIP Calculator",sub:"SIP & Lump Sum",free:true},{id:"swp",icon:"💸",l:"SWP Calculator",sub:"Withdrawals",free:true},{id:"emi",icon:"🏠",l:"EMI Calculator",sub:"Loans",free:true},{id:"ppf",icon:"🏛️",l:"PPF Calculator",sub:"Fixed Income",free:true},{id:"cagr",icon:"📊",l:"CAGR Analyser",sub:"Returns",free:true},{id:"cagrret",icon:"📐",l:"Know CAGR Return",sub:"Find your CAGR",free:true},{id:"infl",icon:"📉",l:"Inflation Impact",sub:"Purchasing Power",free:true},{id:"plan",icon:"🗺️",l:"Retirement Planner",sub:"FIRE Planning",free:false},{id:"tax",icon:"🧾",l:"Tax Optimiser",sub:"Old vs New",free:false},{id:"kids",icon:"👶",l:"Kid's Future",sub:"Goal Planning",free:false}];
  return(
    <div style={{padding:"22px 26px",overflowY:"auto",flex:1,minHeight:0}}>
      <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:16,padding:"22px 24px",marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:10,color:th.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>Welcome back</div>
            <div style={{fontWeight:800,fontSize:22,color:th.text}}>Good day, {user.name.split(" ")[0]} 👋</div>
            <div style={{fontSize:12,color:th.sub,marginTop:4}}>Every number you need. Every goal tracked.</div>
          </div>
          {isPro?<div style={{padding:"7px 16px",background:"linear-gradient(135deg,#d97706,#f59e0b)",borderRadius:20,fontSize:12,fontWeight:800,color:"#000"}}>✦ PRO MEMBER</div>:<button onClick={()=>onNav("pricing")} style={{padding:"7px 16px",background:`linear-gradient(135deg,${A5},#fbbf24)`,borderRadius:20,fontSize:12,fontWeight:800,color:"#000",border:"none",cursor:"pointer"}}>Upgrade to Pro →</button>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginTop:18}}>
          {[{l:"Plans Saved",v:plans.length,icon:"📁",c:A2},{l:"Member Since",v:user.joined,icon:"📅",c:A4},{l:"Account",v:isPro?"Pro":"Free",icon:"⭐",c:A5},{l:"Calculators",v:"10",icon:"📊",c:A1}].map(s=>(
            <div key={s.l} style={{background:th.tag,border:`1px solid ${th.border}`,borderRadius:12,padding:"11px 13px"}}>
              <div style={{fontSize:17,marginBottom:4}}>{s.icon}</div>
              <div style={{fontWeight:700,fontSize:15,color:s.c}}>{s.v}</div>
              <div style={{fontSize:9,color:th.muted,marginTop:1}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{fontWeight:700,fontSize:13,color:th.text,marginBottom:12}}>All Tools</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:9,marginBottom:20}}>
        {tools.map(t=>{const ok=t.free||isPro;return(
          <Tip key={t.id} text={ok?`Open ${t.l}`:"Upgrade to Pro"}>
            <div onClick={()=>ok?onNav(t.id):onNav("pricing")} style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:11,padding:"13px 10px",cursor:"pointer",textAlign:"center",opacity:ok?1:0.7,transition:"all 0.18s",position:"relative",overflow:"hidden"}}
              onMouseOver={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.1)";}}
              onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
              {!t.free&&!isPro&&<div style={{position:"absolute",top:5,right:5,fontSize:7,background:"linear-gradient(90deg,#f59e0b,#fbbf24)",color:"#000",padding:"2px 5px",borderRadius:8,fontWeight:800}}>PRO</div>}
              <div style={{fontSize:22,marginBottom:5}}>{t.icon}</div>
              <div style={{fontSize:11,fontWeight:600,color:th.text,lineHeight:1.3}}>{t.l}</div>
              <div style={{fontSize:9,color:th.muted,marginTop:2}}>{t.sub}</div>
            </div>
          </Tip>
        );})}
      </div>
      {plans.length>0&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontWeight:700,fontSize:13,color:th.text}}>Recent Plans</div>
            <button onClick={()=>onNav("plans")} style={{fontSize:11,color:A2,background:"none",border:"none",cursor:"pointer"}}>View all →</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9}}>
            {plans.slice(0,3).map(p=>(
              <div key={p.id} onClick={()=>onNav("plans")} style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:12,padding:"13px",cursor:"pointer",transition:"all 0.18s"}}
                onMouseOver={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"} onMouseOut={e=>e.currentTarget.style.boxShadow="none"}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:18}}>📁</span><span style={{fontSize:10,color:th.muted}}>{p.date}</span></div>
                <div style={{fontWeight:600,fontSize:13,color:th.text,marginBottom:1}}>{p.name}</div>
                <div style={{fontSize:10,color:th.muted,marginBottom:6}}>{p.page?.toUpperCase()}</div>
                <div style={{height:4,background:th.track,borderRadius:99}}><div style={{height:"100%",background:`linear-gradient(90deg,${A2},${A1})`,borderRadius:99,width:(p.progress||0)+"%"}}/></div>
                <div style={{fontSize:10,color:A1,marginTop:3,fontWeight:600}}>{p.progress||0}% complete</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlansPage({plans,storage,onNav}){
  const{th}=useContext(Ctx);
  const[local,setLocal]=useState(plans);
  useEffect(()=>setLocal(plans),[plans]);
  const del=id=>{storage.delPlan(id);setLocal(storage.getPlans());};
  const dup=id=>{storage.dupPlan(id);setLocal(storage.getPlans());};
  const icons={sip:"📈",swp:"💸",emi:"🏠",plan:"🗺️",kids:"👶",tax:"🧾",cagr:"📊",ppf:"🏛️",infl:"📉",cagrret:"📐"};
  return(
    <div style={{padding:"22px 26px",overflowY:"auto",flex:1,minHeight:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><div style={{fontWeight:800,fontSize:18,color:th.text}}>My Saved Plans</div><div style={{fontSize:12,color:th.muted,marginTop:2}}>{local.length} plans saved</div></div>
        <button onClick={()=>onNav("sip")} style={{padding:"9px 18px",borderRadius:10,border:"none",cursor:"pointer",background:A1,color:"#fff",fontSize:13,fontWeight:600}}>+ New Plan</button>
      </div>
      {local.length===0
        ?<div style={{textAlign:"center",padding:"60px",background:th.card,border:`1px dashed ${th.border}`,borderRadius:14}}><div style={{fontSize:40}}>📁</div><div style={{fontSize:14,color:th.sub,marginTop:10}}>No plans yet. Save any calculation to track it here.</div></div>
        :<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
          {local.map(p=>(
            <div key={p.id} style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"16px",transition:"all 0.18s"}}
              onMouseOver={e=>e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.08)"} onMouseOut={e=>e.currentTarget.style.boxShadow="none"}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{width:36,height:36,borderRadius:10,background:`${A1}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icons[p.page]||"📁"}</div>
                  <div><div style={{fontWeight:700,fontSize:13,color:th.text}}>{p.name}</div><div style={{fontSize:10,color:th.muted}}>{p.page?.toUpperCase()} · {p.date}</div></div>
                </div>
                <div style={{display:"flex",gap:4}}>
                  <Tip text="Duplicate"><button onClick={()=>dup(p.id)} style={{padding:"4px 8px",borderRadius:7,border:`1px solid ${th.border}`,background:"transparent",color:th.sub,fontSize:11,cursor:"pointer"}}>⧉</button></Tip>
                  <Tip text="Delete"><button onClick={()=>del(p.id)} style={{padding:"4px 8px",borderRadius:7,border:"none",background:"transparent",color:th.muted,fontSize:11,cursor:"pointer"}} onMouseOver={e=>e.currentTarget.style.color=A3} onMouseOut={e=>e.currentTarget.style.color=th.muted}>✕</button></Tip>
                </div>
              </div>
              {p.notes&&<div style={{fontSize:11,color:th.sub,fontStyle:"italic",marginBottom:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>"{p.notes}"</div>}
              <div style={{height:5,background:th.track,borderRadius:99}}><div style={{height:"100%",background:`linear-gradient(90deg,${A2},${A1})`,borderRadius:99,width:(p.progress||0)+"%"}}/></div>
              <div style={{fontSize:10,color:A1,marginTop:3,fontWeight:600}}>{p.progress||0}% complete</div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}

function SaveModal({page,onSave,onClose}){
  const{th}=useContext(Ctx);
  const[name,setName]=useState("");
  const[notes,setNotes]=useState("");
  const[progress,setProgress]=useState(0);
  const inp={width:"100%",marginTop:5,padding:"10px 12px",background:th.inputBg,border:`1px solid ${th.border}`,borderRadius:9,color:th.text,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
      <div style={{background:th.sidebar||th.card,border:`1px solid ${th.border}`,borderRadius:18,padding:"26px",width:400,boxShadow:"0 24px 60px rgba(0,0,0,0.3)"}}>
        <div style={{fontWeight:800,fontSize:16,color:th.text,marginBottom:16}}>💾 Save Plan</div>
        <div style={{marginBottom:13}}><label style={{fontSize:11,color:th.sub,textTransform:"uppercase",letterSpacing:"0.06em"}}>Plan Name *</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Home Loan 2026…" style={{...inp,border:`1px solid ${name?A1+"55":th.border}`}}/></div>
        <div style={{marginBottom:13}}><label style={{fontSize:11,color:th.sub,textTransform:"uppercase",letterSpacing:"0.06em"}}>Notes</label><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Key assumptions…" style={{...inp,height:68,resize:"none"}}/></div>
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><label style={{fontSize:11,color:th.sub,textTransform:"uppercase",letterSpacing:"0.06em"}}>Progress</label><span style={{fontSize:12,color:A1,fontWeight:700}}>{progress}%</span></div>
          <input type="range" min={0} max={100} step={5} value={progress} onChange={e=>setProgress(Number(e.target.value))} style={{width:"100%",accentColor:A1}}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:"10px",borderRadius:9,border:`1px solid ${th.border}`,background:"transparent",color:th.sub,fontSize:13,cursor:"pointer"}}>Cancel</button>
          <button onClick={()=>name.trim()&&onSave({id:Date.now(),name:name.trim(),notes,progress,page,date:new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}),time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})})} disabled={!name.trim()} style={{flex:2,padding:"10px",borderRadius:9,border:"none",background:name.trim()?A1:"#555",color:"#fff",fontSize:13,fontWeight:700,cursor:name.trim()?"pointer":"not-allowed"}}>Save →</button>
        </div>
      </div>
    </div>
  );
}

function PricingPage({user,onUpgrade}){
  const{th}=useContext(Ctx);
  const isPro=user.plan==="pro";
  const[billing,setBilling]=useState("monthly");
  const price=billing==="monthly"?199:149;
  const tiers=[
    {name:"Free",price:"₹0",period:"forever",accent:A4,features:["7 calculators","3 saved plans","Notes","CAGR vs XIRR guide","Light & dark mode"],cta:"Current Plan",disabled:true},
    {name:"Pro",price:`₹${price}`,period:billing==="yearly"?"/mo billed yearly":"/month",accent:A1,badge:"MOST POPULAR",features:["Everything in Free","✦ Retirement Planner","✦ Tax Optimiser","✦ Kid's Future Planner","✦ Unlimited plans","✦ Full personalisation","✦ App early access"],cta:isPro?"✓ Active":"Start Pro →"},
    {name:"Lifetime",price:"₹4,999",period:"one-time",accent:A5,badge:"BEST VALUE",features:["Everything in Pro — forever","✦ No recurring fees","✦ All future features","✦ Founding member badge","✦ Lifetime app access"],cta:isPro?"✓ Active":"Get Lifetime →"},
  ];
  return(
    <div style={{padding:"24px 28px",overflowY:"auto",flex:1,minHeight:0}}>
      {isPro&&<div style={{background:"linear-gradient(135deg,#d97706,#f59e0b)",borderRadius:13,padding:"13px 17px",marginBottom:18,display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:20}}>✦</span><div style={{fontWeight:800,fontSize:14,color:"#000"}}>You are a Pro Member — all features unlocked!</div></div>}
      <div style={{textAlign:"center",marginBottom:26}}>
        <div style={{fontWeight:800,fontSize:20,color:th.text,marginBottom:6}}>Simple, Transparent Pricing</div>
        <div style={{fontSize:13,color:th.sub,marginBottom:16}}>Upgrade when ready. Cancel anytime.</div>
        <div style={{display:"inline-flex",gap:3,background:th.toggleBg,borderRadius:10,padding:3}}>
          {[{id:"monthly",l:"Monthly"},{id:"yearly",l:"Yearly · Save ₹600"}].map(b=>(
            <button key={b.id} onClick={()=>setBilling(b.id)} style={{padding:"8px 18px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:billing===b.id?A1:"transparent",color:billing===b.id?"#fff":th.sub}}>{b.l}</button>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,maxWidth:860,margin:"0 auto"}}>
        {tiers.map(t=>(
          <div key={t.name} style={{background:t.badge==="MOST POPULAR"?`${A1}06`:th.card,border:`2px solid ${t.badge?t.accent+"44":th.border}`,borderRadius:18,padding:"22px",position:"relative",transition:"transform 0.2s"}}
            onMouseOver={e=>e.currentTarget.style.transform="translateY(-3px)"} onMouseOut={e=>e.currentTarget.style.transform="translateY(0)"}>
            {t.badge&&<div style={{position:"absolute",top:12,right:12,fontSize:9,background:t.accent,color:"#fff",padding:"3px 9px",borderRadius:10,fontWeight:800}}>{t.badge}</div>}
            <div style={{fontSize:12,color:th.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{t.name}</div>
            <div style={{fontWeight:800,fontSize:30,color:t.accent,marginBottom:2}}>{t.price}</div>
            <div style={{fontSize:12,color:th.muted,marginBottom:18}}>{t.period}</div>
            {t.features.map(f=>(
              <div key={f} style={{display:"flex",gap:8,marginBottom:7,alignItems:"flex-start"}}>
                <span style={{color:t.accent,fontSize:11,flexShrink:0,marginTop:2}}>✓</span>
                <span style={{fontSize:11,color:th.sub,lineHeight:1.5}}>{f}</span>
              </div>
            ))}
            <button onClick={()=>!t.disabled&&!isPro&&onUpgrade()} style={{width:"100%",marginTop:16,padding:"11px",borderRadius:10,border:t.disabled||isPro?`1px solid ${th.border}`:"none",cursor:t.disabled||isPro?"default":"pointer",background:t.disabled||isPro?"transparent":t.name==="Lifetime"?`linear-gradient(135deg,${A5},#fbbf24)`:`linear-gradient(135deg,${A1},${A2})`,color:t.disabled||isPro?th.text:"#fff",fontSize:13,fontWeight:700}}>{t.cta}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage({user,storage,onSave}){
  const{th,dark,setDark}=useContext(Ctx);
  const[prefs,setPrefs]=useState(()=>storage.getPrefs());
  const[saved,setSaved]=useState(false);
  const save=()=>{storage.savePrefs(prefs);onSave(prefs);setSaved(true);setTimeout(()=>setSaved(false),1800);};
  return(
    <div style={{padding:"22px 28px",overflowY:"auto",flex:1,minHeight:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><div style={{fontWeight:800,fontSize:18,color:th.text}}>Personalisation</div><div style={{fontSize:12,color:th.muted,marginTop:2}}>Make FinPulse truly yours</div></div>
        <button onClick={save} style={{padding:"10px 22px",borderRadius:10,border:"none",cursor:"pointer",background:saved?"#10b981":"linear-gradient(135deg,#10b981,#0ea5e9)",color:"#fff",fontSize:13,fontWeight:700}}>{saved?"✓ Saved!":"Save Changes"}</button>
      </div>
      <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:13,padding:"18px"}}>
        <div style={{fontWeight:700,fontSize:14,color:th.text,marginBottom:14}}>🎨 Appearance</div>
        <div style={{fontSize:11,color:th.sub,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>Mode</div>
        <div style={{display:"flex",gap:10}}>
          {[{id:false,l:"☀️ Light"},{id:true,l:"🌙 Dark"}].map(m=>(
            <button key={String(m.id)} onClick={()=>{setDark(m.id);setPrefs(p=>({...p,dark:m.id}));}} style={{flex:1,padding:"11px",borderRadius:10,border:`2px solid ${dark===m.id?A1:th.border}`,background:dark===m.id?`${A1}15`:th.inputBg,cursor:"pointer",fontSize:13,fontWeight:600,color:dark===m.id?A1:th.sub}}>{m.l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
const NAV=[
  {group:"Main",items:[{id:"dash",icon:"🏠",label:"Dashboard"},{id:"plans",icon:"📁",label:"My Plans"}]},
  {group:"Free Calculators",items:[
    {id:"sip",icon:"📈",label:"SIP Calculator",free:true},
    {id:"swp",icon:"💸",label:"SWP Calculator",free:true},
    {id:"emi",icon:"🏠",label:"EMI Calculator",free:true},
    {id:"ppf",icon:"🏛️",label:"PPF Calculator",free:true},
    {id:"cagr",icon:"📊",label:"CAGR Analyser",free:true},
    {id:"cagrret",icon:"📐",label:"Know CAGR Return",free:true},
    {id:"infl",icon:"📉",label:"Inflation Impact",free:true},
  ]},
  {group:"Pro Calculators",items:[
    {id:"plan",icon:"🗺️",label:"Retirement Planner",free:false},
    {id:"tax",icon:"🧾",label:"Tax Optimiser",free:false},
    {id:"kids",icon:"👶",label:"Kid's Future",free:false},
  ]},
  {group:"More",items:[
    {id:"pricing",icon:"💳",label:"Pricing"},
    {id:"settings",icon:"⚙️",label:"Settings"},
  ]},
];

const TITLES={dash:"Dashboard",plans:"My Plans",sip:"SIP Calculator",swp:"SWP Calculator",emi:"EMI Calculator",ppf:"PPF Calculator",cagr:"CAGR Analyser",cagrret:"Know CAGR Return",infl:"Inflation Impact",plan:"Retirement Planner",tax:"Tax Optimiser",kids:"Kid's Future",pricing:"Pricing",settings:"Settings"};

export default function App(){
  const[dark,setDark]=useState(false);
  const[acc]=useState(A1);
  const th=useMemo(()=>dark?DARK(acc):LIGHT(acc),[dark,acc]);
  const[screen,setScreen]=useState("landing");
  const[user,setUser]=useState(null);
  const[page,setPage]=useState("dash");
  const[plans,setPlans]=useState([]);
  const[saveMsg,setSaveMsg]=useState("");
  const[showSave,setShowSave]=useState(false);
  const storage=useStorage(user?.email||"");
  useEffect(()=>{
    if(user){setPlans(storage.getPlans());const p=storage.getPrefs();if(p.dark!==undefined)setDark(p.dark);}
  },[user?.email]);
  const login=u=>{setUser(u);setScreen("app");setPage("dash");setPlans(storage.getPlans());};
  const logout=()=>{setUser(null);setScreen("landing");setPage("dash");setPlans([]);};
  const savePlan=p=>{if(!user)return;storage.savePlan(p);setPlans(storage.getPlans());setSaveMsg("Saved!");setTimeout(()=>setSaveMsg(""),2000);};
  const upgrade=()=>{if(user){DB.users[user.email].plan="pro";setUser(u=>({...u,plan:"pro"}));}};
  const isPro=user?.plan==="pro";

  const pageEl=()=>{
    if(!isPro&&["plan","tax","kids"].includes(page)){return(
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,textAlign:"center"}}>
        <div style={{fontSize:56,marginBottom:14}}>🔒</div>
        <div style={{fontWeight:800,fontSize:20,color:th.text,marginBottom:8}}>Pro Feature</div>
        <div style={{fontSize:13,color:th.sub,marginBottom:22,maxWidth:340,lineHeight:1.7}}>Unlock Retirement Planner, Tax Optimiser and Kid's Future Planner with Pro.</div>
        <button onClick={()=>setPage("pricing")} style={{padding:"12px 28px",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#f59e0b,#fbbf24)",color:"#000",fontSize:14,fontWeight:800}}>Upgrade to Pro →</button>
      </div>
    );}
    switch(page){
      case"dash":    return <Dashboard user={user} plans={plans} onNav={setPage}/>;
      case"plans":   return <PlansPage plans={plans} storage={storage} onNav={setPage}/>;
      case"sip":     return <SIPPage/>;
      case"swp":     return <SWPPage/>;
      case"emi":     return <EMIPage/>;
      case"ppf":     return <PPFPage/>;
      case"cagr":    return <CAGRPage/>;
      case"cagrret": return <CAGRReturnPage/>;
      case"infl":    return <InflationPage/>;
      case"plan":    return <PlanPage/>;
      case"tax":     return <TaxPage/>;
      case"kids":    return <KidsPage/>;
      case"pricing": return <PricingPage user={user} onUpgrade={upgrade}/>;
      case"settings":return <SettingsPage user={user} storage={storage} onSave={p=>{if(p.dark!==undefined)setDark(p.dark);}}/>;
      default:       return <Dashboard user={user} plans={plans} onNav={setPage}/>;
    }
  };

  if(screen==="landing")return(
    <Ctx.Provider value={{th,dark,setDark,a:acc}}>
      <div style={{minHeight:"100vh",background:th.bg,fontFamily:"system-ui,sans-serif",color:th.text}}>
        <nav style={{position:"sticky",top:0,zIndex:100,background:th.nav,borderBottom:`1px solid ${th.border}`,height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 36px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#10b981,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#fff"}}>₹</div>
            <div style={{fontWeight:800,fontSize:15,color:th.text}}>FinPulse</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>setDark(d=>!d)} style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${th.border}`,background:"transparent",cursor:"pointer",fontSize:13,color:th.sub}}>{dark?"☀️":"🌙"}</button>
            <button onClick={()=>setScreen("auth")} style={{padding:"8px 18px",borderRadius:9,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#10b981,#0ea5e9)",color:"#fff",fontSize:13,fontWeight:700}}>Sign In →</button>
          </div>
        </nav>
        <div style={{maxWidth:760,margin:"0 auto",padding:"80px 24px",textAlign:"center"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:20,border:"1px solid rgba(16,185,129,0.3)",background:"rgba(16,185,129,0.08)",marginBottom:28}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:A1,display:"inline-block"}}/>
            <span style={{fontSize:11,color:A1,fontWeight:600,letterSpacing:"0.06em"}}>INDIA'S MOST PERSONAL FINANCE TOOL</span>
          </div>
          <h1 style={{fontWeight:800,fontSize:"clamp(32px,5vw,60px)",letterSpacing:"-0.03em",lineHeight:1.1,marginBottom:18,color:th.text}}>
            Your money deserves<br/><span style={{color:A1}}>data-driven decisions</span>
          </h1>
          <p style={{fontSize:16,color:th.sub,lineHeight:1.8,marginBottom:34,maxWidth:500,margin:"0 auto 34px"}}>
            10 professional calculators, personal account, saved plans — built for Indians serious about their financial future.
          </p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:40}}>
            <button onClick={()=>setScreen("auth")} style={{padding:"13px 30px",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#10b981,#0ea5e9)",color:"#fff",fontSize:14,fontWeight:700,boxShadow:"0 4px 20px rgba(16,185,129,0.35)"}}>Start Free →</button>
            <button onClick={()=>setScreen("auth")} style={{padding:"13px 24px",borderRadius:12,border:`1px solid ${th.border}`,background:th.card,color:th.text,fontSize:14,fontWeight:600,cursor:"pointer"}}>Sign In</button>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            {["🔒 100% Private","📊 10 Calculators","💾 Named Plans","📱 App Coming"].map(t=>(
              <span key={t} style={{fontSize:11,color:th.sub,background:th.tag,border:`1px solid ${th.border}`,padding:"5px 12px",borderRadius:18}}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,maxWidth:900,margin:"0 auto",padding:"0 24px 80px"}}>
          {[{icon:"📊",t:"10 Calculators",d:"SIP, SWP, EMI, PPF, CAGR, Retirement, Tax, Kids — everything in one place."},{icon:"💾",t:"Named Plans",d:"Save calculations as named plans. View history, assumptions and outcomes."},{icon:"🔑",t:"CAGR vs XIRR",d:"Understand why your SIP return differs from the fund's advertised CAGR."}].map(f=>(
            <div key={f.t} style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"22px"}}>
              <div style={{fontSize:28,marginBottom:10}}>{f.icon}</div>
              <div style={{fontWeight:700,fontSize:15,color:th.text,marginBottom:7}}>{f.t}</div>
              <div style={{fontSize:12,color:th.sub,lineHeight:1.8}}>{f.d}</div>
            </div>
          ))}
        </div>
      </div>
    </Ctx.Provider>
  );

  if(screen==="auth")return(
    <Ctx.Provider value={{th,dark,setDark,a:acc}}>
      <AuthScreen onLogin={login} onBack={()=>setScreen("landing")}/>
    </Ctx.Provider>
  );

  return(
    <Ctx.Provider value={{th,dark,setDark,a:acc}}>
      <div style={{display:"flex",height:"100vh",overflow:"hidden",background:th.bg,fontFamily:"system-ui,sans-serif",color:th.text}}>
        <div style={{width:210,background:th.sidebar,borderRight:`1px solid ${th.border}`,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
          <div style={{padding:"14px 16px",borderBottom:`1px solid ${th.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,${acc},${A2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#fff"}}>₹</div>
            <div><div style={{fontWeight:800,fontSize:13,color:th.text}}>FinPulse</div><div style={{fontSize:8,color:th.muted,letterSpacing:"0.08em"}}>{isPro?"✦ PRO":"FREE PLAN"}</div></div>
          </div>
          <nav style={{flex:1,overflowY:"auto",padding:"8px"}}>
            {NAV.map(g=>(
              <div key={g.group} style={{marginBottom:14}}>
                <div style={{fontSize:8,textTransform:"uppercase",letterSpacing:"0.12em",color:th.muted,padding:"0 8px",marginBottom:4}}>{g.group}</div>
                {g.items.map(item=>{
                  const locked=item.free===false&&!isPro;
                  const active=page===item.id;
                  return(
                    <Tip key={item.id} text={locked?"Upgrade to Pro":""} pos="right">
                      <button onClick={()=>locked?setPage("pricing"):setPage(item.id)}
                        style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"8px 10px",borderRadius:8,border:"none",background:active?th.navActive:"transparent",cursor:"pointer",marginBottom:2,textAlign:"left",transition:"all 0.15s",opacity:locked?0.65:1}}
                        onMouseOver={e=>{if(!active)e.currentTarget.style.background=th.tag;}}
                        onMouseOut={e=>{if(!active)e.currentTarget.style.background="transparent";}}>
                        <span style={{fontSize:14,flexShrink:0}}>{item.icon}</span>
                        <span style={{fontSize:12,fontWeight:active?700:400,color:active?acc:th.sub,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.label}</span>
                        {locked&&<span style={{fontSize:8,color:A5,background:`${A5}22`,padding:"2px 5px",borderRadius:5,fontWeight:700}}>PRO</span>}
                        {item.id==="plans"&&plans.length>0&&<span style={{fontSize:9,color:acc,background:`${acc}18`,padding:"2px 5px",borderRadius:8,fontWeight:700}}>{plans.length}</span>}
                      </button>
                    </Tip>
                  );
                })}
              </div>
            ))}
          </nav>
          <div style={{borderTop:`1px solid ${th.border}`,padding:"10px 12px",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${acc},${A2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}>{user.avatar||user.name[0]}</div>
              <div style={{flex:1,overflow:"hidden"}}>
                <div style={{fontSize:11,fontWeight:600,color:th.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
                <div style={{fontSize:9,color:th.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.email}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:5}}>
              <Tip text="Toggle theme"><button onClick={()=>setDark(d=>!d)} style={{flex:1,padding:"6px",borderRadius:7,border:`1px solid ${th.border}`,background:th.toggleBg,cursor:"pointer",fontSize:12}}>{dark?"☀️":"🌙"}</button></Tip>
              <Tip text="Sign out"><button onClick={logout} style={{flex:1,padding:"6px",borderRadius:7,border:`1px solid ${th.border}`,background:th.toggleBg,cursor:"pointer",fontSize:11,color:th.sub,fontWeight:500}} onMouseOver={e=>{e.currentTarget.style.color=A3;e.currentTarget.style.borderColor=A3+"44";}} onMouseOut={e=>{e.currentTarget.style.color=th.sub;e.currentTarget.style.borderColor=th.border;}}>Out</button></Tip>
            </div>
          </div>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
          <div style={{height:50,background:th.nav,borderBottom:`1px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontWeight:700,fontSize:14,color:th.text}}>{TITLES[page]||"FinPulse"}</div>
              {saveMsg&&<div style={{fontSize:11,color:A1,background:`${A1}15`,border:`1px solid ${A1}33`,padding:"3px 10px",borderRadius:14,fontWeight:600}}>{saveMsg}</div>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {!isPro&&<button onClick={()=>setPage("pricing")} style={{padding:"5px 12px",borderRadius:8,border:`1px solid ${A5}44`,background:`${A5}11`,color:A5,fontSize:11,fontWeight:700,cursor:"pointer"}}>✦ Upgrade</button>}
              {["sip","swp","emi","ppf","cagr","cagrret","infl","plan","tax","kids"].includes(page)&&(
                <Tip text="Save this calculation as a named plan">
                  <button onClick={()=>setShowSave(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 13px",borderRadius:9,border:`1px solid ${A1}44`,background:`${A1}11`,color:A1,fontSize:12,fontWeight:600,cursor:"pointer"}}>💾 Save Plan</button>
                </Tip>
              )}
              <Tip text="Settings"><button onClick={()=>setPage("settings")} style={{padding:"6px 11px",borderRadius:8,border:`1px solid ${th.border}`,background:th.toggleBg,color:th.sub,fontSize:12,cursor:"pointer"}}>⚙️</button></Tip>
              <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${acc},${A2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}>{user.avatar||user.name[0]}</div>
            </div>
          </div>
          <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",minHeight:0}}>
            {pageEl()}
          </div>
        </div>
        {showSave&&<SaveModal page={page} onSave={p=>{savePlan(p);setShowSave(false);}} onClose={()=>setShowSave(false)}/>}
      </div>
    </Ctx.Provider>
  );
}
