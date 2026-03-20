'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useAuth } from '@clerk/nextjs';

interface NavBarProps {
  readinessScore?: number;
}

export default function NavBar({ readinessScore }: NavBarProps) {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  const links = [
    { href: '/practice',  label: 'Practice'  },
    { href: '/problems',  label: 'Problems'  },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dna',       label: '🧬 DNA'    },
    { href: '/settings',  label: '⚙ Settings'},
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: '52px',
      borderBottom: '3px solid #0D0D0D',
      background: '#E8E4D9',
      display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: '4px',
    }}>

      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', marginRight: '12px', flexShrink: 0 }}>
        <span style={{ fontFamily: "'Impact','Arial Narrow',sans-serif", fontSize: '22px', letterSpacing: '0.04em', color: '#0D0D0D', lineHeight: 1 }}>
          BUGHUNT
        </span>
      </Link>

      {/* Nav links */}
      {links.map(link => {
        const isActive = pathname === link.href;
        return (
          <Link key={link.href} href={link.href} style={{
            textDecoration: 'none',
            fontFamily: 'monospace',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color: '#0D0D0D',
            padding: '4px 12px',
            borderBottom: isActive ? '3px solid #0D0D0D' : '3px solid transparent',
            borderTop: '3px solid transparent',
            lineHeight: 1.2,
          }}>
            {link.label}
          </Link>
        );
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Readiness pill */}
      {readinessScore !== undefined && readinessScore > 0 && (
        <div style={{
          background: '#F5C518',
          border: '2px solid #0D0D0D',
          boxShadow: '3px 3px 0 #0D0D0D',
          padding: '4px 14px',
          fontFamily: 'monospace',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginRight: '10px',
          flexShrink: 0,
        }}>
          {readinessScore}% Ready
        </div>
      )}

      {/* User button — only shown when signed in */}
      {isSignedIn && <UserButton />}
    </nav>
  );
}
