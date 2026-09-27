import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Users, ShieldAlert, Sparkles, Zap, Activity } from "lucide-react";

/* --- Particle Canvas --- */
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let particles = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 120; i++) {
      particles.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, r: Math.random()*1.4+0.3, vx: (Math.random()-0.5)*0.15, vy: (Math.random()-0.5)*0.15, alpha: Math.random()*0.6+0.2, pulse: Math.random()*Math.PI*2 });
    }
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.forEach(p => {
        p.x+=p.vx; p.y+=p.vy; p.pulse+=0.015;
        if(p.x<0) p.x=canvas.width; if(p.x>canvas.width) p.x=0;
        if(p.y<0) p.y=canvas.height; if(p.y>canvas.height) p.y=0;
        const a = p.alpha*(0.7+0.3*Math.sin(p.pulse));
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,255,${a})`; ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize",resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed",inset:0,zIndex:3,pointerEvents:"none",opacity:0.65 }} />;
}

/* --- Feature Card with Deep Glassmorphism --- */
function FeatureCard({ icon, title, desc, tag, delay }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting) setVis(true); },{threshold:0.15});
    if(ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  },[]);
  return (
    <div ref={ref}
      style={{
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        border: "1px solid rgba(255, 255, 255, 0.16)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
        borderRadius: 24, padding: "36px 30px",
        transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(40px)",
        position: "relative", overflow: "hidden", cursor: "default"
      }}
      onMouseEnter={e=>{
        e.currentTarget.style.transform = "translateY(-8px) scale(1.01)";
        e.currentTarget.style.borderColor = "rgba(52, 211, 153, 0.5)";
        e.currentTarget.style.boxShadow = "0 30px 60px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)";
      }}
      onMouseLeave={e=>{
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.16)";
        e.currentTarget.style.boxShadow = "0 20px 50px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div style={{ width: 54, height: 54, background: "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,95,70,0.5))", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>{icon}</div>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#34D399", background: "rgba(16,185,129,0.14)", border: "1px solid rgba(52,211,153,0.3)", padding: "5px 12px", borderRadius: 20, textTransform: "uppercase" }}>{tag || "AI Module"}</span>
      </div>
      <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 20, color: "#FFF", margin: "0 0 12px", letterSpacing: "-0.3px", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{title}</h3>
      <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(240, 253, 244, 0.8)", margin: 0 }}>{desc}</p>
    </div>
  );
}

/* --- Stat Item in Frosted Capsule --- */
function StatItem({ value, label, subtext, delay }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting) setVis(true); },{threshold:0.2});
    if(ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  },[]);
  return (
    <div ref={ref}
      style={{
        background: "linear-gradient(145deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        borderRadius: 24, padding: "32px 24px", textAlign: "center",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
        transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(35px)"
      }}
    >
      <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:"clamp(38px,4.5vw,54px)",background:"linear-gradient(135deg,#FFFFFF 0%,#34D399 50%,#FBBF24 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.1,marginBottom:8,filter:"drop-shadow(0 4px 16px rgba(16,185,129,0.3))" }}>
        {value}
      </div>
      <div style={{ fontSize:14,fontWeight:700,color:"#FFFFFF",letterSpacing:"0.02em",marginBottom:4,textShadow:"0 1px 4px rgba(0,0,0,0.6)" }}>
        {label}
      </div>
      <div style={{ fontSize:12,color:"rgba(220,252,231,0.7)" }}>
        {subtext}
      </div>
    </div>
  );
}

/* --- Main --- */
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [entering, setEntering] = useState(false);
  const rafRef = useRef(null);

  const onScroll = useCallback(() => {
    if(rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setScrollY(window.scrollY));
  },[]);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if(rafRef.current) cancelAnimationFrame(rafRef.current); };
  },[onScroll]);

  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const heroProgress = Math.min(scrollY / (vh * 0.65), 1);
  const imgScale = 1 + heroProgress * 0.5;
  const imgBrightness = 1 - heroProgress * 0.2;
  const textOpacity = Math.max(0, 1 - heroProgress * 2.4);
  const textTranslateY = heroProgress * -60;

  const handleEnter = () => {
    setEntering(true);
    setTimeout(() => navigate("/login"), 800);
  };

  const features = [
    { icon: <TrendingUp size={24} color="#34D399" />, title: "AI Dynamic Yield & Pricing", desc: "Deep neural models predict competitor parity, local demand surges, and optimal ADR adjustments 90 days ahead.", tag: "Revenue AI" },
    { icon: <Users size={24} color="#34D399" />, title: "Guest Persona & Affinity", desc: "Hyper-personalized guest profiles mapping dietary preferences, high-value amenity affinity, and customized itineraries.", tag: "Hospitality AI" },
    { icon: <ShieldAlert size={24} color="#34D399" />, title: "Cancellation Risk Shield", desc: "Predictive early warning scores identify high-risk bookings with automated re-engagement offers before losses occur.", tag: "Risk AI" },
    { icon: <Sparkles size={24} color="#34D399" />, title: "24/7 Multilingual Concierge", desc: "Context-aware conversational agent handling dining reservations, cabanas, spa bookings, and bespoke guest requests instantly.", tag: "Autonomous Agent" },
    { icon: <Zap size={24} color="#34D399" />, title: "Predictive Ops & Staffing", desc: "Occupancy-synchronized workforce schedules for housekeeping, culinary, and front-desk avoiding overstaffing overhead.", tag: "Ops Command" },
    { icon: <Activity size={24} color="#34D399" />, title: "Real-time Sentiment Radar", desc: "Monitors review signals, checkout sentiments, and internal feedback loops to address guest friction before departure.", tag: "Guest Delight" },
  ];

  return (
    <div style={{ fontFamily:"'Inter',sans-serif",background:"#0A1C16",color:"#FFF",overflowX:"hidden" }}>
      <ParticleCanvas />

      {/* ═══ HERO ═══ */}
      <section style={{ position:"relative",height:"125vh" }}>
        <div style={{ position:"sticky",top:0,height:"100vh",overflow:"hidden",transition:entering?"opacity 0.85s ease":"none",opacity:entering?0:1 }}>

          {/* Zoom image */}
          <img src="/images/resort-landing.jpg" alt="Luxury resort aerial view"
            style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center",transform:`scale(${imgScale})`,filter:`brightness(${imgBrightness})`,transformOrigin:"center center",willChange:"transform,filter" }}
          />

          {/* Warm Golden/Teal Atmospheric Gradient Overlays */}
          <div style={{ position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 30%,rgba(251,191,36,0.14) 0%,rgba(6,31,23,0.35) 55%,rgba(10,28,22,0.7) 100%)",pointerEvents:"none",zIndex:2 }} />
          {/* Bottom Seamless Gradient into Villa Lounge Section */}
          <div style={{ position:"absolute",bottom:0,left:0,right:0,height:"55%",background:"linear-gradient(to top,#0A1C16 0%,rgba(10,28,22,0.85) 50%,transparent 100%)",zIndex:3,pointerEvents:"none" }} />
          {/* Top subtle bar */}
          <div style={{ position:"absolute",top:0,left:0,right:0,height:"25%",background:"linear-gradient(to bottom,rgba(7,21,16,0.8) 0%,transparent 100%)",zIndex:3,pointerEvents:"none" }} />

          {/* Glassmorphic Navbar */}
          <nav style={{ position:"absolute",top:24,left:"5%",right:"5%",zIndex:10,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 28px",background:"rgba(255,255,255,0.08)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:60,boxShadow:"0 10px 30px rgba(0,0,0,0.3)" }}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ width:38,height:38,borderRadius:12,background:"linear-gradient(135deg,#10B981,#047857)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(16,185,129,0.4)" }}>
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2L14.5 5.5V12.5L9 16L3.5 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
                  <circle cx="9" cy="9" r="2.2" fill="white"/>
                </svg>
              </div>
              <div>
                <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:17,color:"#FFFFFF",letterSpacing:"-0.3px",display:"block",lineHeight:1.1 }}>Smart Resort 360</span>
                <span style={{ fontSize:10.5,color:"#6EE7B7",letterSpacing:"0.08em",fontWeight:600,textTransform:"uppercase" }}>Autonomous Intelligence</span>
              </div>
            </div>
            <button id="nav-signin-btn" onClick={handleEnter}
              style={{ background:"linear-gradient(135deg,#10B981,#059669)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:50,color:"white",fontSize:14,fontWeight:700,padding:"10px 24px",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:"0 4px 16px rgba(16,185,129,0.4)",transition:"all 0.25s ease" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-1px) scale(1.03)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(16,185,129,0.6)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0) scale(1)"; e.currentTarget.style.boxShadow="0 4px 16px rgba(16,185,129,0.4)"; }}
            >Sign In →</button>
          </nav>

          {/* Hero text */}
          <div style={{ position:"absolute",inset:0,zIndex:6,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"0 24px",opacity:textOpacity,transform:`translateY(${textTranslateY}px)`,willChange:"opacity,transform" }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:9,background:"rgba(16,185,129,0.15)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",border:"1px solid rgba(52,211,153,0.45)",borderRadius:50,padding:"8px 22px",marginBottom:24,boxShadow:"0 8px 24px rgba(0,0,0,0.25)",animation:"fadeSlideDown 1s ease both" }}>
              <span style={{ width:7,height:7,borderRadius:"50%",background:"#34D399",display:"inline-block",boxShadow:"0 0 10px #34D399",animation:"pulse 2s infinite" }} />
              <span style={{ fontSize:13,color:"#D1FAE5",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase" }}>Next-Gen Resort Intelligence</span>
            </div>

            <h1 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:"clamp(46px,7.5vw,98px)",lineHeight:1.05,letterSpacing:"-0.035em",margin:"0 0 24px",textShadow:"0 4px 24px rgba(0,0,0,0.7)",animation:"fadeSlideUp 1s ease 0.1s both" }}>
              <span style={{ color:"#FFF" }}>Where Ultra-Luxury</span><br />
              <span style={{ background:"linear-gradient(135deg,#FDE68A 0%,#34D399 50%,#6EE7B7 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",filter:"drop-shadow(0 4px 20px rgba(52,211,153,0.35))" }}>Meets Autonomous AI</span>
            </h1>

            <div style={{ background:"rgba(5,23,17,0.55)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:20,padding:"14px 28px",maxWidth:620,marginBottom:36,boxShadow:"0 10px 30px rgba(0,0,0,0.35)",animation:"fadeSlideUp 1s ease 0.2s both" }}>
              <p style={{ fontSize:"clamp(16px,2vw,18.5px)",lineHeight:1.7,color:"#E6F4EA",margin:0,fontWeight:400 }}>
                Elevating guest delight, revenue yield, and continuous staffing operations with hyper-predictive artificial intelligence.
              </p>
            </div>

            <div style={{ display:"flex",gap:16,flexWrap:"wrap",justifyContent:"center",animation:"fadeSlideUp 1s ease 0.35s both" }}>
              <button id="enter-portal-btn" onClick={handleEnter}
                style={{ background:"linear-gradient(135deg,#10B981 0%,#059669 100%)",color:"white",border:"1px solid rgba(255,255,255,0.35)",borderRadius:50,padding:"18px 44px",fontSize:16.5,fontWeight:700,fontFamily:"'Plus Jakarta Sans',sans-serif",cursor:"pointer",boxShadow:"0 10px 35px rgba(16,185,129,0.45)",transition:"all 0.25s ease",letterSpacing:"-0.01em" }}
                onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px) scale(1.02)"; e.currentTarget.style.boxShadow="0 16px 48px rgba(16,185,129,0.65)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0) scale(1)"; e.currentTarget.style.boxShadow="0 10px 35px rgba(16,185,129,0.45)"; }}
              >Enter Resort Portal →</button>

              <a href="#villa-experience"
                style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.1)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:50,color:"#FFFFFF",textDecoration:"none",padding:"18px 34px",fontSize:15.5,fontWeight:600,fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"all 0.25s ease",boxShadow:"0 6px 20px rgba(0,0,0,0.25)" }}
                onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.18)"; e.currentTarget.style.borderColor="rgba(52,211,153,0.5)"; e.currentTarget.style.transform="translateY(-2px)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.25)"; e.currentTarget.style.transform="translateY(0)"; }}
              >Explore Experience ↓</a>
            </div>
          </div>

          {/* Scroll hint */}
          <div style={{ position:"absolute",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:7,display:"flex",flexDirection:"column",alignItems:"center",gap:6,opacity:Math.max(0,1-heroProgress*4),animation:"fadeIn 2s ease 1.5s both",pointerEvents:"none" }}>
            <span style={{ fontSize:11,color:"rgba(255,255,255,0.75)",letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:600 }}>Scroll to enter</span>
            <div style={{ width:26,height:40,border:"2px solid rgba(255,255,255,0.35)",borderRadius:14,display:"flex",justifyContent:"center",paddingTop:6,background:"rgba(0,0,0,0.2)",backdropFilter:"blur(6px)" }}>
              <div style={{ width:4,height:8,background:"#34D399",borderRadius:4,animation:"scrollDot 1.8s ease-in-out infinite" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS & VILLA EXPERIENCE ═══ */}
      <section id="villa-experience" style={{
        marginTop: "-15vh",
        padding: "40px 48px 120px",
        background: "radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 60%), #0A1C16",
        position: "relative", zIndex: 10, overflow: "hidden"
      }}>
        {/* Subtle dot pattern */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(52, 211, 153, 0.08) 1.5px, transparent 1.5px)", backgroundSize: "36px 36px", opacity: 0.5, pointerEvents: "none" }} />
        {/* Glow orbs */}
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 550, height: 550, background: "radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 600, height: 600, background: "radial-gradient(circle, rgba(251, 191, 36, 0.13) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", filter: "blur(70px)" }} />

        {/* Stats Grid */}
        <div style={{ maxWidth: 1140, margin: "0 auto 80px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 24, position: "relative", zIndex: 2 }}>
          <StatItem value="2,400+" label="Decisions Automated Daily" subtext="Pricing, guest requests & roster shifts" delay={0} />
          <StatItem value="+18.4%" label="Average Occupancy Lift" subtext="Across peak & shoulder seasons" delay={100} />
          <StatItem value="94.2%" label="Demand Accuracy" subtext="30 to 90-day predictive precision" delay={200} />
          <StatItem value="4.92 / 5" label="Guest Satisfaction" subtext="Based on verified checkout reviews" delay={300} />
        </div>

        {/* Villa Interior Showcase Card */}
        <div style={{ maxWidth: 1140, margin: "0 auto 100px", position: "relative", zIndex: 2 }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.2)", borderRadius: 32,
            overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "center"
          }}>
            <div style={{ position: "relative", height: 420, overflow: "hidden" }}>
              <img src="/images/resort-interior.jpg" alt="Overwater Villa Lounge Interior"
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, rgba(10, 28, 22, 0.95) 100%)" }} />
              <div style={{ position: "absolute", bottom: 20, left: 20, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", padding: "7px 16px", borderRadius: 30, border: "1px solid rgba(255,255,255,0.2)", fontSize: 12, fontWeight: 600, color: "#FDE68A" }}>
                Overwater Sunset Villa Suite
              </div>
            </div>
            <div style={{ padding: "44px 40px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(52, 211, 153, 0.15)", border: "1px solid rgba(52, 211, 153, 0.35)", borderRadius: 30, padding: "5px 14px", marginBottom: 18, fontSize: 12, fontWeight: 700, color: "#34D399", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                <Sparkles size={13} /> Integrated Resort Suite
              </div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(24px, 3vw, 36px)", color: "#FFFFFF", lineHeight: 1.25, margin: "0 0 16px", letterSpacing: "-0.5px" }}>
                Seamlessly blending hospitality warmth with predictive power.
              </h2>
              <p style={{ fontSize: 15.5, lineHeight: 1.8, color: "rgba(240, 253, 244, 0.8)", margin: "0 0 28px" }}>
                From instant room climate recall to AI-driven villa dining suggestions, every guest touchpoint feels effortless and deeply memorable.
              </p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 14, padding: "12px 18px" }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "#FDE68A" }}>Instant</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Room Service Dispatch</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 14, padding: "12px 18px" }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "#34D399" }}>Zero-Wait</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Digital Check-In Flow</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: 60, position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-block", background: "rgba(251, 191, 36, 0.12)", border: "1px solid rgba(251, 191, 36, 0.3)", borderRadius: 50, padding: "6px 20px", marginBottom: 18 }}>
            <span style={{ fontSize: 12, color: "#FDE68A", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Core Intelligence Engines
            </span>
          </div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(34px, 4.5vw, 52px)", color: "#FFFFFF", margin: "0 0 16px", letterSpacing: "-0.03em" }}>
            Architected for Modern Luxury Resorts
          </h2>
          <p style={{ color: "rgba(240, 253, 244, 0.75)", fontSize: 17, maxWidth: 580, margin: "0 auto", lineHeight: 1.7 }}>
            Six interconnected modules sharing live telemetry, guest context, and operational demand.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, position: "relative", zIndex: 2 }}>
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* ═══ IMMERSIVE PORTAL GATEWAY (TRANSITION TO LOGIN) ═══ */}
      <section style={{
        padding: "100px 48px 140px",
        background: "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.2) 0%, rgba(8, 26, 20, 0.95) 60%, #061510 100%)",
        position: "relative", zIndex: 5, textAlign: "center",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 750, height: 450, background: "radial-gradient(ellipse, rgba(52, 211, 153, 0.25) 0%, rgba(251, 191, 36, 0.1) 40%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", filter: "blur(50px)" }} />

        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative", zIndex: 3 }}>
          <div onClick={handleEnter}
            style={{ position: "relative", borderRadius: 30, overflow: "hidden", border: "1.5px solid rgba(255, 255, 255, 0.25)", boxShadow: "0 40px 100px rgba(0, 0, 0, 0.7), 0 0 80px rgba(16, 185, 129, 0.2)", cursor: "pointer", marginBottom: 50, transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.025)"; e.currentTarget.style.boxShadow = "0 50px 120px rgba(0, 0, 0, 0.8), 0 0 100px rgba(52, 211, 153, 0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 40px 100px rgba(0, 0, 0, 0.7), 0 0 80px rgba(16, 185, 129, 0.2)"; }}
          >
            <img src="/images/resort-landing.jpg" alt="Resort Portal Preview" style={{ width: "100%", height: 380, objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6, 21, 16, 0.2) 0%, rgba(6, 21, 16, 0.85) 100%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "40px 36px", textAlign: "left" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34D399", display: "inline-block" }} />
                <span style={{ color: "#34D399", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Live System Ready</span>
              </div>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(24px, 3.5vw, 36px)", color: "#FFFFFF", margin: 0, textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
                Launch Smart Resort 360 Workspace
              </h3>
            </div>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 72, height: 72, background: "linear-gradient(135deg, #10B981, #059669)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 50px rgba(16, 185, 129, 0.8)", border: "2px solid rgba(255, 255, 255, 0.4)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>

          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(30px, 4vw, 46px)", color: "#FFFFFF", margin: "0 0 16px", letterSpacing: "-0.03em" }}>
            Experience the Future of Hospitality
          </h2>
          <p style={{ color: "rgba(240, 253, 244, 0.8)", fontSize: 17, maxWidth: 500, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Log in with Manager, Operations, or Guest credentials to test live role-tailored dashboards.
          </p>

          <button id="final-enter-btn" onClick={handleEnter}
            style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", color: "#FFFFFF", border: "1px solid rgba(255, 255, 255, 0.4)", borderRadius: 50, padding: "20px 56px", fontSize: 18, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: "pointer", boxShadow: "0 10px 40px rgba(16, 185, 129, 0.5)", transition: "all 0.25s ease" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px) scale(1.03)"; e.currentTarget.style.boxShadow = "0 18px 60px rgba(16, 185, 129, 0.7)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 10px 40px rgba(16, 185, 129, 0.5)"; }}
          >
            Enter Resort Management Portal →
          </button>
          <div style={{ marginTop: 24, fontSize: 13, color: "rgba(240, 253, 244, 0.5)" }}>
            Pre-seeded demo credentials for instant hackathon walkthrough
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.06)",padding:"32px 48px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#040A07",position:"relative",zIndex:5,flexWrap:"wrap",gap:16 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ width:24,height:24,borderRadius:7,background:"#167A65",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L14.5 5.5V12.5L9 16L3.5 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
              <circle cx="9" cy="9" r="2" fill="white"/>
            </svg>
          </div>
          <span style={{ color:"rgba(255,255,255,0.5)",fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600 }}>Smart Resort 360</span>
        </div>
        <span style={{ color:"rgba(255,255,255,0.22)",fontSize:12 }}>© 2026 CodeVibers · Hackcelestial 1.0</span>
      </footer>

      <style>{`
        @keyframes fadeSlideDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
        @keyframes scrollDot { 0%{opacity:1;transform:translateY(0)} 80%{opacity:0;transform:translateY(14px)} 100%{opacity:0;transform:translateY(14px)} }
        html{scroll-behavior:smooth}
        *{box-sizing:border-box}
      `}</style>
    </div>
  );
}
