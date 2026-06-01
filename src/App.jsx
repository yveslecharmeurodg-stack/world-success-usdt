import { useState, useEffect } from "react";

// ── SUPABASE CONFIG ────────────────────────────────────────────────────────
const SUPABASE_URL = "https://vjqizblyiaoelhwpornd.supabase.co";
const SUPABASE_KEY = "sb_publishable_ndTm8Ga9fdGqD76LIiCSTg_YtrJv27d";

const sb = {
  async query(table, method="GET", body=null, filter="") {
    const session = JSON.parse(localStorage.getItem("ws_session")||"null");
    const token = session?.access_token || SUPABASE_KEY;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${filter}`, {
      method,
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Prefer": method==="POST" ? "return=representation" : method==="PATCH" ? "return=representation" : "",
      },
      body: body ? JSON.stringify(body) : null,
    });
    if (method==="DELETE") return null;
    const text = await res.text();
    try { return JSON.parse(text); } catch(e) { return null; }
  },
  async signUp(email, password, meta) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, data: meta }),
    });
    return res.json();
  },
  async signIn(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem("ws_session", JSON.stringify(data));
    }
    return data;
  },
  async signOut() {
    const session = JSON.parse(localStorage.getItem("ws_session")||"null");
    if (session?.access_token) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${session.access_token}` },
      });
    }
    localStorage.removeItem("ws_session");
  },
  getStoredSession() {
    try { return JSON.parse(localStorage.getItem("ws_session")||"null"); } catch(e) { return null; }
  }
};

const PLANS = [
  { id:1, name:"SUCCESS VIP 1", min:40, max:79, profit:5, days:30 },
  { id:2, name:"SUCCESS VIP 2", min:80, max:199, profit:15, days:30 },
  { id:3, name:"SUCCESS VIP 3", min:200, max:499, profit:40, days:30 },
  { id:4, name:"SUCCESS VIP 4", min:500, max:999, profit:105, days:30 },
  { id:5, name:"SUCCESS VIP 5", min:1000, max:1999, profit:210, days:30 },
  { id:6, name:"SUCCESS VIP 6", min:2000, max:3999, profit:420, days:30 },
  { id:7, name:"SUCCESS VIP 7", min:4000, max:7999, profit:840, days:30 },
  { id:8, name:"SUCCESS VIP 8", min:8000, max:15999, profit:1680, days:30 },
  { id:9, name:"SUCCESS VIP 9", min:16000, max:31999, profit:3360, days:30 },
  { id:10, name:"SUCCESS VIP 10", min:32000, max:63999, profit:6720, days:30 },
  { id:11, name:"SUCCESS VIP 11", min:64000, max:99999, profit:13440, days:30 },
  { id:12, name:"SUCCESS VIP ⭐⭐⭐⭐⭐", min:100000, max:Infinity, profit:22000, days:30, elite:true },
];
const WALLETS = {
  primary: "0x88f5Ab0de123f9fC196f726Fe861F5310AfE2445",
  secondary: "0x81D3fccEB1C6e693190b852D147DeF5B51dbfdad",
};
const COUNTRIES = ["France","Belgique","Suisse","Canada","Sénégal","Côte d'Ivoire","Mali","Maroc","Algérie","Tunisie","Cameroun","Congo","Gabon","Togo","Bénin","Burkina Faso","Niger","Guinée","Madagascar","Maurice","États-Unis","Royaume-Uni","Allemagne","Espagne","Italie","Autre"];
const generateCode = () => "WSU" + Math.floor(10000 + Math.random() * 89999);
const TESTIMONIALS = [
  { name:"Marie K.", country:"🇫🇷 France", amount:"+6 300 USDT", text:"Plateforme sérieuse, retraits rapides et support réactif. Je recommande vivement !", avatar:"MK" },
  { name:"Ibrahim D.", country:"🇸🇳 Sénégal", amount:"+12 600 USDT", text:"J'ai commencé avec le VIP 3 et j'ai augmenté chaque mois. Service impeccable.", avatar:"ID" },
  { name:"Sophie M.", country:"🇧🇪 Belgique", amount:"+3 150 USDT", text:"Simple à utiliser, transparent et rentable. Mon meilleur investissement crypto.", avatar:"SM" },
  { name:"Ahmed B.", country:"🇲🇦 Maroc", amount:"+25 200 USDT", text:"Le plan VIP 5 étoiles est exceptionnel. Les profits arrivent chaque jour sans faute.", avatar:"AB" },
];
const FAQS = [
  { q:"Comment déposer des USDT ?", a:"Copiez l'adresse wallet BEP20 dans votre dashboard, envoyez vos USDT. Minimum 40 USDT." },
  { q:"Quand puis-je retirer mes profits ?", a:"Les retraits sont disponibles à tout moment. Minimum 11 USDT avec 1% de frais. Traitement sous 24h." },
  { q:"Comment fonctionne le parrainage ?", a:"Partagez votre code parrain. Niveau 1 : 20%, Niveau 2 : 10%, Niveau 3 : 5% des dépôts." },
  { q:"Quel réseau blockchain acceptez-vous ?", a:"Uniquement le réseau BEP20 (Binance Smart Chain)." },
  { q:"Comment vérifier mon compte ?", a:"Un email de vérification est envoyé automatiquement à l'inscription." },
  { q:"Les profits sont-ils garantis ?", a:"Les profits sont calculés selon votre plan actif et crédités quotidiennement." },
];

// ── UI ─────────────────────────────────────────────────────────────────────
function Logo({ size=28 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ width:size+8, height:size+8, background:"linear-gradient(135deg,#00d4aa,#0088ff)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 20px rgba(0,212,170,0.4)" }}>
        <span style={{ color:"#fff", fontWeight:900, fontSize:size*0.55 }}>W</span>
      </div>
      <div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:size*0.75, lineHeight:1 }}>
          <span style={{ color:"#00d4aa" }}>World</span><span style={{ color:"var(--text)" }}> Success</span>
        </div>
        <div style={{ fontSize:size*0.38, color:"var(--muted)", letterSpacing:2, textTransform:"uppercase" }}>USDT Platform</div>
      </div>
    </div>
  );
}

function Btn({ children, variant="primary", onClick, style={}, disabled=false, size="md" }) {
  const base = { border:"none", cursor:disabled?"not-allowed":"pointer", borderRadius:12, fontWeight:700, fontFamily:"'Syne',sans-serif", transition:"all 0.2s", padding:size==="sm"?"8px 18px":size==="lg"?"16px 36px":"12px 26px", fontSize:size==="sm"?13:size==="lg"?17:15, opacity:disabled?0.6:1 };
  const v = { primary:{ background:"linear-gradient(135deg,#00d4aa,#0088ff)", color:"#fff", boxShadow:"0 4px 20px rgba(0,212,170,0.35)" }, secondary:{ background:"var(--card)", color:"var(--text)", border:"1px solid var(--border)" }, danger:{ background:"linear-gradient(135deg,#ff4d6d,#c9184a)", color:"#fff" }, ghost:{ background:"transparent", color:"#00d4aa", border:"1px solid #00d4aa" } };
  return <button style={{ ...base, ...v[variant], ...style }} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Input({ label, type="text", value, onChange, placeholder, required, icon }) {
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:"block", marginBottom:6, fontSize:13, fontWeight:600, color:"var(--muted)" }}>{label}{required&&<span style={{color:"#ff4d6d"}}> *</span>}</label>}
      <div style={{ position:"relative" }}>
        {icon && <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}>{icon}</span>}
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
          style={{ width:"100%", padding:icon?"12px 14px 12px 42px":"12px 14px", background:"var(--input)", border:"1.5px solid var(--border)", borderRadius:10, color:"var(--text)", fontSize:15, outline:"none", boxSizing:"border-box", fontFamily:"'DM Sans',sans-serif" }}
          onFocus={e=>e.target.style.borderColor="#00d4aa"} onBlur={e=>e.target.style.borderColor="var(--border)"} />
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:"block", marginBottom:6, fontSize:13, fontWeight:600, color:"var(--muted)" }}>{label}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)} style={{ width:"100%", padding:"12px 14px", background:"var(--input)", border:"1.5px solid var(--border)", borderRadius:10, color:"var(--text)", fontSize:15, fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" }}>
        <option value="">Sélectionner...</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Card({ children, style={}, glow=false }) {
  return <div style={{ background:"var(--card)", borderRadius:18, padding:24, border:"1px solid var(--border)", boxShadow:glow?"0 0 30px rgba(0,212,170,0.15)":"0 2px 12px rgba(0,0,0,0.08)", ...style }}>{children}</div>;
}

function Badge({ children, color="#00d4aa" }) {
  return <span style={{ background:color+"22", color, border:`1px solid ${color}55`, borderRadius:20, padding:"3px 10px", fontSize:12, fontWeight:700 }}>{children}</span>;
}

function StatCard({ label, value, icon, color="#00d4aa" }) {
  return (
    <Card style={{ textAlign:"center" }}>
      <div style={{ fontSize:32, marginBottom:8 }}>{icon}</div>
      <div style={{ fontSize:22, fontWeight:800, color, fontFamily:"'Syne',sans-serif" }}>{value}</div>
      <div style={{ fontSize:13, color:"var(--muted)", marginTop:4 }}>{label}</div>
    </Card>
  );
}

function Alert({ type="error", children }) {
  const c = { error:["#ff4d6d22","#ff4d6d55","#ff4d6d"], success:["rgba(0,212,170,0.1)","#00d4aa44","#00d4aa"], info:["rgba(0,136,255,0.1)","#0088ff44","#0088ff"] };
  const [bg,bd,tx] = c[type]||c.error;
  return <div style={{ background:bg, border:`1px solid ${bd}`, color:tx, padding:"10px 14px", borderRadius:10, marginBottom:16, fontSize:14 }}>{children}</div>;
}

function Spinner() {
  return <div style={{ display:"inline-block", width:18, height:18, border:"2px solid #ffffff44", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />;
}

function Notif({ msg }) {
  if (!msg) return null;
  return <div style={{ position:"fixed", top:80, right:20, background:"#00d4aa", color:"#fff", padding:"12px 20px", borderRadius:12, zIndex:9999, fontWeight:700, fontSize:14, boxShadow:"0 4px 20px rgba(0,212,170,0.5)" }}>{msg}</div>;
}

// ── HOME ───────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  const [count, setCount] = useState({ users:0, profit:0, countries:0 });
  useEffect(()=>{
    const t={users:48291,profit:9847234,countries:87}; let i=0;
    const iv=setInterval(()=>{ i++; setCount({ users:Math.floor(t.users*(i/60)), profit:Math.floor(t.profit*(i/60)), countries:Math.floor(t.countries*(i/60)) }); if(i>=60)clearInterval(iv); },25);
    return()=>clearInterval(iv);
  },[]);
  return (
    <div>
      <div style={{ minHeight:"92vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"60px 20px", background:"radial-gradient(ellipse 80% 60% at 50% 0%,rgba(0,212,170,0.12) 0%,transparent 70%)" }}>
        <Badge color="#00d4aa">🔒 Plateforme sécurisée BEP20 · Supabase</Badge>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:"clamp(30px,6vw,66px)", lineHeight:1.05, margin:"24px 0 20px", letterSpacing:-2 }}>
          Faites croître votre <br />
          <span style={{ background:"linear-gradient(90deg,#00d4aa,#0088ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>patrimoine USDT</span>
        </h1>
        <p style={{ fontSize:17, color:"var(--muted)", maxWidth:560, margin:"0 auto 36px", lineHeight:1.7 }}>
          Profits quotidiens jusqu'à <strong style={{color:"#00d4aa"}}>22 000 USDT/jour</strong>. Plans VIP sécurisés, retraits rapides, parrainage 3 niveaux.
        </p>
        <div style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center" }}>
          <Btn size="lg" onClick={()=>setPage("register")}>Commencer maintenant →</Btn>
          <Btn size="lg" variant="ghost" onClick={()=>setPage("plans")}>Voir les plans VIP</Btn>
        </div>
        <div style={{ display:"flex", gap:40, marginTop:60, flexWrap:"wrap", justifyContent:"center" }}>
          {[{l:"Utilisateurs actifs",v:count.users.toLocaleString()+"+"},{l:"USDT distribués",v:"$"+(count.profit/1000000).toFixed(1)+"M+"},{l:"Pays représentés",v:count.countries+"+"}].map(s=>(
            <div key={s.l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:34, color:"#00d4aa" }}>{s.v}</div>
              <div style={{ fontSize:13, color:"var(--muted)" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"80px 20px", maxWidth:1100, margin:"0 auto" }}>
        <h2 style={{ textAlign:"center", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:34, marginBottom:48 }}>Comment ça fonctionne</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:20 }}>
          {[{step:"01",icon:"📝",title:"Inscription",desc:"Créez votre compte en moins de 2 minutes."},{step:"02",icon:"💰",title:"Déposez",desc:"Envoyez vos USDT sur notre wallet BEP20. Minimum 40 USDT."},{step:"03",icon:"📈",title:"Investissez",desc:"Choisissez votre plan VIP et activez vos profits."},{step:"04",icon:"💸",title:"Retirez",desc:"Retirez vos gains à tout moment. Validation sous 24h."}].map(s=>(
            <Card key={s.step} style={{ position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-10, right:-10, fontSize:55, fontWeight:900, color:"#00d4aa0a", fontFamily:"'Syne',sans-serif" }}>{s.step}</div>
              <div style={{ fontSize:34, marginBottom:12 }}>{s.icon}</div>
              <h3 style={{ fontFamily:"'Syne',sans-serif", marginBottom:8 }}>{s.title}</h3>
              <p style={{ color:"var(--muted)", fontSize:14, lineHeight:1.6, margin:0 }}>{s.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ padding:"0 20px 80px", maxWidth:1100, margin:"0 auto" }}>
        <h2 style={{ textAlign:"center", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:34, marginBottom:48 }}>Nos Plans VIP</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:16 }}>
          {PLANS.slice(0,4).map(p=>(
            <Card key={p.id} style={{ textAlign:"center" }}>
              <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:14 }}>{p.name}</h3>
              <div style={{ fontSize:26, fontWeight:900, color:"#00d4aa", fontFamily:"'Syne',sans-serif", margin:"10px 0 4px" }}>+{p.profit} USDT</div>
              <div style={{ fontSize:12, color:"var(--muted)", marginBottom:12 }}>profit / jour · {p.min.toLocaleString()}–{p.max===Infinity?"∞":p.max.toLocaleString()} USDT</div>
              <Btn variant="ghost" size="sm" onClick={()=>setPage("register")} style={{ width:"100%" }}>Investir</Btn>
            </Card>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:24 }}>
          <Btn variant="secondary" onClick={()=>setPage("plans")}>Voir tous les 12 plans →</Btn>
        </div>
      </div>

      <div style={{ background:"var(--card)", padding:"80px 20px", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <h2 style={{ textAlign:"center", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:34, marginBottom:48 }}>Ce que disent nos membres</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:20 }}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} style={{ background:"var(--bg)", borderRadius:16, padding:24, border:"1px solid var(--border)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                  <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#00d4aa,#0088ff)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, flexShrink:0 }}>{t.avatar}</div>
                  <div><div style={{ fontWeight:700, fontSize:14 }}>{t.name}</div><div style={{ fontSize:12, color:"var(--muted)" }}>{t.country}</div></div>
                </div>
                <Badge color="#00d4aa">{t.amount}</Badge>
                <p style={{ fontSize:14, color:"var(--muted)", lineHeight:1.6, margin:"12px 0 0" }}>"{t.text}"</p>
                <div style={{ marginTop:10, color:"#f5a623" }}>★★★★★</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:"80px 20px", textAlign:"center" }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:38, marginBottom:16 }}>Prêt à commencer ?</h2>
        <p style={{ color:"var(--muted)", marginBottom:32, fontSize:16 }}>Rejoignez des milliers d'investisseurs qui font confiance à World Success USDT</p>
        <Btn size="lg" onClick={()=>setPage("register")}>Créer mon compte gratuitement →</Btn>
      </div>
    </div>
  );
}

function PlansPage({ setPage }) {
  return (
    <div style={{ padding:"60px 20px", maxWidth:1200, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:48 }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:40, marginBottom:12 }}>Plans d'Investissement VIP</h1>
        <p style={{ color:"var(--muted)", fontSize:16 }}>12 plans · durée 30 jours · profits quotidiens</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:20 }}>
        {PLANS.map(p=>(
          <Card key={p.id} glow={p.elite} style={{ textAlign:"center", borderColor:p.elite?"#f5a623":"var(--border)" }}>
            {p.elite&&<div style={{ marginBottom:8 }}><Badge color="#f5a623">⭐ PLAN ÉLITE</Badge></div>}
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, marginBottom:4 }}>{p.name}</h3>
            <div style={{ fontSize:34, fontWeight:900, color:p.elite?"#f5a623":"#00d4aa", fontFamily:"'Syne',sans-serif", margin:"10px 0 4px" }}>+{p.profit.toLocaleString()}</div>
            <div style={{ fontSize:13, color:"var(--muted)", marginBottom:12 }}>USDT/jour · Total : {(p.profit*30).toLocaleString()} USDT</div>
            <div style={{ background:"var(--bg)", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:13 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}><span style={{color:"var(--muted)"}}>Min</span><strong>{p.min.toLocaleString()} USDT</strong></div>
              <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{color:"var(--muted)"}}>Max</span><strong>{p.max===Infinity?"Illimité":p.max.toLocaleString()+" USDT"}</strong></div>
            </div>
            <Btn style={{ width:"100%" }} variant={p.elite?"primary":"ghost"} onClick={()=>setPage("register")}>Investir →</Btn>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div style={{ padding:"60px 20px", maxWidth:900, margin:"0 auto" }}>
      <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:40, marginBottom:24 }}>À propos de World Success USDT</h1>
      <Card style={{ marginBottom:20 }}><h2 style={{ fontFamily:"'Syne',sans-serif", marginBottom:12 }}>🌍 Notre Mission</h2><p style={{ color:"var(--muted)", lineHeight:1.8 }}>World Success USDT est une plateforme d'investissement crypto permettant à chacun de faire croître son patrimoine grâce à des plans transparents et sécurisés sur le réseau BEP20.</p></Card>
      <Card style={{ marginBottom:20 }}><h2 style={{ fontFamily:"'Syne',sans-serif", marginBottom:12 }}>🔒 Sécurité & Transparence</h2><p style={{ color:"var(--muted)", lineHeight:1.8 }}>Toutes les transactions sont effectuées sur le réseau BEP20. Nos wallets sont publiquement vérifiables.</p></Card>
      <Card>
        <h2 style={{ fontFamily:"'Syne',sans-serif", marginBottom:16 }}>📊 Nos Chiffres</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:16 }}>
          {[{v:"48 000+",l:"Membres actifs"},{v:"$9.8M+",l:"USDT distribués"},{v:"87+",l:"Pays"},{v:"24/7",l:"Support"}].map(s=>(
            <div key={s.l} style={{ textAlign:"center", padding:16, background:"var(--bg)", borderRadius:12 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:900, color:"#00d4aa" }}>{s.v}</div>
              <div style={{ fontSize:13, color:"var(--muted)" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function FAQPage() {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ padding:"60px 20px", maxWidth:800, margin:"0 auto" }}>
      <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:40, marginBottom:48, textAlign:"center" }}>FAQ</h1>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {FAQS.map((f,i)=>(
          <Card key={i} style={{ cursor:"pointer", padding:"18px 22px" }} onClick={()=>setOpen(open===i?null:i)}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <strong style={{ fontFamily:"'Syne',sans-serif", fontSize:15 }}>{f.q}</strong>
              <span style={{ color:"#00d4aa", fontSize:22, transform:open===i?"rotate(45deg)":"none", transition:"transform 0.2s", flexShrink:0 }}>+</span>
            </div>
            {open===i&&<p style={{ margin:"14px 0 0", color:"var(--muted)", lineHeight:1.7, fontSize:14 }}>{f.a}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}

function ContactPage() {
  const [form, setForm] = useState({ name:"", email:"", message:"" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSend = async () => {
    if (!form.email||!form.message) return;
    setLoading(true);
    try {
      await sb.query("support_messages","POST",{ ...form, status:"nouveau", created_at:new Date().toISOString() });
      setSent(true);
    } catch(e) { setSent(true); }
    setLoading(false);
  };
  return (
    <div style={{ padding:"60px 20px", maxWidth:700, margin:"0 auto" }}>
      <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:40, marginBottom:8, textAlign:"center" }}>Contact & Support</h1>
      <p style={{ textAlign:"center", color:"var(--muted)", marginBottom:40 }}>Notre équipe est disponible 24h/24</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:14, marginBottom:36 }}>
        {[{icon:"💬",label:"WhatsApp",value:"Support direct",color:"#25D366"},{icon:"✈️",label:"Telegram",value:"@worldsuccessusdt",color:"#0088cc"},{icon:"📧",label:"Support",value:"support@worldsuccessusdt.com",color:"#00d4aa"},{icon:"📧",label:"Admin",value:"admin@worldsuccessusdt.com",color:"#0088ff"}].map(c=>(
          <Card key={c.label} style={{ textAlign:"center", padding:16 }}>
            <div style={{ fontSize:28, marginBottom:6 }}>{c.icon}</div>
            <div style={{ fontWeight:700, fontSize:13, color:c.color, marginBottom:4 }}>{c.label}</div>
            <div style={{ fontSize:11, color:"var(--muted)", wordBreak:"break-all" }}>{c.value}</div>
          </Card>
        ))}
      </div>
      {sent ? (
        <Card style={{ textAlign:"center", padding:40 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
          <h3 style={{ fontFamily:"'Syne',sans-serif" }}>Message envoyé !</h3>
          <p style={{ color:"var(--muted)" }}>Notre équipe vous répondra sous 24h.</p>
        </Card>
      ) : (
        <Card>
          <Input label="Nom complet" value={form.name} onChange={v=>setForm({...form,name:v})} placeholder="John Doe" />
          <Input label="Email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})} placeholder="vous@email.com" required />
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", marginBottom:6, fontSize:13, fontWeight:600, color:"var(--muted)" }}>Message</label>
            <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows={5} placeholder="Votre message..." style={{ width:"100%", padding:"12px 14px", background:"var(--input)", border:"1.5px solid var(--border)", borderRadius:10, color:"var(--text)", fontSize:15, fontFamily:"'DM Sans',sans-serif", resize:"vertical", boxSizing:"border-box" }} />
          </div>
          <Btn style={{ width:"100%" }} onClick={handleSend} disabled={!form.email||!form.message||loading}>{loading?<Spinner />:"Envoyer"}</Btn>
        </Card>
      )}
    </div>
  );
}

// ── REGISTER ───────────────────────────────────────────────────────────────
function RegisterPage({ setPage, setSession }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ nom:"", prenom:"", email:"", tel:"", password:"", pays:"", parrain:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [code] = useState(generateCode);

  const handleRegister = async () => {
    if (!form.email||!form.tel||!form.password) { setError("Veuillez remplir tous les champs obligatoires."); return; }
    if (form.password.length<6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    setLoading(true); setError("");
    try {
      const data = await sb.signUp(form.email, form.password, { nom:form.nom, prenom:form.prenom });
      if (data.error) throw new Error(data.error.message||"Erreur inscription");
      const uid = data.user?.id;
      if (uid) {
        await sb.query("Profiles","POST",{
          id:uid, nom:form.nom, prenom:form.prenom, email:form.email,
          tel:form.tel, pays:form.pays, parrain:form.parrain, code,
          balance:0, invested:0, profits:0, referrals:0,
          is_admin:false, blocked:false, created_at:new Date().toISOString()
        });
      }
      setStep(2);
    } catch(e) {
      if (e.message?.includes("already")) setError("Cet email est déjà utilisé.");
      else setError("Erreur : " + e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding:"60px 20px", maxWidth:480, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:30, marginBottom:8 }}>Créer mon compte</h1>
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:8 }}>
          {[1,2].map(s=><div key={s} style={{ width:40, height:4, borderRadius:4, background:step>=s?"#00d4aa":"var(--border)", transition:"background 0.3s" }} />)}
        </div>
      </div>
      {error&&<Alert type="error">{error}</Alert>}
      {step===1 ? (
        <Card>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <Input label="Nom" value={form.nom} onChange={v=>setForm({...form,nom:v})} placeholder="Dupont" />
            <Input label="Prénom" value={form.prenom} onChange={v=>setForm({...form,prenom:v})} placeholder="Jean" />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})} placeholder="vous@email.com" required icon="📧" />
          <Input label="Téléphone" type="tel" value={form.tel} onChange={v=>setForm({...form,tel:v})} placeholder="+33 6 XX XX XX XX" required icon="📱" />
          <Input label="Mot de passe" type="password" value={form.password} onChange={v=>setForm({...form,password:v})} placeholder="Min. 6 caractères" required icon="🔒" />
          <Select label="Pays" value={form.pays} onChange={v=>setForm({...form,pays:v})} options={COUNTRIES} />
          <Input label="Code parrain (optionnel)" value={form.parrain} onChange={v=>setForm({...form,parrain:v})} placeholder="WSU12345" icon="🎁" />
          <Btn style={{ width:"100%", marginTop:8 }} onClick={handleRegister} disabled={!form.email||!form.tel||!form.password||loading}>
            {loading?<Spinner />:"Créer mon compte →"}
          </Btn>
          <p style={{ textAlign:"center", fontSize:13, color:"var(--muted)", marginTop:16 }}>
            Déjà membre ? <span style={{ color:"#00d4aa", cursor:"pointer" }} onClick={()=>setPage("login")}>Se connecter</span>
          </p>
        </Card>
      ) : (
        <Card>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✉️</div>
            <h3 style={{ fontFamily:"'Syne',sans-serif" }}>Compte créé !</h3>
            <p style={{ color:"var(--muted)", fontSize:14 }}>Vérifiez votre email <strong>{form.email}</strong> et cliquez le lien de confirmation.</p>
          </div>
          <Alert type="success">🎉 Votre code parrain : <strong style={{ letterSpacing:2, fontSize:18 }}>{code}</strong></Alert>
          <Btn style={{ width:"100%" }} onClick={()=>setPage("login")}>Se connecter →</Btn>
        </Card>
      )}
    </div>
  );
}

// ── LOGIN ──────────────────────────────────────────────────────────────────
function LoginPage({ setPage, setSession }) {
  const [form, setForm] = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email||!form.password) { setError("Veuillez remplir tous les champs."); return; }
    setLoading(true); setError("");
    try {
      const data = await sb.signIn(form.email, form.password);
      if (!data.access_token) throw new Error("Identifiants incorrects");
      setSession(data);
      const profiles = await sb.query("Profiles","GET",null,`?id=eq.${data.user.id}`);
      if (profiles && profiles[0]?.is_admin) {
        setPage("admin");
      } else {
        setPage("dashboard");
      }
    } catch(e) {
      setError("Email ou mot de passe incorrect.");
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method: "POST",
        headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setForgotSent(true);
    } catch(e) { setForgotSent(true); }
    setForgotLoading(false);
  };

  if (showForgot) return (
    <div style={{ padding:"80px 20px", maxWidth:420, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:28, marginBottom:8 }}>🔑 Mot de passe oublié</h1>
        <p style={{ color:"var(--muted)", fontSize:14 }}>Entrez votre email pour recevoir un lien de réinitialisation</p>
      </div>
      {forgotSent ? (
        <Card style={{ textAlign:"center", padding:40 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📧</div>
          <h3 style={{ fontFamily:"'Syne',sans-serif", marginBottom:12 }}>Email envoyé !</h3>
          <p style={{ color:"var(--muted)", fontSize:14, marginBottom:20 }}>Vérifiez votre boîte mail et cliquez le lien pour réinitialiser votre mot de passe.</p>
          <Btn style={{ width:"100%" }} onClick={()=>{ setShowForgot(false); setForgotSent(false); setForgotEmail(""); }}>
            Retour à la connexion
          </Btn>
        </Card>
      ) : (
        <Card>
          <Input label="Votre email" type="email" value={forgotEmail} onChange={setForgotEmail} placeholder="vous@email.com" icon="📧" required />
          <Btn style={{ width:"100%", marginTop:8 }} onClick={handleForgotPassword} disabled={!forgotEmail||forgotLoading}>
            {forgotLoading?<Spinner />:"Envoyer le lien 📧"}
          </Btn>
          <p style={{ textAlign:"center", fontSize:13, color:"var(--muted)", marginTop:16 }}>
            <span style={{ color:"#00d4aa", cursor:"pointer" }} onClick={()=>setShowForgot(false)}>← Retour à la connexion</span>
          </p>
        </Card>
      )}
    </div>
  );

  return (
    <div style={{ padding:"80px 20px", maxWidth:420, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:30, marginBottom:8 }}>Connexion</h1>
        <p style={{ color:"var(--muted)" }}>Accédez à votre espace membre</p>
      </div>
      {error&&<Alert type="error">{error}</Alert>}
      <Card>
        <Input label="Email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})} placeholder="vous@email.com" icon="📧" required />
        <Input label="Mot de passe" type="password" value={form.password} onChange={v=>setForm({...form,password:v})} placeholder="••••••••" icon="🔒" required />
        <div style={{ textAlign:"right", marginBottom:16, marginTop:-8 }}>
          <span style={{ color:"#00d4aa", cursor:"pointer", fontSize:13 }} onClick={()=>setShowForgot(true)}>
            🔑 Mot de passe oublié ?
          </span>
        </div>
        <Btn style={{ width:"100%" }} onClick={handleLogin} disabled={!form.email||!form.password||loading}>
          {loading?<Spinner />:"Se connecter →"}
        </Btn>
        <p style={{ textAlign:"center", fontSize:13, color:"var(--muted)", marginTop:16 }}>
          Pas encore membre ? <span style={{ color:"#00d4aa", cursor:"pointer" }} onClick={()=>setPage("register")}>Créer un compte</span>
        </p>
      </Card>
    </div>
  );
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────
function DashboardPage({ session, setPage, setSession }) {
  const [tab, setTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState("");
  const [withAmount, setWithAmount] = useState("");
  const [withAddress, setWithAddress] = useState("");
  const [copied, setCopied] = useState("");

  const showNotif = msg => { setNotif(msg); setTimeout(()=>setNotif(""),3000); };
  const copy = (text,key) => { try { navigator.clipboard.writeText(text); } catch(e) {} setCopied(key); setTimeout(()=>setCopied(""),2000); };
  const fmt = v => typeof v==="number"?v.toFixed(2):"0.00";

  useEffect(()=>{
    if (!session?.user?.id) return;
    sb.query("Profiles","GET",null,`?id=eq.${session.user.id}`).then(d=>{ if(d&&d[0]) setProfile(d[0]); }).catch(console.error);
    sb.query("Transactions","GET",null,`?user_id=eq.${session.user.id}&order=created_at.desc`).then(d=>{ if(d) setTransactions(d); }).catch(console.error);
  },[session,tab]);

  const handleWithdraw = async () => {
    const amount = parseFloat(withAmount);
    if (!amount||amount<11||!withAddress) return;
    if (amount>(profile?.balance||0)) { showNotif("❌ Solde insuffisant"); return; }
    setLoading(true);
    try {
      await sb.query("Transactions","POST",{ user_id:session.user.id, type:"Retrait", amount:-amount, status:"En attente", address:withAddress, fee:amount*0.01, net:amount*0.99, created_at:new Date().toISOString() });
      await sb.query("Profiles","PATCH",{ balance:(profile.balance||0)-amount },`?id=eq.${session.user.id}`);
      setProfile(p=>({...p,balance:(p.balance||0)-amount}));
      showNotif("✅ Demande de retrait soumise !");
      setWithAmount(""); setWithAddress("");
    } catch(e) { showNotif("❌ Erreur"); }
    setLoading(false);
  };

  const handleActivatePlan = async (plan) => {
    setLoading(true);
    try {
      await sb.query("Profiles","PATCH",{ active_plan:plan },`?id=eq.${session.user.id}`);
      await sb.query("Transactions","POST",{ user_id:session.user.id, type:"Activation Plan", amount:0, status:"Actif", plan_name:plan.name, created_at:new Date().toISOString() });
      setProfile(p=>({...p,active_plan:plan}));
      showNotif(`✅ Plan ${plan.name} activé !`);
    } catch(e) { showNotif("❌ Erreur"); }
    setLoading(false);
  };

  const handleLogout = async () => {
    await sb.signOut();
    setSession(null);
    setPage("home");
  };

  const tabs = [
    {id:"overview",label:"Vue d'ensemble",icon:"📊"},
    {id:"deposit",label:"Dépôts",icon:"💰"},
    {id:"withdraw",label:"Retraits",icon:"💸"},
    {id:"plans",label:"Plans VIP",icon:"📈"},
    {id:"referral",label:"Parrainage",icon:"👥"},
    {id:"history",label:"Historique",icon:"📋"},
    {id:"settings",label:"Paramètres",icon:"⚙️"},
  ];

  if (!profile) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh", flexDirection:"column", gap:16 }}>
      <div style={{ width:40, height:40, border:"3px solid #00d4aa44", borderTop:"3px solid #00d4aa", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <p style={{color:"var(--muted)"}}>Chargement de votre profil...</p>
    </div>
  );

  return (
    <div style={{ display:"flex", minHeight:"calc(100vh - 70px)" }}>
      <Notif msg={notif} />
      <div style={{ width:210, background:"var(--card)", borderRight:"1px solid var(--border)", padding:"20px 10px", flexShrink:0 }}>
        <div style={{ marginBottom:20, padding:"10px 12px", background:"var(--bg)", borderRadius:12 }}>
          <div style={{ fontWeight:800, fontFamily:"'Syne',sans-serif", fontSize:14 }}>{profile.prenom} {profile.nom}</div>
          <div style={{ fontSize:11, color:"var(--muted)", marginTop:2, wordBreak:"break-all" }}>{profile.email}</div>
          <div style={{ marginTop:6 }}><Badge color="#00d4aa">✅ Actif</Badge></div>
        </div>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", width:"100%", borderRadius:10, border:"none", cursor:"pointer", textAlign:"left", background:tab===t.id?"linear-gradient(135deg,rgba(0,212,170,0.15),rgba(0,136,255,0.15))":"transparent", color:tab===t.id?"#00d4aa":"var(--muted)", fontWeight:tab===t.id?700:500, fontSize:13, fontFamily:"'DM Sans',sans-serif", borderLeft:tab===t.id?"3px solid #00d4aa":"3px solid transparent", marginBottom:2 }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
        <button onClick={handleLogout} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", width:"100%", borderRadius:10, border:"none", cursor:"pointer", background:"transparent", color:"#ff4d6d", fontSize:13, fontFamily:"'DM Sans',sans-serif", marginTop:16 }}>🚪 Déconnexion</button>
      </div>

      <div style={{ flex:1, padding:"24px", overflowY:"auto" }}>
        {tab==="overview"&&(
          <div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", marginBottom:20 }}>Bonjour, {profile.prenom} 👋</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:20 }}>
              <StatCard label="Solde disponible" value={`$${fmt(profile.balance)}`} icon="💰" color="#00d4aa" />
              <StatCard label="Investi" value={`$${fmt(profile.invested)}`} icon="📈" color="#0088ff" />
              <StatCard label="Profits totaux" value={`$${fmt(profile.profits)}`} icon="💸" color="#f5a623" />
              <StatCard label="Filleuls" value={profile.referrals||0} icon="👥" color="#a855f7" />
            </div>
            {profile.active_plan&&(
              <Card glow style={{ marginBottom:20, borderColor:"#00d4aa44" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
                  <div><Badge color="#00d4aa">✅ Plan actif</Badge><h3 style={{ fontFamily:"'Syne',sans-serif", margin:"8px 0 4px" }}>{profile.active_plan.name}</h3><p style={{ color:"var(--muted)", fontSize:14, margin:0 }}>+{profile.active_plan.profit} USDT/jour</p></div>
                  <div style={{ textAlign:"right" }}><div style={{ fontSize:26, fontWeight:900, color:"#00d4aa", fontFamily:"'Syne',sans-serif" }}>+{profile.active_plan.profit}</div><div style={{ fontSize:12, color:"var(--muted)" }}>USDT/jour</div></div>
                </div>
              </Card>
            )}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Card>
                <h4 style={{ fontFamily:"'Syne',sans-serif", marginBottom:12 }}>📊 Activité récente</h4>
                {transactions.length===0?<p style={{color:"var(--muted)",fontSize:14}}>Aucune transaction.</p>
                  :transactions.slice(0,4).map((t,i)=>(
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:i<3?"1px solid var(--border)":"none", fontSize:13 }}>
                      <span style={{color:"var(--muted)"}}>{t.type}</span>
                      <span style={{ color:t.amount>=0?"#00d4aa":"#ff4d6d", fontWeight:700 }}>{t.amount>=0?"+":""}{t.amount} USDT</span>
                    </div>
                  ))}
              </Card>
              <Card>
                <h4 style={{ fontFamily:"'Syne',sans-serif", marginBottom:14 }}>⚡ Actions rapides</h4>
                <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                  <Btn variant="primary" size="sm" onClick={()=>setTab("deposit")} style={{textAlign:"left"}}>💰 Déposer USDT</Btn>
                  <Btn variant="ghost" size="sm" onClick={()=>setTab("withdraw")} style={{textAlign:"left"}}>💸 Retirer USDT</Btn>
                  <Btn variant="secondary" size="sm" onClick={()=>setTab("plans")} style={{textAlign:"left"}}>📈 Choisir un plan</Btn>
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab==="deposit"&&(
          <div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", marginBottom:20 }}>💰 Déposer des USDT</h2>
            <Alert type="info">ℹ️ Réseau <strong>BEP20 uniquement</strong> · Min : <strong>40 USDT</strong> · Max : <strong>100 000 USDT</strong></Alert>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              {[{key:"primary",label:"Wallet Principal",addr:WALLETS.primary},{key:"secondary",label:"Wallet Secondaire",addr:WALLETS.secondary}].map(w=>(
                <Card key={w.key}>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>{w.label}</div>
                  <div style={{ background:"var(--bg)", borderRadius:8, padding:"9px 11px", fontSize:10, wordBreak:"break-all", color:"var(--muted)", fontFamily:"monospace", marginBottom:10 }}>{w.addr}</div>
                  <Btn variant="ghost" size="sm" style={{width:"100%"}} onClick={()=>copy(w.addr,w.key)}>{copied===w.key?"✅ Copié !":"📋 Copier"}</Btn>
                </Card>
              ))}
            </div>
            <Alert type="error">⚠️ N'envoyez jamais sur un autre réseau que BEP20.</Alert>
          </div>
        )}

        {tab==="withdraw"&&(
          <div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", marginBottom:20 }}>💸 Retirer des USDT</h2>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <Card>
                <h3 style={{ fontFamily:"'Syne',sans-serif", marginBottom:16 }}>Nouvelle demande</h3>
                <div style={{ background:"var(--bg)", borderRadius:10, padding:"9px 12px", marginBottom:14, fontSize:13 }}>Solde : <strong style={{color:"#00d4aa"}}>${fmt(profile.balance)}</strong></div>
                <Input label="Montant (USDT)" type="number" value={withAmount} onChange={setWithAmount} placeholder="Min. 11 USDT" />
                <Input label="Adresse BEP20" value={withAddress} onChange={setWithAddress} placeholder="0x..." />
                {withAmount&&parseFloat(withAmount)>=11&&(
                  <div style={{ background:"var(--bg)", borderRadius:10, padding:"10px 12px", marginBottom:14, fontSize:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{color:"var(--muted)"}}>Montant</span><strong>{withAmount} USDT</strong></div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}><span style={{color:"var(--muted)"}}>Frais (1%)</span><strong style={{color:"#ff4d6d"}}>-{(parseFloat(withAmount)*0.01).toFixed(2)}</strong></div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:5, borderTop:"1px solid var(--border)", paddingTop:5 }}><strong>Recevrez</strong><strong style={{color:"#00d4aa"}}>{(parseFloat(withAmount)*0.99).toFixed(2)} USDT</strong></div>
                  </div>
                )}
                <Btn style={{width:"100%"}} onClick={handleWithdraw} disabled={!withAmount||parseFloat(withAmount)<11||!withAddress||loading}>{loading?<Spinner />:"Soumettre"}</Btn>
              </Card>
              <Card>
                <h4 style={{ fontFamily:"'Syne',sans-serif", marginBottom:10 }}>ℹ️ Conditions</h4>
                <ul style={{ margin:0, paddingLeft:16, color:"var(--muted)", fontSize:13, lineHeight:2.2 }}>
                  <li>Minimum : <strong>11 USDT</strong></li>
                  <li>Frais : <strong>1%</strong></li>
                  <li>Réseau : <strong>BEP20</strong></li>
                  <li>Validation : <strong>sous 24h</strong></li>
                </ul>
              </Card>
            </div>
          </div>
        )}

        {tab==="plans"&&(
          <div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", marginBottom:20 }}>📈 Choisir un Plan VIP</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12 }}>
              {PLANS.map(p=>(
                <Card key={p.id} style={{ textAlign:"center", borderColor:profile.active_plan?.id===p.id?"#00d4aa":"var(--border)", padding:16 }}>
                  <h4 style={{ fontFamily:"'Syne',sans-serif", fontSize:12, marginBottom:6 }}>{p.name}</h4>
                  <div style={{ fontSize:22, fontWeight:900, color:"#00d4aa", fontFamily:"'Syne',sans-serif" }}>+{p.profit}</div>
                  <div style={{ fontSize:11, color:"var(--muted)", marginBottom:8 }}>USDT/jour · {p.min.toLocaleString()}–{p.max===Infinity?"∞":p.max.toLocaleString()}</div>
                  {profile.active_plan?.id===p.id?<Badge color="#00d4aa">✅ Actif</Badge>:<Btn size="sm" variant="ghost" style={{width:"100%"}} onClick={()=>handleActivatePlan(p)} disabled={loading}>Activer</Btn>}
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab==="referral"&&(
          <div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", marginBottom:20 }}>👥 Programme de Parrainage</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14, marginBottom:20 }}>
              <StatCard label="Niveau 1 · 20%" value="$0.00" icon="👥" color="#00d4aa" />
              <StatCard label="Niveau 2 · 10%" value="$0.00" icon="👥" color="#0088ff" />
              <StatCard label="Niveau 3 · 5%" value="$0.00" icon="👥" color="#f5a623" />
            </div>
            <Card>
              <h3 style={{ fontFamily:"'Syne',sans-serif", marginBottom:14 }}>Votre code parrain</h3>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <div style={{ flex:1, background:"var(--bg)", borderRadius:10, padding:"12px 16px", fontFamily:"monospace", fontSize:20, fontWeight:900, letterSpacing:4, color:"#00d4aa" }}>{profile.code||"—"}</div>
                <Btn onClick={()=>copy(profile.code,"ref")}>{copied==="ref"?"✅ Copié !":"📋 Copier"}</Btn>
              </div>
            </Card>
          </div>
        )}

        {tab==="history"&&(
          <div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", marginBottom:20 }}>📋 Historique</h2>
            <Card>
              {transactions.length===0?<p style={{color:"var(--muted)",textAlign:"center",padding:20}}>Aucune transaction.</p>
                :<table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead><tr>{["Type","Montant","Date","Statut"].map(h=><th key={h} style={{ textAlign:"left", padding:"9px 12px", borderBottom:"1px solid var(--border)", color:"var(--muted)", fontWeight:600 }}>{h}</th>)}</tr></thead>
                  <tbody>{transactions.map((t,i)=>(
                    <tr key={i} style={{ borderBottom:"1px solid var(--border)" }}>
                      <td style={{padding:"10px 12px"}}>{t.type}</td>
                      <td style={{ padding:"10px 12px", fontWeight:700, color:t.amount>=0?"#00d4aa":"#ff4d6d" }}>{t.amount>=0?"+":""}{t.amount} USDT</td>
                      <td style={{ padding:"10px 12px", color:"var(--muted)" }}>{new Date(t.created_at).toLocaleDateString()}</td>
                      <td style={{padding:"10px 12px"}}><Badge color={t.status==="Validé"||t.status==="Actif"?"#00d4aa":t.status==="En attente"?"#f5a623":"#0088ff"}>{t.status}</Badge></td>
                    </tr>
                  ))}</tbody>
                </table>}
            </Card>
          </div>
        )}

        {tab==="settings"&&(
          <div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", marginBottom:20 }}>⚙️ Paramètres</h2>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <Card>
                <h3 style={{ fontFamily:"'Syne',sans-serif", marginBottom:16 }}>Informations</h3>
                <Input label="Prénom" value={profile.prenom||""} onChange={()=>{}} />
                <Input label="Nom" value={profile.nom||""} onChange={()=>{}} />
                <Input label="Email" value={profile.email||""} onChange={()=>{}} type="email" />
                <Input label="Téléphone" value={profile.tel||""} onChange={()=>{}} />
              </Card>
              <Card>
                <h3 style={{ fontFamily:"'Syne',sans-serif", marginBottom:12 }}>✅ Statut KYC</h3>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
                  <Badge color="#00d4aa">📧 Email vérifié</Badge>
                  <Badge color="#00d4aa">📱 Tél. enregistré</Badge>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ADMIN ──────────────────────────────────────────────────────────────────
function AdminPage({ setPage, setSession }) {
  const [tab, setTab] = useState("stats");
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notif, setNotif] = useState("");
  const showNotif = msg => { setNotif(msg); setTimeout(()=>setNotif(""),3000); };

  useEffect(()=>{
    sb.query("Profiles").then(d=>{ if(d) setUsers(d); }).catch(console.error);
    sb.query("Transactions","GET",null,"?type=eq.Retrait&status=eq.En attente").then(d=>{ if(d) setWithdrawals(d); }).catch(console.error);
    sb.query("support_messages","GET",null,"?order=created_at.desc").then(d=>{ if(d) setMessages(d); }).catch(console.error);
  },[tab]);

  const validateW = async w => {
    await sb.query("Transactions","PATCH",{status:"Validé"},`?id=eq.${w.id}`);
    setWithdrawals(p=>p.filter(x=>x.id!==w.id));
    showNotif("✅ Retrait validé !");
  };
  const rejectW = async w => {
    const u = users.find(x=>x.id===w.user_id);
    await sb.query("Transactions","PATCH",{status:"Refusé"},`?id=eq.${w.id}`);
    if (u) await sb.query("Profiles","PATCH",{balance:(u.balance||0)+Math.abs(w.amount)},`?id=eq.${w.user_id}`);
    setWithdrawals(p=>p.filter(x=>x.id!==w.id));
    showNotif("❌ Retrait refusé.");
  };
  const toggleBlock = async u => {
    await sb.query("Profiles","PATCH",{blocked:!u.blocked},`?id=eq.${u.id}`);
    setUsers(p=>p.map(x=>x.id===u.id?{...x,blocked:!x.blocked}:x));
    showNotif(u.blocked?"✅ Débloqué !":"🚫 Bloqué !");
  };
  const handleLogout = async () => {
    await sb.signOut();
    setSession(null);
    setPage("home");
  };

  const adminTabs = [{id:"stats",label:"Statistiques",icon:"📊"},{id:"users",label:"Utilisateurs",icon:"👥"},{id:"withdrawals",label:"Retraits",icon:"💸"},{id:"messages",label:"Support",icon:"💬"},{id:"wallets",label:"Wallets",icon:"🏦"}];

  return (
    <div style={{ display:"flex", minHeight:"calc(100vh - 70px)" }}>
      <Notif msg={notif} />
      <div style={{ width:210, background:"var(--card)", borderRight:"1px solid var(--border)", padding:"20px 10px", flexShrink:0 }}>
        <div style={{ padding:"10px 12px", background:"#ff4d6d22", border:"1px solid #ff4d6d44", borderRadius:10, marginBottom:16 }}>
          <div style={{ fontWeight:800, fontFamily:"'Syne',sans-serif", fontSize:13, color:"#ff4d6d" }}>🛡️ Panel Admin</div>
        </div>
        {adminTabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", width:"100%", borderRadius:10, border:"none", cursor:"pointer", textAlign:"left", background:tab===t.id?"rgba(255,77,109,0.12)":"transparent", color:tab===t.id?"#ff4d6d":"var(--muted)", fontWeight:tab===t.id?700:500, fontSize:13, fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
        <button onClick={handleLogout} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", width:"100%", borderRadius:10, border:"none", cursor:"pointer", background:"transparent", color:"#ff4d6d", fontSize:13, fontFamily:"'DM Sans',sans-serif", marginTop:16 }}>🚪 Déconnexion</button>
      </div>

      <div style={{ flex:1, padding:"24px", overflowY:"auto" }}>
        {tab==="stats"&&(
          <div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", marginBottom:20 }}>📊 Statistiques</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14 }}>
              <StatCard label="Utilisateurs" value={users.length} icon="👥" color="#00d4aa" />
              <StatCard label="Retraits en attente" value={withdrawals.length} icon="⏳" color="#f5a623" />
              <StatCard label="Soldes totaux" value={`$${users.reduce((s,u)=>s+(u.balance||0),0).toFixed(0)}`} icon="💰" color="#0088ff" />
              <StatCard label="Messages support" value={messages.length} icon="💬" color="#ff4d6d" />
            </div>
          </div>
        )}

        {tab==="users"&&(
          <div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", marginBottom:20 }}>👥 Utilisateurs ({users.length})</h2>
            <Card>
              {users.length===0?<p style={{color:"var(--muted)",textAlign:"center",padding:20}}>Aucun utilisateur.</p>
                :<table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead><tr>{["Nom","Email","Solde","Plan","Statut","Action"].map(h=><th key={h} style={{ textAlign:"left", padding:"9px 10px", borderBottom:"1px solid var(--border)", color:"var(--muted)", fontWeight:600 }}>{h}</th>)}</tr></thead>
                  <tbody>{users.map(u=>(
                    <tr key={u.id} style={{ borderBottom:"1px solid var(--border)" }}>
                      <td style={{padding:"9px 10px",fontWeight:600}}>{u.prenom} {u.nom}</td>
                      <td style={{padding:"9px 10px",color:"var(--muted)",fontSize:11}}>{u.email}</td>
                      <td style={{padding:"9px 10px",color:"#00d4aa",fontWeight:700}}>${(u.balance||0).toFixed(2)}</td>
                      <td style={{padding:"9px 10px",fontSize:11}}>{u.active_plan?.name||"—"}</td>
                      <td style={{padding:"9px 10px"}}><Badge color={u.blocked?"#ff4d6d":"#00d4aa"}>{u.blocked?"Bloqué":"Actif"}</Badge></td>
                      <td style={{padding:"9px 10px"}}><Btn size="sm" variant={u.blocked?"ghost":"danger"} onClick={()=>toggleBlock(u)}>{u.blocked?"Débloquer":"Bloquer"}</Btn></td>
                    </tr>
                  ))}</tbody>
                </table>}
            </Card>
          </div>
        )}

        {tab==="withdrawals"&&(
          <div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", marginBottom:20 }}>💸 Retraits en attente ({withdrawals.length})</h2>
            <Card>
              {withdrawals.length===0?<p style={{color:"var(--muted)",textAlign:"center",padding:20}}>✅ Aucun retrait en attente.</p>
                :<table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead><tr>{["Montant","Adresse","Date","Actions"].map(h=><th key={h} style={{ textAlign:"left", padding:"9px 10px", borderBottom:"1px solid var(--border)", color:"var(--muted)", fontWeight:600 }}>{h}</th>)}</tr></thead>
                  <tbody>{withdrawals.map(w=>(
                    <tr key={w.id} style={{ borderBottom:"1px solid var(--border)" }}>
                      <td style={{padding:"9px 10px",color:"#ff4d6d",fontWeight:700}}>{Math.abs(w.amount)} USDT</td>
                      <td style={{padding:"9px 10px",fontFamily:"monospace",fontSize:10,color:"var(--muted)"}}>{(w.address||"").slice(0,18)}...</td>
                      <td style={{padding:"9px 10px",color:"var(--muted)"}}>{new Date(w.created_at).toLocaleDateString()}</td>
                      <td style={{padding:"9px 10px"}}>
                        <div style={{ display:"flex", gap:5 }}>
                          <Btn size="sm" variant="primary" onClick={()=>validateW(w)}>✅</Btn>
                          <Btn size="sm" variant="danger" onClick={()=>rejectW(w)}>❌</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>}
            </Card>
          </div>
        )}

        {tab==="messages"&&(
          <div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", marginBottom:20 }}>💬 Messages Support</h2>
            {messages.length===0?<Card><p style={{color:"var(--muted)",textAlign:"center",padding:20}}>Aucun message.</p></Card>
              :messages.map((m,i)=>(
                <Card key={i} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, flexWrap:"wrap", gap:6 }}>
                    <strong>{m.name||"Anonyme"}</strong>
                    <span style={{color:"var(--muted)",fontSize:12}}>{m.email}</span>
                  </div>
                  <p style={{ color:"var(--muted)", fontSize:14, margin:0 }}>{m.message}</p>
                </Card>
              ))}
          </div>
        )}

        {tab==="wallets"&&(
          <div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", marginBottom:20 }}>🏦 Wallets de dépôt</h2>
            {[{label:"Wallet Principal",addr:WALLETS.primary},{label:"Wallet Secondaire",addr:WALLETS.secondary}].map(w=>(
              <Card key={w.label} style={{ marginBottom:14 }}>
                <h3 style={{ fontFamily:"'Syne',sans-serif", marginBottom:10 }}>{w.label}</h3>
                <div style={{ background:"var(--bg)", borderRadius:10, padding:"10px 14px", fontFamily:"monospace", wordBreak:"break-all", color:"#00d4aa", fontSize:13 }}>{w.addr}</div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── APP ────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(true);
  const [page, setPage] = useState("home");
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(()=>{
    // Récupérer la session sauvegardée
    const stored = sb.getStoredSession();
    if (stored?.access_token) {
      setSession(stored);
    }
    setAuthLoading(false);
  },[]);

  const theme = dark
    ?{ "--bg":"#0d1117","--card":"#161b22","--input":"#0d1117","--text":"#e6edf3","--muted":"#8b949e","--border":"#30363d","--accent":"#00d4aa" }
    :{ "--bg":"#f6f8fa","--card":"#ffffff","--input":"#f6f8fa","--text":"#1c1c1e","--muted":"#57606a","--border":"#d0d7de","--accent":"#00d4aa" };

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif}
    @keyframes spin{to{transform:rotate(360deg)}}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#00d4aa44;border-radius:3px}
  `;

  const nav = [{id:"home",label:"Accueil"},{id:"plans",label:"Plans VIP"},{id:"about",label:"À propos"},{id:"faq",label:"FAQ"},{id:"contact",label:"Contact"}];

  if (authLoading) return (
    <div style={{ ...theme, background:"var(--bg)", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{CSS}</style>
      <div style={{ textAlign:"center" }}>
        <Logo size={32} />
        <div style={{ marginTop:20, display:"flex", justifyContent:"center" }}>
          <div style={{ width:30, height:30, border:"3px solid #00d4aa44", borderTop:"3px solid #00d4aa", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
        </div>
        <p style={{ color:"var(--muted)", marginTop:12, fontSize:14 }}>Chargement...</p>
      </div>
    </div>
  );

  return (
    <div style={{ ...theme, background:"var(--bg)", color:"var(--text)", minHeight:"100vh", transition:"background 0.3s,color 0.3s" }}>
      <style>{CSS}</style>
      <nav style={{ position:"sticky", top:0, zIndex:100, background:dark?"rgba(13,17,23,0.93)":"rgba(246,248,250,0.93)", backdropFilter:"blur(20px)", borderBottom:"1px solid var(--border)", padding:"0 20px", height:70, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ cursor:"pointer" }} onClick={()=>setPage("home")}><Logo /></div>
        <div style={{ display:"flex", alignItems:"center", gap:2, flexWrap:"wrap" }}>
          {nav.map(n=>(
            <button key={n.id} onClick={()=>setPage(n.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:"7px 10px", borderRadius:10, color:page===n.id?"#00d4aa":"var(--muted)", fontWeight:page===n.id?700:500, fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>{n.label}</button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <button onClick={()=>setDark(!dark)} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"5px 9px", cursor:"pointer", fontSize:17 }}>{dark?"☀️":"🌙"}</button>
          {session?(
            <>
              <Btn size="sm" variant="secondary" onClick={()=>setPage("dashboard")}>Dashboard</Btn>
              <Btn size="sm" variant="ghost" onClick={()=>setPage("admin")}>🛡️ Admin</Btn>
            </>
          ):(
            <>
              <Btn size="sm" variant="secondary" onClick={()=>setPage("login")}>Connexion</Btn>
              <Btn size="sm" onClick={()=>setPage("register")}>S'inscrire</Btn>
            </>
          )}
        </div>
      </nav>

      <main>
        {page==="home"&&<HomePage setPage={setPage} />}
        {page==="plans"&&<PlansPage setPage={setPage} />}
        {page==="about"&&<AboutPage />}
        {page==="faq"&&<FAQPage />}
        {page==="contact"&&<ContactPage />}
        {page==="register"&&<RegisterPage setPage={setPage} setSession={setSession} />}
        {page==="login"&&<LoginPage setPage={setPage} setSession={setSession} />}
        {page==="dashboard"&&(session?<DashboardPage session={session} setPage={setPage} setSession={setSession} />:<LoginPage setPage={setPage} setSession={setSession} />)}
        {page==="admin"&&(session?<AdminPage setPage={setPage} setSession={setSession} />:<LoginPage setPage={setPage} setSession={setSession} />)}
      </main>

      {!["dashboard","admin"].includes(page)&&(
        <footer style={{ background:"var(--card)", borderTop:"1px solid var(--border)", padding:"40px 32px 24px", marginTop:40 }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:32, marginBottom:32 }}>
              <div>
                <Logo size={22} />
                <p style={{ color:"var(--muted)", fontSize:13, marginTop:14, lineHeight:1.7 }}>Plateforme d'investissement USDT sécurisée sur le réseau BEP20.</p>
              </div>
              {[{title:"Plateforme",links:["Accueil","Plans VIP","FAQ"]},{title:"Légal",links:["CGU","Confidentialité"]},{title:"Contact",links:["support@worldsuccessusdt.com","admin@worldsuccessusdt.com"]}].map(col=>(
                <div key={col.title}>
                  <h4 style={{ fontFamily:"'Syne',sans-serif", marginBottom:14, fontSize:14 }}>{col.title}</h4>
                  {col.links.map(l=><div key={l} style={{ color:"var(--muted)", fontSize:12, marginBottom:9, wordBreak:"break-all" }}>{l}</div>)}
                </div>
              ))}
            </div>
            <div style={{ borderTop:"1px solid var(--border)", paddingTop:20, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
              <span style={{ fontSize:12, color:"var(--muted)" }}>© 2025 World Success USDT. Tous droits réservés.</span>
              <div style={{ display:"flex", gap:8 }}><Badge color="#00d4aa">🔒 BEP20</Badge><Badge color="#3ecf8e">⚡ Supabase</Badge></div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
