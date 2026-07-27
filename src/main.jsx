import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { isSupabaseConfigured, supabase } from './supabase';
import './styles.css';

async function callOrbitApi(body) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.functions.invoke('orbit-api', { body });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

const Icon = ({ name, size = 18 }) => {
  const paths = {
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    spark: <><path d="m12 2 1.55 6.45L20 10l-6.45 1.55L12 18l-1.55-6.45L4 10l6.45-1.55L12 2Z"/><path d="m5 16 .65 2.35L8 19l-2.35.65L5 22l-.65-2.35L2 19l2.35-.65L5 16Z"/></>,
    check: <path d="m5 12 4.3 4.3L19 6.7"/>,
    play: <path d="m9 7 8 5-8 5V7Z" fill="currentColor" stroke="none"/>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    up: <><path d="m5 15 5-5 3 3 6-7"/><path d="M14 6h5v5"/></>,
    shield: <><path d="M12 3 5 6v5c0 4.7 3 8.5 7 10 4-1.5 7-5.3 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></>,
    chart: <><path d="M4 19V5M4 19h16"/><path d="m7 15 3-4 3 2 5-7"/></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5M12 7v5l3 2"/></>,
    settings: <><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19 12h2M3 12h2M12 3v2M12 19v2"/></>,
    logout: <><path d="M10 17 15 12 10 7"/><path d="M15 12H3M21 3v18"/></>,
    upload: <><path d="M12 16V4M8 8l4-4 4 4"/><path d="M4 15v4h16v-4"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

function MiniChart({ className = '' }) {
  return <svg className={className} viewBox="0 0 640 238" preserveAspectRatio="none" aria-label="BTC price chart">
    <defs>
      <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#c8ff36" stopOpacity=".40"/><stop offset="1" stopColor="#c8ff36" stopOpacity="0"/></linearGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <g stroke="#ffffff" opacity=".08"><path d="M0 34H640M0 86H640M0 138H640M0 190H640"/><path d="M96 0v238M236 0v238M376 0v238M516 0v238"/></g>
    <path d="M0 196 L20 188 38 191 58 174 77 180 96 155 115 163 133 143 151 155 169 126 188 130 207 100 225 107 245 93 265 112 284 80 303 94 322 61 341 72 359 56 378 67 396 37 415 49 434 26 453 45 473 31 492 56 510 48 529 73 548 62 567 83 585 69 605 89 623 75 640 78 V238 H0Z" fill="url(#chartFill)"/>
    <path d="M0 196 L20 188 38 191 58 174 77 180 96 155 115 163 133 143 151 155 169 126 188 130 207 100 225 107 245 93 265 112 284 80 303 94 322 61 341 72 359 56 378 67 396 37 415 49 434 26 453 45 473 31 492 56 510 48 529 73 548 62 567 83 585 69 605 89 623 75 640 78" fill="none" stroke="#d5ff48" strokeWidth="3.25" filter="url(#glow)"/>
    <line x1="0" y1="111" x2="640" y2="111" stroke="#ffb35a" strokeDasharray="5 5" opacity=".8"/>
    <circle cx="434" cy="26" r="5" fill="#d5ff48"/><circle cx="434" cy="26" r="10" fill="#d5ff48" opacity=".17"/>
  </svg>;
}

const navigation = [
  { label: 'Product', href: '#product', number: '01' },
  { label: 'How it works', href: '#how-it-works', number: '02' },
  { label: 'Pricing', href: '#pricing', number: '03' },
  { label: 'Resources', href: '#resources', number: '04' },
];

function usePageMotion(enabled = true) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('top');

  useEffect(() => {
    if (!enabled) return undefined;
    const updateHeader = () => setIsScrolled(window.scrollY > 24);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    return () => window.removeEventListener('scroll', updateHeader);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.12, rootMargin: '0px 0px -56px' },
    );
    const sectionObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActiveSection(entry.target.id)),
      { rootMargin: '-34% 0px -56% 0px', threshold: 0 },
    );
    const revealTargets = document.querySelectorAll('[data-reveal], main section:not(.hero)');
    const sectionTargets = document.querySelectorAll('#top, #product, #how-it-works, #pricing, #resources');
    revealTargets.forEach((target) => revealObserver.observe(target));
    sectionTargets.forEach((target) => sectionObserver.observe(target));
    return () => { revealObserver.disconnect(); sectionObserver.disconnect(); };
  }, [enabled]);

  return { activeSection, isScrolled };
}

function AuthScreen({ mode, onModeChange, onSuccess, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isSignup = mode === 'signup';
  const submit = async (event) => {
    event.preventDefault();
    if (!email || !password || (isSignup && !name) || submitting) return;
    if (!isSupabaseConfigured) { setStatus('Add your Supabase URL and publishable key to .env before signing in.'); return; }
    setSubmitting(true); setStatus(isSignup ? 'Creating your account…' : 'Signing you in…');
    let response;
    try {
      response = isSignup
        ? await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: window.location.origin } })
        : await supabase.auth.signInWithPassword({ email, password });
    } catch (error) {
      setSubmitting(false); setStatus(error.message || 'Authentication failed. Please try again.'); return;
    }
    setSubmitting(false);
    if (response.error) { setStatus(response.error.message); return; }
    if (isSignup && !response.data.session) { setStatus('Check your inbox to confirm your email, then return to sign in.'); return; }
    onSuccess(response.data.user);
  };
  return <main className="auth-screen">
    <div className="noise" />
    <div className="auth-layout shell">
      <section className="auth-showcase">
        <button className="auth-back" onClick={onBack}><Icon name="arrow" size={15}/> Back to Orbit</button>
        <a className="logo auth-logo" href="#top" onClick={onBack}><span className="mark"><i/><i/><i/></span>orbit</a>
        <div className="auth-promise"><span className="live-dot"/> Your edge is waiting</div>
        <h1>{isSignup ? <>Build a calmer<br/><em>trading process.</em></> : <>Good to see<br/><em>you again.</em></>}</h1>
        <p>Market intelligence that turns noisy charts into decisions you can trust.</p>
        <div className="auth-signal-card"><div className="auth-signal-top"><span><i/> ORBIT SIGNAL</span><small>BTC / USDT · 4H</small></div><div className="auth-signal-chart"><MiniChart/></div><div className="auth-signal-bottom"><span>Setup confidence <b>86%</b></span><span className="signal-positive">● Long bias</span></div></div>
      </section>
      <section className="auth-card"><div className="auth-card-head"><span className="auth-kicker">{isSignup ? 'Create your workspace' : 'Welcome back'}</span><h2>{isSignup ? 'Start trading with signal.' : 'Sign in to Orbit.'}</h2><p>{isSignup ? 'Your AI-assisted trading process starts here.' : 'Pick up where your market read left off.'}</p></div><div className="auth-tabs"><button type="button" className={!isSignup ? 'active' : ''} onClick={() => { setStatus(''); onModeChange('signin'); }}>Sign in</button><button type="button" className={isSignup ? 'active' : ''} onClick={() => { setStatus(''); onModeChange('signup'); }}>Create account</button></div><form onSubmit={submit} className="auth-form">{isSignup && <label>Full name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" autoComplete="name" required /></label>}<label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8+ characters" autoComplete={isSignup ? 'new-password' : 'current-password'} minLength="8" required /></label>{isSignup && <label className="auth-check"><input type="checkbox" required/><span>I agree to the Terms and Privacy Policy</span></label>}{status && <p className="auth-status" role="status">{status}</p>}<button className="button auth-submit" type="submit" disabled={submitting}><span>{submitting ? 'Connecting…' : isSignup ? 'Create free workspace' : 'Enter Orbit'}</span><Icon name="arrow" size={16}/></button></form><small className="auth-note">No credit card required · Educational tools for every trader</small></section>
    </div>
  </main>;
}

const coachAnswers = {
  default: { eyebrow: 'COACH NOTE · MARKET STRUCTURE', title: 'Start with structure, then add a trigger.', body: 'A clean trading plan answers three questions before the entry: where is price now, what would invalidate the idea, and where is the next logical target?', stats: [['Bias', 'Wait for confirmation'], ['Risk', 'Defined before entry'], ['Focus', 'Structure → trigger']], tags: ['Process first', 'Risk-aware'], tone: 'lime' },
  flag: { eyebrow: 'PATTERN BREAKDOWN · BULL FLAG', title: 'Bull flags are pauses inside an uptrend.', body: 'The strongest version follows an impulsive move, then compresses in a shallow channel. Look for contracting volume during the pause and a decisive close above the upper trendline.', stats: [['Best context', 'After impulse'], ['Trigger', 'Close + volume'], ['Invalidation', 'Flag low']], tags: ['Continuation', 'Momentum'], tone: 'purple' },
  support: { eyebrow: 'LEVELS · PRICE ACTION', title: 'Support is a zone, not a single line.', body: 'Treat support as an area where demand previously absorbed selling. Wait for a reaction and define the level that proves your thesis wrong—then size the position around that risk.', stats: [['Read', 'Demand zone'], ['Confirm with', 'Reaction + volume'], ['Avoid', 'Blind limit orders']], tags: ['Market structure', 'Risk'], tone: 'blue' },
  timeframe: { eyebrow: 'PLAYBOOK · TIMEFRAMES', title: 'Match the timeframe to the decision.', body: 'Use the daily or 4H chart for context, the 1H for the active setup, and 15m only for precise execution. A lower timeframe should refine your thesis—not replace it.', stats: [['Swing', '4H → 1H'], ['Scalp', '1H → 5m'], ['Rule', 'Context first']], tags: ['Top-down', 'Execution'], tone: 'orange' },
};

function getCoachAnswer(value) {
  const prompt = value.toLowerCase();
  if (prompt.includes('flag')) return coachAnswers.flag;
  if (prompt.includes('support') || prompt.includes('resistance')) return coachAnswers.support;
  if (prompt.includes('timeframe') || prompt.includes('swing') || prompt.includes('scalp')) return coachAnswers.timeframe;
  return coachAnswers.default;
}

function formatCoachAnswer(answer) {
  return {
    ...answer,
    body: answer.summary || answer.body,
    stats: (answer.stats || []).map((stat) => Array.isArray(stat) ? stat : [stat.label, stat.value]),
    tags: answer.tags || [],
    tone: answer.tone || 'lime',
  };
}

function InsightCard({ answer }) {
  return <article className={`insight-card insight-${answer.tone || 'lime'}`}><div className="insight-card-top"><span className="insight-spark"><Icon name="spark" size={15}/></span><div><span className="insight-eyebrow">{answer.eyebrow}</span><small>Orbit AI · just now</small></div><span className="insight-score">AI</span></div><h3>{answer.title}</h3><p>{answer.body}</p><div className="insight-stats">{answer.stats.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div><div className="insight-tags">{answer.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>;
}

function SkeletonInsight() {
  return <div className="insight-card skeleton-insight"><div className="skeleton-line skeleton-head"/><div className="skeleton-line skeleton-title"/><div className="skeleton-line"/><div className="skeleton-line short"/><div className="skeleton-grid"><i/><i/><i/></div></div>;
}

function Ticker({ symbol, price, change, points }) {
  const live = window.__orbitTickers?.[symbol];
  const displayedPrice = live?.price ?? price;
  const displayedChange = live?.change ?? change;
  return <div className="ticker"><div><span className="ticker-symbol">{symbol}</span><small>USDT</small></div><b>{displayedPrice}</b><span className={displayedChange.startsWith('+') ? 'ticker-up' : 'ticker-down'}>{displayedChange}</span><svg viewBox="0 0 56 22" preserveAspectRatio="none"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.8"/></svg></div>;
}

function CoachView() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState('');
  const [thinking, setThinking] = useState(false);
  const send = async (value = input) => {
    const trimmed = value.trim();
    if (!trimmed || thinking) return;
    setInput('');
    setMessages((current) => [...current, { role: 'user', text: trimmed }]);
    setThinking(true);
    try {
      const result = await callOrbitApi({ kind: 'coach', question: trimmed, conversationId: conversationId || undefined });
      setConversationId(result.conversationId);
      setMessages((current) => [...current, { role: 'assistant', answer: formatCoachAnswer(result.answer) }]);
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', answer: { eyebrow: 'COACH STATUS', title: 'Orbit could not reach the AI engine.', body: error.message || 'Please try again shortly.', stats: [['Action', 'Retry shortly']], tags: ['Connection issue'], tone: 'orange' } }]);
    } finally { setThinking(false); }
  };
  return <section className="dashboard-view coach-view"><div className="view-heading"><div><span className="view-kicker"><Icon name="spark" size={13}/> Trading Coach</span><h1>Ask better questions.<br/><em>Trade with clarity.</em></h1><p>Your on-demand market mentor for concepts, patterns and process.</p></div><div className="coach-status"><i/> Coach online</div></div><div className="coach-feed">{messages.map((message, index) => message.role === 'user' ? <div className="user-message" key={`${message.text}-${index}`}><span>{message.text}</span><small>You · now</small></div> : <InsightCard answer={message.answer} key={`${message.answer.title}-${index}`} />)}{thinking && <SkeletonInsight/>}</div><div className="coach-composer"><div className="suggested-chips"><button onClick={() => send("What's a bull flag?")}>What’s a bull flag?</button><button onClick={() => send('Explain support and resistance')}>Explain support &amp; resistance</button><button onClick={() => send('Best timeframe for swing trading')}>Best timeframe for swing trading</button></div><div className="composer-bar"><span className="composer-spark"><Icon name="spark" size={16}/></span><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && send()} placeholder="Ask your coach anything about the market..."/><button className="send-button" onClick={() => send()} aria-label="Send question"><Icon name="arrow" size={16}/></button></div><small className="dashboard-disclaimer">Orbit Coach is educational and does not provide financial advice.</small></div></section>;
}

function MarketReadCard({ analysis }) {
  const liveAnalysis = analysis;
  if (liveAnalysis) return <article className="market-read-card"><div className="market-read-head"><div><span className="view-kicker"><Icon name="spark" size={13}/> Orbit market read</span><h2>{liveAnalysis.summary}</h2></div><div className="read-bias"><small>Bias</small><b>{liveAnalysis.bias}</b><span>{liveAnalysis.confidence}% confidence</span></div></div><div className="read-metrics"><div><span>Trend</span><b>{liveAnalysis.trend}</b><small>{liveAnalysis.resistance?.[0] || 'Not visible'}</small></div><div><span>Entry zone</span><b>{liveAnalysis.entry_zone}</b><small>Wait for confirmation</small></div><div><span>Target</span><b>{liveAnalysis.targets?.[0] || 'Not visible'}</b><small>Key level</small></div><div><span>Stop-loss</span><b>{liveAnalysis.stop_loss}</b><small>{liveAnalysis.support?.[0] || 'Below invalidation'}</small></div></div><div className="read-checklist">{(liveAnalysis.checklist || []).slice(0, 3).map((item) => <span key={item}><Icon name="check" size={14}/>{item}</span>)}</div></article>;
  return <article className="market-read-card"><div className="market-read-head"><div><span className="view-kicker"><Icon name="spark" size={13}/> Orbit market read</span><h2>BTC is reclaiming<br/><em>the demand zone.</em></h2></div><div className="read-bias"><small>Bias</small><b>Long</b><span>78% confidence</span></div></div><div className="read-metrics"><div><span>Trend</span><b>↑ Bullish</b><small>Higher highs intact</small></div><div><span>Entry zone</span><b>$67,420–68,050</b><small>Wait for a retest</small></div><div><span>Target</span><b>$71,800</b><small>1 : 3.4 R/R</small></div><div><span>Stop-loss</span><b>$65,980</b><small>Below invalidation</small></div></div><div className="read-checklist"><span><Icon name="check" size={14}/> Structure holds above 4H support</span><span><Icon name="check" size={14}/> Volume confirms the reclaim</span><span><Icon name="check" size={14}/> Momentum is not overextended</span></div></article>;
}

function ChartPlaceholder() {
  return <div className="chart-placeholder"><div className="placeholder-grid"/><svg viewBox="0 0 800 300" preserveAspectRatio="none"><path d="M0 232 52 211 95 225 138 177 181 188 224 145 267 158 310 108 353 126 396 73 439 93 482 42 525 68 568 29 611 83 654 64 697 91 800 38" fill="none" stroke="#c8ff36" strokeWidth="4"/><path d="M0 232 52 211 95 225 138 177 181 188 224 145 267 158 310 108 353 126 396 73 439 93 482 42 525 68 568 29 611 83 654 64 697 91 800 38V300H0Z" fill="url(#dashboardChartFill)" opacity=".28"/></svg><span className="placeholder-tag">BTC / USDT · 4H</span></div>;
}

function ChartAnalysisViewLegacy() {
  const [fileUrl, setFileUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(URL.createObjectURL(file));
    setUploadStatus(''); setAnalyzed(false); setProcessing(true);
    let uploadedPath = '';
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const extension = file.name.split('.').pop() || 'png';
        const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const { error } = await supabase.storage.from('chart-uploads').upload(filePath, file, { contentType: file.type, upsert: false });
        if (error) setUploadStatus(`Chart is shown locally, but cloud storage needs setup: ${error.message}`);
        else uploadedPath = filePath;
      }
    }
    try {
      if (!uploadedPath) throw new Error('Your chart could not be stored securely. Please sign in and try again.');
      const result = await callOrbitApi({ kind: 'chart', storagePath: uploadedPath, market: 'BTC/USDT', timeframe: '4H' });
      setAnalysis(result.analysis); setAnalyzed(true);
    } catch (error) { setUploadStatus(error.message || 'Chart analysis is unavailable. Please try again.'); }
    finally { setProcessing(false); }
    return;
    window.setTimeout(async () => {
      setProcessing(false); setAnalyzed(true);
      if (!supabase || !uploadedPath) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from('chart_analyses').insert({
        user_id: user.id,
        storage_path: uploadedPath,
        market: 'BTC/USDT',
        timeframe: '4H',
        analysis: {
          trend: 'bullish',
          support: '$67,420',
          resistance: '$71,800',
          entry_zone: '$67,420–68,050',
          target: '$71,800',
          stop_loss: '$65,980',
          confidence: 78,
        },
      });
      if (error) setUploadStatus(`Chart is stored, but analysis history could not be saved: ${error.message}`);
    }, 950);
  };
  const reset = () => { if (fileUrl) URL.revokeObjectURL(fileUrl); setFileUrl(''); setUploadStatus(''); setAnalysis(null); setAnalyzed(false); setProcessing(false); };
  return <section className="dashboard-view analysis-view"><div className="view-heading analysis-heading"><div><span className="view-kicker"><Icon name="chart" size={13}/> Chart Analysis</span><h1>Upload a chart.<br/><em>See what matters.</em></h1><p>Orbit maps structure, risk and timing into one visual market read.</p></div><div className="analysis-time"><span className="live-dot"/> Analysis engine ready</div></div>{!fileUrl && <label className="upload-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handleFile(event.dataTransfer.files?.[0]); }}><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleFile(event.target.files?.[0])}/><span className="upload-icon"><Icon name="upload" size={23}/></span><b>Drop a chart screenshot here</b><span>or click to browse · PNG, JPG, WEBP</span><small>We’ll return trend, levels, entry, target and invalidation.</small></label>}{processing && <SkeletonInsight/>}{analyzed && <>{uploadStatus && <p className="upload-status" role="status">{uploadStatus}</p>}<MarketReadCard/><figure className="annotated-chart"><div className="chart-image-wrap">{fileUrl ? <img src={fileUrl} alt="Uploaded crypto chart"/> : <ChartPlaceholder/>}<span className="chart-line line-support">Support · $67,420</span><span className="chart-line line-resistance">Resistance · $71,800</span><span className="entry-highlight">Entry zone</span><i className="overlay-support"/><i className="overlay-resistance"/><i className="overlay-entry"/></div><figcaption><span><i className="legend-support"/> Support / resistance mapped by Orbit</span><button onClick={reset}>Analyze another chart <Icon name="arrow" size={14}/></button></figcaption></figure><div className="persistent-disclaimer"><Icon name="shield" size={15}/><span>Educational analysis — not financial advice. Always do your own research.</span></div></>}</section>;
}

function ChartAnalysisView() {
  const [fileUrl, setFileUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) { setUploadStatus('Please upload a PNG, JPG, or WEBP chart image.'); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadStatus('Please upload an image smaller than 10 MB.'); return; }
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(URL.createObjectURL(file)); setUploadStatus(''); setAnalysis(null); setAnalyzed(false); setProcessing(true);
    let uploadedPath = '';
    try {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Your session has expired. Please sign in again.');
      const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
      uploadedPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('chart-uploads').upload(uploadedPath, file, { contentType: file.type, upsert: false });
      if (uploadError) throw new Error(`Chart upload failed: ${uploadError.message}`);
      const result = await callOrbitApi({ kind: 'chart', storagePath: uploadedPath, market: 'BTC/USDT', timeframe: '4H' });
      if (!result?.analysis) throw new Error('The AI returned no chart analysis.');
      setAnalysis(result.analysis); setAnalyzed(true);
    } catch (error) { setUploadStatus(error.message || 'Chart analysis is unavailable. Please try again.'); }
    finally { setProcessing(false); }
  };

  const reset = () => { if (fileUrl) URL.revokeObjectURL(fileUrl); setFileUrl(''); setUploadStatus(''); setAnalysis(null); setAnalyzed(false); setProcessing(false); };
  const support = analysis?.support?.[0] || 'Not visible';
  const resistance = analysis?.resistance?.[0] || 'Not visible';
  return <section className="dashboard-view analysis-view"><div className="view-heading analysis-heading"><div><span className="view-kicker"><Icon name="chart" size={13}/> Chart Analysis</span><h1>Upload a chart.<br/><em>See what matters.</em></h1><p>Orbit maps structure, risk and timing into one visual market read.</p></div><div className="analysis-time"><span className="live-dot"/> Analysis engine ready</div></div>{!fileUrl && <label className="upload-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handleFile(event.dataTransfer.files?.[0]); }}><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleFile(event.target.files?.[0])}/><span className="upload-icon"><Icon name="upload" size={23}/></span><b>Drop a chart screenshot here</b><span>or click to browse · PNG, JPG, WEBP</span><small>We’ll return trend, levels, entry, target and invalidation.</small></label>}{uploadStatus && !processing && <p className="upload-status" role="status">{uploadStatus}</p>}{processing && <SkeletonInsight/>}{analyzed && analysis && <><MarketReadCard analysis={analysis}/><figure className="annotated-chart"><div className="chart-image-wrap"><img src={fileUrl} alt="Uploaded crypto chart analyzed by Orbit"/><span className="chart-line line-support">Support · {support}</span><span className="chart-line line-resistance">Resistance · {resistance}</span><span className="entry-highlight">Entry zone · {analysis.entry_zone || 'Not visible'}</span><i className="overlay-support"/><i className="overlay-resistance"/><i className="overlay-entry"/></div><figcaption><span><i className="legend-support"/> Levels mapped from this uploaded chart</span><button onClick={reset}>Analyze another chart <Icon name="arrow" size={14}/></button></figcaption></figure><div className="persistent-disclaimer"><Icon name="shield" size={15}/><span>Educational analysis — not financial advice. Always do your own research.</span></div></>}</section>;
}

function displayNameFor(user, profileName = '') { return profileName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Trader'; }
function initialsFor(name) { return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'TR'; }
function dashboardDate() { return new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()); }

function HistoryView() {
  const [state, setState] = useState({ loading: true, error: '', conversations: [], analyses: [] });
  useEffect(() => { let active = true; callOrbitApi({ kind: 'history' }).then((data) => active && setState({ loading: false, error: '', conversations: data.conversations || [], analyses: data.analyses || [] })).catch((error) => active && setState((current) => ({ ...current, loading: false, error: error.message || 'Could not load history.' }))); return () => { active = false; }; }, []);
  const items = [...state.conversations.map((item) => ({ ...item, type: 'Coach session', label: item.title || 'Coach session', date: item.updated_at })), ...state.analyses.map((item) => ({ ...item, type: 'Chart analysis', label: item.analysis?.summary || `${item.market || 'Chart'} read`, date: item.created_at }))].sort((a, b) => new Date(b.date) - new Date(a.date));
  return <section className="dashboard-page"><div className="page-heading"><span className="view-kicker"><Icon name="history" size={13}/> History</span><h1>Your market memory.</h1><p>Every coach session and chart read saved to your private Orbit workspace.</p></div>{state.loading && <div className="dashboard-list-state">Loading your history…</div>}{!state.loading && state.error && <div className="dashboard-list-state error">{state.error}</div>}{!state.loading && !state.error && !items.length && <div className="dashboard-list-state">Your saved sessions will appear here after your first question or chart analysis.</div>}{items.length > 0 && <div className="history-list">{items.map((item) => <article className="history-item" key={`${item.type}-${item.id}`}><span className="history-item-icon"><Icon name={item.type === 'Coach session' ? 'spark' : 'chart'} size={16}/></span><div><b>{item.label}</b><small>{item.type} · {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.date))}</small></div><Icon name="chevron" size={15}/></article>)}</div>}</section>;
}

function SettingsView({ user, profileName, onProfileSaved }) {
  const [name, setName] = useState(profileName || displayNameFor(user)); const [saving, setSaving] = useState(false); const [status, setStatus] = useState('');
  useEffect(() => setName(profileName || displayNameFor(user)), [profileName, user]);
  const save = async (event) => { event.preventDefault(); setSaving(true); setStatus(''); try { const result = await callOrbitApi({ kind: 'profile', action: 'update', displayName: name.trim() }); onProfileSaved(result.profile?.display_name || name.trim()); setStatus('Saved'); } catch (error) { setStatus(error.message || 'Could not save settings.'); } finally { setSaving(false); } };
  return <section className="dashboard-page"><div className="page-heading"><span className="view-kicker"><Icon name="settings" size={13}/> Settings</span><h1>Make Orbit yours.</h1><p>Update the identity shown across your private trading workspace.</p></div><form className="settings-card" onSubmit={save}><label>Display name<input value={name} onChange={(event) => setName(event.target.value)} maxLength="80" required/></label><label>Email address<input value={user?.email || ''} readOnly/></label><div className="settings-actions"><span className={status === 'Saved' ? 'settings-success' : 'settings-error'}>{status}</span><button className="button" type="submit" disabled={saving}><span>{saving ? 'Saving…' : 'Save changes'}</span><Icon name="arrow" size={15}/></button></div></form></section>;
}

function DashboardV2({ onLogout, user }) {
  const [, setTickerVersion] = useState(0); const [activeView, setActiveView] = useState('coach'); const [sidebarCollapsed, setSidebarCollapsed] = useState(false); const [userMenu, setUserMenu] = useState(false); const [profileName, setProfileName] = useState('');
  const name = displayNameFor(user, profileName); const initials = initialsFor(name);
  useEffect(() => { let active = true; callOrbitApi({ kind: 'profile', action: 'get' }).then((result) => active && setProfileName(result.profile?.display_name || '')).catch(() => {}); return () => { active = false; }; }, []);
  useEffect(() => { const socket = new WebSocket('wss://stream.binance.com:9443/stream?streams=btcusdt@miniTicker/ethusdt@miniTicker'); socket.onmessage = ({ data }) => { const tick = JSON.parse(data).data; const symbol = tick.s === 'BTCUSDT' ? 'BTC' : tick.s === 'ETHUSDT' ? 'ETH' : null; if (!symbol) return; window.__orbitTickers = { ...(window.__orbitTickers || {}), [symbol]: { price: `$${Number(tick.c).toLocaleString(undefined, { maximumFractionDigits: symbol === 'BTC' ? 0 : 2 })}`, change: `${Number(tick.P) >= 0 ? '+' : ''}${Number(tick.P).toFixed(2)}%` } }; setTickerVersion((version) => version + 1); }; return () => socket.close(); }, []);
  const navItems = [{ id: 'coach', label: 'Coach', icon: 'spark' }, { id: 'analysis', label: 'Chart Analysis', icon: 'chart' }, { id: 'history', label: 'History', icon: 'history' }, { id: 'settings', label: 'Settings', icon: 'settings' }];
  return <main className={`dashboard-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}><aside className="dashboard-sidebar"><div className="sidebar-brand"><a className="logo" href="#top"><span className="mark"><i/><i/><i/></span><span className="sidebar-word">orbit</span></a><button className="collapse-button" onClick={() => setSidebarCollapsed((value) => !value)} aria-label="Toggle sidebar"><Icon name="chevron" size={16}/></button></div><div className="workspace-pill"><span className="workspace-avatar">{initials.slice(0, 1)}</span><span><b>{name}’s workspace</b><small>Pro plan</small></span><Icon name="chevron" size={13}/></div><nav className="dashboard-nav" aria-label="Dashboard navigation">{navItems.map((item) => <button key={item.id} className={activeView === item.id ? 'active' : ''} onClick={() => setActiveView(item.id)}><Icon name={item.icon} size={17}/><span>{item.label}</span>{item.id === 'coach' && <i className="nav-notify"/>}</button>)}</nav><div className="sidebar-bottom"><button onClick={onLogout}><Icon name="logout" size={17}/><span>Log out</span></button><small>Orbit v1.0 · paper mode</small></div></aside><div className="dashboard-content"><header className="dashboard-topbar"><button className="mobile-sidebar-button" onClick={() => setSidebarCollapsed((value) => !value)} aria-label="Toggle dashboard menu"><span/><span/></button><div className="topbar-greeting"><span>{dashboardDate()}</span><b>Welcome back, {name} <em>✦</em></b></div><div className="ticker-strip"><Ticker symbol="BTC" price="$68,482" change="+4.28%" points="0,18 10,13 20,15 30,7 40,12 50,3 56,6"/><Ticker symbol="ETH" price="$3,542" change="+2.16%" points="0,15 10,17 20,11 30,14 40,8 50,10 56,4"/></div><div className="profile-menu-wrap"><button className="profile-button" onClick={() => setUserMenu((value) => !value)} aria-expanded={userMenu}><span className="profile-avatar">{initials}</span><span className="profile-name">{name}</span><Icon name="chevron" size={14}/></button>{userMenu && <div className="profile-dropdown"><b>{name}</b><small>{user?.email || 'No email available'}</small><button onClick={onLogout}>Log out <Icon name="logout" size={13}/></button></div>}</div></header>{activeView === 'coach' && <CoachView/>}{activeView === 'analysis' && <ChartAnalysisView/>}{activeView === 'history' && <HistoryView/>}{activeView === 'settings' && <SettingsView user={user} profileName={profileName} onProfileSaved={setProfileName}/>}</div></main>;
}

function Dashboard({ onLogout }) {
  const [, setTickerVersion] = useState(0);
  const [activeView, setActiveView] = useState('coach');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  useEffect(() => {
    const socket = new WebSocket('wss://stream.binance.com:9443/stream?streams=btcusdt@miniTicker/ethusdt@miniTicker');
    socket.onmessage = ({ data }) => {
      const tick = JSON.parse(data).data;
      const symbol = tick.s === 'BTCUSDT' ? 'BTC' : tick.s === 'ETHUSDT' ? 'ETH' : null;
      if (!symbol) return;
      window.__orbitTickers = { ...(window.__orbitTickers || {}), [symbol]: { price: `$${Number(tick.c).toLocaleString(undefined, { maximumFractionDigits: symbol === 'BTC' ? 0 : 2 })}`, change: `${Number(tick.P) >= 0 ? '+' : ''}${Number(tick.P).toFixed(2)}%` } };
      setTickerVersion((version) => version + 1);
    };
    return () => socket.close();
  }, []);
  const navItems = [{ id: 'coach', label: 'Coach', icon: 'spark' }, { id: 'analysis', label: 'Chart Analysis', icon: 'chart' }, { id: 'history', label: 'History', icon: 'history' }, { id: 'settings', label: 'Settings', icon: 'settings' }];
  return <main className={`dashboard-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}><aside className="dashboard-sidebar"><div className="sidebar-brand"><a className="logo" href="#top"><span className="mark"><i/><i/><i/></span><span className="sidebar-word">orbit</span></a><button className="collapse-button" onClick={() => setSidebarCollapsed((collapsed) => !collapsed)} aria-label="Toggle sidebar"><Icon name="chevron" size={16}/></button></div><div className="workspace-pill"><span className="workspace-avatar">A</span><span><b>Alex’s workspace</b><small>Pro plan</small></span><Icon name="chevron" size={13}/></div><nav className="dashboard-nav" aria-label="Dashboard navigation">{navItems.map((item) => <button key={item.id} className={activeView === item.id ? 'active' : ''} onClick={() => setActiveView(item.id)}><Icon name={item.icon} size={17}/><span>{item.label}</span>{item.id === 'coach' && <i className="nav-notify"/>}</button>)}</nav><div className="sidebar-bottom"><button onClick={onLogout}><Icon name="logout" size={17}/><span>Log out</span></button><small>Orbit v1.0 · paper mode</small></div></aside><div className="dashboard-content"><header className="dashboard-topbar"><button className="mobile-sidebar-button" onClick={() => setSidebarCollapsed((collapsed) => !collapsed)} aria-label="Toggle dashboard menu"><span/><span/></button><div className="topbar-greeting"><span>Monday, 24 June 2025</span><b>Welcome back, Alex <em>✦</em></b></div><div className="ticker-strip"><Ticker symbol="BTC" price="$68,482" change="+4.28%" points="0,18 10,13 20,15 30,7 40,12 50,3 56,6"/><Ticker symbol="ETH" price="$3,542" change="+2.16%" points="0,15 10,17 20,11 30,14 40,8 50,10 56,4"/></div><div className="profile-menu-wrap"><button className="profile-button" onClick={() => setUserMenu((open) => !open)} aria-expanded={userMenu}><span className="profile-avatar">AM</span><span className="profile-name">Alex Morgan</span><Icon name="chevron" size={14}/></button>{userMenu && <div className="profile-dropdown"><b>Alex Morgan</b><small>alex@example.com</small><button onClick={onLogout}>Log out <Icon name="logout" size={13}/></button></div>}</div></header>{activeView === 'coach' && <CoachView/>}{activeView === 'analysis' && <ChartAnalysisView/>}{activeView === 'history' && <section className="dashboard-empty"><Icon name="history" size={27}/><h2>Your analysis history</h2><p>Saved coach sessions and chart reads will appear here.</p><button className="button" onClick={() => setActiveView('coach')}><span>Ask the coach</span><Icon name="arrow" size={15}/></button></section>}{activeView === 'settings' && <section className="dashboard-empty"><Icon name="settings" size={27}/><h2>Workspace settings</h2><p>Personalize your workspace, alerts and display preferences.</p><button className="button" onClick={() => setActiveView('coach')}><span>Back to coach</span><Icon name="arrow" size={15}/></button></section>}</div></main>;
}

function App() {
  const [screen, setScreen] = useState('landing');
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('signin');
  const enterAuth = (mode) => { setAuthMode(mode); setScreen('auth'); };
  const enterDashboard = (nextUser) => { if (nextUser) setUser(nextUser); setScreen('dashboard'); };
  const logout = async () => { if (supabase) await supabase.auth.signOut(); setUser(null); setScreen('landing'); };
  const [menuOpen, setMenuOpen] = useState(false);
  const [timeframe, setTimeframe] = useState('4H');
  const [signal, setSignal] = useState('Long');
  const [toast, setToast] = useState('');
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2800); };
  const { activeSection, isScrolled } = usePageMotion(screen === 'landing');
  const closeMenu = () => setMenuOpen(false);
  useEffect(() => {
    document.body.classList.toggle('menu-is-open', menuOpen);
    return () => document.body.classList.remove('menu-is-open');
  }, [menuOpen]);
  useEffect(() => {
    if (screen === 'landing') { setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }); }
  }, [screen]);
  useEffect(() => {
    if (!supabase) return undefined;
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => { if (mounted) { setUser(session?.user || null); if (session) setScreen('dashboard'); } });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) { setUser(session?.user || null); setScreen(session ? 'dashboard' : 'landing'); }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);
  if (screen === 'auth') return <AuthScreen mode={authMode} onModeChange={setAuthMode} onSuccess={enterDashboard} onBack={() => setScreen('landing')} />;
  if (screen === 'dashboard') return <DashboardV2 onLogout={logout} user={user} />;
  return <main>
    <div className="noise" />
    <div className={`nav-wrap ${isScrolled ? 'is-scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}>
      <header className="nav shell">
        <a className="logo" href="#top" aria-label="Orbit home" onClick={closeMenu}><span className="mark"><i/><i/><i/></span>orbit</a>
        <nav className={menuOpen ? 'navlinks open' : 'navlinks'} id="primary-navigation" aria-label="Primary navigation">
          <span className="mobile-nav-label">Navigate Orbit</span>
          {navigation.map((item) => {
            const isActive = activeSection === item.href.slice(1);
            return <a key={item.href} href={item.href} className={isActive ? 'active' : ''} aria-current={isActive ? 'page' : undefined} onClick={closeMenu}><small>{item.number}</small><span>{item.label}</span><Icon name="arrow" size={15}/></a>;
          })}
         <div className="mobile-nav-actions"><button className="button" onClick={() => { closeMenu(); enterAuth('signup'); }}><span>Start free</span><Icon name="arrow" size={15}/></button><button className="text-btn" onClick={() => { closeMenu(); enterAuth('signin'); }}>Sign in to Orbit</button></div>
        </nav>
         <div className="nav-utility"><span className="nav-live"><i/>System live</span><div className="nav-actions"><button className="text-btn" onClick={() => enterAuth('signin')}>Sign in</button><button className="button button-small" onClick={() => enterAuth('signup')}><span>Start free</span><Icon name="arrow" size={15}/></button></div></div>
        <button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="primary-navigation" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}><span/><span/></button>
      </header>
    </div>

    <section className="hero shell" id="top" data-nav-section>
      <div className="aurora aurora-one"/><div className="aurora aurora-two"/>
      <div className="hero-copy" data-reveal>
        <div className="eyebrow"><span className="live-dot"/> AI chart intelligence, in real time</div>
        <h1>Trade the <em>signal.</em><br/>Ignore the noise.</h1>
        <p className="hero-text">Orbit turns complex market structure into clear, risk-aware trade ideas—so every decision feels faster, calmer, and backed by data.</p>
         <div className="hero-buttons"><button className="button" onClick={() => enterAuth('signup')}><span>Analyze a chart</span><Icon name="arrow"/></button><button className="video-btn" onClick={() => notify('Product tour coming right up.')}><span className="play"><Icon name="play" size={12}/></span>See Orbit in action</button></div>
        <div className="proof"><div className="avatars"><b>J</b><b>R</b><b>M</b><b>+</b></div><span><strong>18,000+</strong> traders find their edge with Orbit</span></div>
      </div>
      <div className="terminal-wrap" data-reveal style={{ '--delay': '120ms' }}>
        <div className="hero-orbit orbit-a"/><div className="hero-orbit orbit-b"/>
        <div className="terminal">
          <div className="terminal-top"><div className="pair"><span className="coin">₿</span><div><b>BTC / USDT</b><small>Bitcoin</small></div></div><div className="quote"><b>$68,482.10</b><span>+4.28%</span></div><button className="dots">•••</button></div>
          <div className="chart-tools"><div className="tabs">{['15m','1H','4H','1D'].map(x => <button key={x} className={timeframe === x ? 'active' : ''} onClick={() => setTimeframe(x)}>{x}</button>)}</div><span className="chart-title">BTCUSDT · {timeframe}</span><span className="status"><i/> Live</span></div>
          <div className="chart-area"><MiniChart/><span className="price-tag">68,482</span><span className="callout top-callout"><Icon name="spark" size={13}/> AI target<br/><b>$71,800</b></span><span className="callout buy-callout"><Icon name="up" size={13}/> Entry zone<br/><b>$67,420—$68,050</b></span></div>
          <div className="analysis-row"><div className="ai-card"><div className="ai-label"><span className="spark-icon"><Icon name="spark" size={14}/></span>ORBIT AI ANALYSIS</div><p>Momentum is strengthening above key support. A high-conviction continuation setup is forming.</p><div className="confidence"><span>Setup confidence</span><b>86%</b><div><i/></div></div></div><div className="side-signal"><span>Signal</span><button onClick={() => setSignal(signal === 'Long' ? 'Short' : 'Long')} className={signal === 'Long' ? 'signal-long' : 'signal-short'}>{signal} <Icon name="arrow" size={13}/></button><small>Risk: <b>Low</b></small></div></div>
        </div>
        <div className="float-card float-up"><span className="trend-badge"><Icon name="up" size={13}/></span><div><small>Win rate improvement</small><b>+23.7%</b></div><svg viewBox="0 0 90 32"><path d="M0 28 14 23 27 25 40 13 50 18 63 5 73 11 90 1" fill="none" stroke="#c8ff36" strokeWidth="2.5"/></svg></div>
        <div className="float-card float-scan"><span className="scan-icon"><Icon name="spark" size={15}/></span><div><b>Pattern detected</b><small>Ascending triangle</small></div><span className="check"><Icon name="check" size={13}/></span></div>
      </div>
    </section>

    <section className="brand-strip"><div className="shell"><p>BUILT FOR DECISIONS THAT MOVE AT MARKET SPEED</p><div className="brand-list"><b>BINANCE</b><b>bybit</b><b className="coinbase">◉ coinbase</b><b>OKX</b><b className="kraken">◈ kraken</b></div></div></section>

    <section className="problem shell" id="product"><div className="section-kicker">The Orbit advantage <span/></div><div className="problem-head"><h2>Less staring at charts.<br/><em>More certain trades.</em></h2><p>Orbit combines a trader’s discipline with machine-speed analysis, giving you a clean read on the market before emotion gets a vote.</p></div><div className="feature-grid">
      <article className="feature feature-wide"><div className="feature-number">01</div><div className="feature-copy"><div className="feature-icon"><Icon name="spark"/></div><h3>Your market copilot,<br/>not another signal group.</h3><p>Ask Orbit what matters. It reads price action, liquidity, volume and 20+ indicators in the context of your strategy.</p><a href="#how-it-works">Explore AI analysis <Icon name="arrow" size={15}/></a></div><div className="insight-panel"><div className="panel-head"><span><i/> ORBIT INSIGHT</span><small>Just now</small></div><p>BTC is respecting the 4H demand zone with rising buy pressure.</p><div className="insight-tags"><span>Structure bullish</span><span>Volume rising</span></div><div className="insight-line"><span>Ask anything about this setup</span><Icon name="arrow" size={15}/></div></div></article>
      <article className="feature"><div className="feature-number">02</div><div className="feature-icon purple"><Icon name="up"/></div><h3>Find the setup<br/>before the move.</h3><p>Real-time pattern recognition surfaces clean opportunities across your watchlist.</p><div className="radar"><i/><i/><i/><b/></div></article>
      <article className="feature"><div className="feature-number">03</div><div className="feature-icon blue"><Icon name="shield"/></div><h3>Risk clarity in<br/>every position.</h3><p>Know your entry, invalidation and potential reward before you click buy.</p><div className="risk-bars"><span><i style={{width:'82%'}}/></span><span><i style={{width:'48%'}}/></span><span><i style={{width:'67%'}}/></span><strong>1 : 3.4</strong></div></article>
    </div></section>

    <section className="workflow" id="how-it-works"><div className="workflow-glow"/><div className="shell"><div className="section-kicker">A clearer trading loop <span/></div><div className="workflow-title"><h2>From chart to conviction<br/><em>in three focused steps.</em></h2><p>Keep your edge simple. Orbit handles the heavy lifting while you stay in command.</p></div><div className="steps"><article><span>01</span><div className="step-icon upload"><i/><i/><i/></div><h3>Connect or upload</h3><p>Link your exchange or drop in a chart. Orbit understands your market in seconds.</p></article><article><span>02</span><div className="step-icon scan"><Icon name="spark"/><i/></div><h3>See what matters</h3><p>Get a complete read on trend, key levels, sentiment and setup quality.</p></article><article><span>03</span><div className="step-icon execute"><Icon name="check"/></div><h3>Execute with clarity</h3><p>Follow a structured plan with defined entries, stops and targets.</p></article></div></div></section>

    <section className="performance shell" id="pricing"><div className="performance-card"><div className="performance-copy"><div className="eyebrow"><Icon name="spark" size={13}/> Built for your best decisions</div><h2>Confidence is<br/><em>your new edge.</em></h2><p>Turn noisy, emotional trading into a repeatable process you can trust—one well-timed decision at a time.</p><button className="button" onClick={() => notify('Your seven-day trial is ready to start.')}><span>Start free for 7 days</span><Icon name="arrow"/></button><small>No credit card · Cancel anytime</small></div><div className="performance-stats"><div className="dial"><svg viewBox="0 0 180 180"><circle cx="90" cy="90" r="70"/><circle className="dial-value" cx="90" cy="90" r="70"/></svg><div><b>86</b><span>Setup score</span></div></div><div className="stat-list"><p><span>High-confidence setups</span><b>124 <em>↑ 18%</em></b></p><p><span>Average time saved</span><b>7.4h <em>weekly</em></b></p><p><span>Emotional trades avoided</span><b>31 <em>this month</em></b></p></div></div></div></section>

    <section className="testimonials shell" id="resources"><div><div className="section-kicker">Trusted by serious traders <span/></div><h2>Finally, analysis<br/>that speaks <em>trader.</em></h2></div><div className="quote-card"><div className="quote-mark">“</div><p>Orbit doesn't tell me what to do—it tells me what I need to see. That distinction has changed my entire process.</p><div className="person"><span className="person-avatar">AM</span><div><b>Alex M.</b><small>Futures trader · 4 years</small></div><div className="stars">★★★★★</div></div></div></section>

    <section className="cta shell"><div className="cta-aurora"/><div><div className="eyebrow"><span className="live-dot"/> Your edge is waiting</div><h2>Trade smarter<br/><em>starting today.</em></h2></div><div><p>Join thousands of traders building a calmer, more consistent relationship with the market.</p><button className="button" onClick={() => notify('Let’s build your trading edge.')}><span>Get started free</span><Icon name="arrow"/></button></div></section>

    <footer className="shell"><div className="footer-top"><a className="logo" href="#top"><span className="mark"><i/><i/><i/></span>orbit</a><p>Market intelligence for the decisions that matter.</p><div className="socials"><button>𝕏</button><button>in</button><button>◉</button></div></div><div className="footer-bottom"><span>© 2025 Orbit Labs, Inc.</span><div><a href="#top">Privacy</a><a href="#top">Terms</a><a href="#top">Security</a></div><span className="disclaimer">Trading involves risk. Nothing here is financial advice.</span></div></footer>
    {toast && <div className="toast"><Icon name="check" size={16}/>{toast}</div>}
  </main>
}

createRoot(document.getElementById('root')).render(<App />);
