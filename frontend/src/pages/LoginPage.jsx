import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Eye, EyeOff, Sparkles, AlertCircle, ArrowRight, Building2, BarChart3, UserCheck } from 'lucide-react';

/* ─── Brand mark ─── */
function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: '#167A65',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 2L14.5 5.5V12.5L9 16L3.5 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="9" cy="9" r="2" fill="white"/>
        </svg>
      </div>
      <div>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 17, color: '#17201C', letterSpacing: '-0.3px', lineHeight: 1 }}>
          Smart Resort 360
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <Sparkles size={9} color="#5B63C7" />
          <span style={{ fontSize: 10.5, color: '#5B63C7', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            AI-powered resort intelligence
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Left editorial panel ─── */
function HeroPanel() {
  return (
    <div style={{
      flex: '0 0 55%',
      position: 'relative',
      overflow: 'hidden',
      background: '#0f1c18',
      display: 'flex',
      flexDirection: 'column',
    }} className="hero-panel">
      {/* Full-bleed resort image */}
      <img
        src="/images/resort-hero.png"
        alt="Luxury resort at dusk"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          opacity: 0.78,
        }}
      />

      {/* Refined gradient overlay — bottom-heavy for text legibility */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, rgba(15,28,24,0.25) 0%, rgba(15,28,24,0.1) 30%, rgba(15,28,24,0.55) 70%, rgba(15,28,24,0.88) 100%)',
      }} />

      {/* Top-left wordmark */}
      <div style={{ position: 'relative', zIndex: 10, padding: '36px 44px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 10, padding: '8px 14px',
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: 7,
            background: '#167A65',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L14.5 5.5V12.5L9 16L3.5 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
              <circle cx="9" cy="9" r="2" fill="white"/>
            </svg>
          </div>
          <span style={{ color: 'white', fontWeight: 600, fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Smart Resort 360
          </span>
        </div>
      </div>

      {/* Bottom editorial statement */}
      <div style={{ position: 'relative', zIndex: 10, marginTop: 'auto', padding: '0 44px 52px' }}>
        {/* Subtle decorative line */}
        <div style={{ width: 32, height: 2, background: '#167A65', borderRadius: 2, marginBottom: 24 }} />

        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(30px, 3.2vw, 46px)',
          lineHeight: 1.18,
          color: '#FFFFFF',
          margin: '0 0 16px',
          letterSpacing: '-0.5px',
        }}>
          Intelligence behind<br />every stay.
        </h1>

        <p style={{
          fontSize: 15.5,
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.72)',
          maxWidth: 380,
          margin: '0 0 36px',
        }}>
          Turn resort data into better decisions, exceptional guest experiences, and smarter operations.
        </p>

        {/* Three subtle stat pills */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Avg. occupancy lift', value: '+18%' },
            { label: 'Guest satisfaction', value: '4.9 / 5' },
            { label: 'Decisions automated', value: '2,400+' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: 8,
              padding: '8px 14px',
              display: 'flex', flexDirection: 'column', gap: 2,
            }}>
              <span style={{ color: '#DDEBE5', fontWeight: 700, fontSize: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {stat.value}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, letterSpacing: '0.02em' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main login form ─── */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailError = emailTouched && email && !emailValid;

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (!emailValid) { setError('Please enter a valid email address.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginType: 'staff', username: email, password }),
      });
      const data = await res.json();
      if (data.success) {
        login(data);
        if (data.user.role === 'manager') navigate('/manager/dashboard');
        else if (data.user.role === 'data_entry') navigate('/operations/dashboard');
        else navigate('/guest/home');
      } else {
        setError(data.message || 'Invalid credentials.');
      }
    } catch {
      setError('Cannot reach server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    if (role === 'manager') {
      login({
        user: { role: 'manager', name: 'Resort Manager', email: 'manager@smartresort360.ai' },
        token: 'demo-manager-token'
      });
      navigate('/manager/dashboard');
    } else if (role === 'data-entry') {
      login({
        user: { role: 'data_entry', name: 'Operations Staff', email: 'ops@smartresort360.ai' },
        token: 'demo-ops-token'
      });
      navigate('/operations/dashboard');
    } else if (role === 'guest') {
      login({
        user: { role: 'guest', name: 'Rahul Sharma', email: 'rahul.sharma@example.com' },
        token: 'demo-guest-token'
      });
      navigate('/guest/home');
    }
  };

  const inputStyle = (hasError) => ({
    width: '100%', boxSizing: 'border-box',
    padding: '12px 16px',
    border: `1.5px solid ${hasError ? '#C95C5C' : '#E5EAE7'}`,
    borderRadius: 10,
    fontSize: 14.5,
    color: '#17201C',
    background: '#FFFFFF',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
    transition: 'border-color 0.18s, box-shadow 0.18s',
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: '#F7F8F6',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* LEFT: hero panel */}
      <HeroPanel />

      {/* RIGHT: login panel */}
      <div style={{
        flex: '0 0 45%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        background: '#F7F8F6',
      }} className="login-panel">
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Brand mark */}
          <div style={{ marginBottom: 44 }}>
            <BrandMark />
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: 26,
              color: '#17201C',
              margin: '0 0 6px',
              letterSpacing: '-0.4px',
            }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 14.5, color: '#66716C', margin: 0 }}>
              Sign in to your resort management portal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#17201C', marginBottom: 7, letterSpacing: '0.01em' }}>
                Email
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="you@resort.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                onFocus={e => { e.target.style.borderColor = '#167A65'; e.target.style.boxShadow = '0 0 0 3px rgba(22,122,101,0.12)'; }}
                onBlurCapture={e => { e.target.style.borderColor = emailError ? '#C95C5C' : '#E5EAE7'; e.target.style.boxShadow = 'none'; }}
                style={inputStyle(emailError)}
                autoComplete="email"
              />
              {emailError && (
                <p style={{ margin: '5px 0 0', fontSize: 12.5, color: '#C95C5C', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertCircle size={12} /> Enter a valid email address
                </p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#17201C', marginBottom: 7, letterSpacing: '0.01em' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#167A65'; e.target.style.boxShadow = '0 0 0 3px rgba(22,122,101,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#E5EAE7'; e.target.style.boxShadow = 'none'; }}
                  style={{ ...inputStyle(false), paddingRight: 44 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#66716C', padding: 2, display: 'flex', alignItems: 'center',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: 8, padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 16,
              }}>
                <AlertCircle size={14} color="#C95C5C" />
                <span style={{ fontSize: 13, color: '#C95C5C' }}>{error}</span>
              </div>
            )}

            {/* Sign In button */}
            <SignInButton loading={loading} />
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            margin: '28px 0 22px',
          }}>
            <div style={{ flex: 1, height: 1, background: '#E5EAE7' }} />
            <span style={{ fontSize: 12, color: '#66716C', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
              Demo access
            </span>
            <div style={{ flex: 1, height: 1, background: '#E5EAE7' }} />
          </div>

          {/* Demo buttons */}
          <div style={{ display: 'flex', gap: 9 }}>
            {[
              { key: 'manager', label: 'Resort Manager', icon: <Building2 size={18} color="#167A65" /> },
              { key: 'data-entry', label: 'Operations', icon: <BarChart3 size={18} color="#167A65" /> },
              { key: 'guest', label: 'Guest', icon: <UserCheck size={18} color="#167A65" /> },
            ].map((d) => (
              <DemoButton key={d.key} icon={d.icon} label={d.label} onClick={() => handleDemo(d.key)} />
            ))}
          </div>

          {/* Footer note */}
          <p style={{
            marginTop: 32, fontSize: 12, color: '#66716C',
            textAlign: 'center', lineHeight: 1.6,
          }}>
            Demo accounts are pre-seeded for hackathon evaluation.<br />
            Production auth connects to PostgreSQL via JWT.
          </p>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .hero-panel { flex: 0 0 42% !important; }
          .login-panel { flex: 0 0 58% !important; }
        }
        @media (max-width: 640px) {
          .hero-panel { display: none !important; }
          .login-panel {
            flex: 1 1 100% !important;
            padding: 32px 20px !important;
          }
        }
        #login-email, #login-password {
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }
      `}</style>
    </div>
  );
}

/* ─── Sub-components ─── */
function SignInButton({ loading }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      id="sign-in-btn"
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', padding: '13px 20px',
        background: hover && !loading ? '#126453' : '#167A65',
        color: 'white',
        border: 'none', borderRadius: 10,
        fontSize: 15, fontWeight: 600,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'background 0.18s, transform 0.1s, box-shadow 0.18s',
        transform: hover && !loading ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hover && !loading
          ? '0 6px 20px rgba(22,122,101,0.28)'
          : '0 2px 8px rgba(22,122,101,0.15)',
        opacity: loading ? 0.75 : 1,
        letterSpacing: '0.01em',
      }}
    >
      {loading ? (
        <>
          <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
          Signing in…
        </>
      ) : (
        <>
          Sign In
          <ArrowRight size={16} />
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}

function DemoButton({ icon, label, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: 1, padding: '9px 6px',
        background: hover ? '#F0F7F4' : '#FFFFFF',
        border: `1.5px solid ${hover ? '#167A65' : '#E5EAE7'}`,
        borderRadius: 9,
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        transition: 'all 0.16s ease',
        color: hover ? '#167A65' : '#66716C',
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{
        fontSize: 11.5, fontWeight: 600,
        letterSpacing: '0.01em',
        fontFamily: "'Inter', sans-serif",
        lineHeight: 1,
      }}>
        {label}
      </span>
    </button>
  );
}
