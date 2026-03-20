import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#E8E4D9',
      backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.10) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Nav */}
      <nav style={{ borderBottom: '3px solid #0D0D0D', padding: '0 28px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#E8E4D9', flexShrink: 0 }}>
        <Link href="/" style={{ fontFamily: "'Impact','Arial Narrow',sans-serif", fontSize: '22px', letterSpacing: '0.04em', textDecoration: 'none', color: '#0D0D0D', lineHeight: 1 }}>
          BUGHUNT
        </Link>
        <Link href="/sign-in" style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', textDecoration: 'none' }}>
          Have an account? Sign in →
        </Link>
      </nav>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px 60px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Header block */}
          <div style={{ background: 'white', border: '3px solid #0D0D0D', boxShadow: '6px 6px 0 #0D0D0D', padding: '28px 28px 24px', marginBottom: '0', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '6px', right: '-8px', bottom: '-8px', width: '7px', background: '#00E8C6', border: '2px solid #0D0D0D', borderLeft: 'none', zIndex: -1 }} />
            <h1 style={{ fontFamily: "'Impact','Arial Narrow',sans-serif", fontSize: '48px', lineHeight: 0.92, color: '#0D0D0D', marginBottom: '10px' }}>
              START YOUR<br /><em style={{ color: '#FF4EB8' }}>HINDSIGHT</em><br />JOURNEY
            </h1>
            <div style={{ borderLeft: '3px solid #F5C518', paddingLeft: '12px', borderTop: '2px dashed rgba(0,0,0,0.15)', paddingTop: '12px' }}>
              <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#555', lineHeight: 1.5 }}>
                The coding mentor that remembers why you fail.
              </p>
            </div>
          </div>

          {/* Clerk SignUp component */}
          <div style={{ marginTop: '16px' }}>
            <SignUp />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '3px solid #0D0D0D', padding: '12px 28px', display: 'flex', justifyContent: 'space-between', background: '#E8E4D9', flexShrink: 0 }}>
        <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em' }}>BUG_HUNT</span>
        <span style={{ fontFamily: 'monospace', fontSize: '10px', opacity: 0.35 }}>© 2024 BUG_HUNT</span>
      </div>
    </div>
  );
}
