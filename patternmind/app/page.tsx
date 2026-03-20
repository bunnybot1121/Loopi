import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect('/practice');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'relative', zIndex: 10,
        borderBottom: '3px solid #0D0D0D',
        background: '#E8E4D9',
        height: '52px',
        display: 'flex', alignItems: 'center',
        padding: '0 28px', gap: '20px',
      }}>
        <span style={{ fontFamily: "'Impact','Arial Narrow',sans-serif", fontSize: '24px', letterSpacing: '0.04em', lineHeight: 1 }}>
          BUGHUNT
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.45 }}>Docs</span>
          <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.45 }}>Status</span>
          <Link href="/sign-in" style={{
            background: '#FF4EB8', border: '2px solid #0D0D0D', boxShadow: '3px 3px 0 #0D0D0D',
            padding: '5px 18px', textDecoration: 'none',
            fontFamily: 'monospace', fontSize: '11px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0D0D0D',
          }}>
            Join
          </Link>
        </div>
      </nav>

      {/* ── FLOATING SHAPES ── */}
      <div style={{ position: 'absolute', top: '120px', left: '60px', width: '88px', height: '88px', background: '#F5C518', border: '3px solid #0D0D0D', boxShadow: '5px 5px 0 #0D0D0D', transform: 'rotate(-8deg)', zIndex: 1 }} />
      <div style={{ position: 'absolute', top: '340px', left: '100px', width: 0, height: 0, borderLeft: '30px solid transparent', borderRight: '30px solid transparent', borderBottom: '52px solid #00E8C6', zIndex: 1 }} />
      <div style={{ position: 'absolute', top: '110px', right: '60px', width: '105px', height: '85px', background: '#FF4EB8', border: '3px solid #0D0D0D', boxShadow: '5px 5px 0 #0D0D0D', borderRadius: '10px', transform: 'rotate(7deg)', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: '100px', right: '120px', fontSize: '80px', lineHeight: 1, zIndex: 1, userSelect: 'none' }}>⭐</div>

      {/* ── HERO ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', position: 'relative', zIndex: 2 }}>
        <div style={{
          background: 'white',
          border: '3px solid #0D0D0D',
          boxShadow: '8px 8px 0 #0D0D0D',
          padding: '44px 40px',
          width: '100%', maxWidth: '460px',
          position: 'relative',
        }}>
          {/* Right accent */}
          <div style={{ position: 'absolute', top: '6px', right: '-10px', bottom: '-10px', width: '8px', background: '#00E8C6', border: '2px solid #0D0D0D', borderLeft: 'none' }} />

          {/* Heading */}
          <h1 style={{ fontFamily: "'Impact','Arial Narrow',sans-serif", fontSize: '58px', lineHeight: 0.95, marginBottom: '16px', color: '#0D0D0D' }}>
            START YOUR<br />
            <em style={{ color: '#FF4EB8', fontStyle: 'italic' }}>HINDSIGHT</em><br />
            JOURNEY
          </h1>

          {/* Tagline */}
          <div style={{ borderLeft: '3px solid #F5C518', paddingLeft: '12px', marginBottom: '28px' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#555', lineHeight: 1.6 }}>
              The coding mentor that remembers<br />why you fail — not just that you did.
            </p>
          </div>

          {/* Feature badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '28px' }}>
            {[
              { t: '🧠 Hindsight memory',       bg: '#FF4EB8' },
              { t: '⚡ AI-generated challenges', bg: '#F5C518' },
              { t: '📊 Pattern diagnosis',       bg: '#00E8C6' },
              { t: '🎯 Skill gap analyzer',      bg: '#F5C518' },
            ].map(f => (
              <span key={f.t} style={{
                background: f.bg, border: '2px solid #0D0D0D', padding: '4px 10px',
                fontFamily: 'monospace', fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
              }}>
                {f.t}
              </span>
            ))}
          </div>

          {/* CTA */}
          <Link href="/sign-up" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#00E8C6', border: '3px solid #0D0D0D', boxShadow: '4px 4px 0 #0D0D0D',
            padding: '14px 20px', textDecoration: 'none',
            fontFamily: 'monospace', fontSize: '14px', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0D0D0D',
            marginBottom: '16px',
          }}>
            Join the Mentality →
          </Link>

          <hr style={{ border: 'none', borderTop: '2px dashed rgba(0,0,0,0.15)', margin: '0 0 14px' }} />
          <p style={{ fontFamily: 'monospace', fontSize: '11px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888' }}>
            Already registered?{' '}
            <Link href="/sign-in" style={{ color: '#FF4EB8', textDecoration: 'underline', fontWeight: 700 }}>
              Return to login prompt
            </Link>
          </p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        borderTop: '3px solid #0D0D0D',
        padding: '12px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#E8E4D9',
      }}>
        <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em' }}>BUG_HUNT</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          {['Docs', 'Status', 'Privacy'].map(t => (
            <span key={t} style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.5 }}>{t}</span>
          ))}
        </div>
        <span style={{ fontFamily: 'monospace', fontSize: '10px', opacity: 0.35 }}>© 2024 BUG_HUNT. SYNTHETIC_BLUEPRINT_V1.0</span>
      </div>
    </div>
  );
}
