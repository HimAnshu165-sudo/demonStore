import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      padding: '2rem',
      textAlign: 'center',
      position: 'relative',
      zIndex: 10,
    }}>
      <div style={{
        fontFamily: 'var(--font-kanji)',
        fontSize: '4rem',
        color: 'var(--color-crimson)',
      }}>
        四〇四
      </div>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2.5rem',
        letterSpacing: '0.1em',
        color: 'var(--color-bone-white)',
      }}>
        CHAMBER NOT FOUND
      </h1>
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '0.9rem',
        color: 'var(--color-muted-grey)',
        maxWidth: '400px',
        lineHeight: '1.6',
      }}>
        The dimensional hallway you are attempting to access does not exist within the Infinity Castle.
      </p>
      <Link
        href="/"
        style={{
          background: 'var(--color-crimson)',
          color: '#fff',
          padding: '0.8rem 2rem',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.8rem',
          letterSpacing: '0.15em',
          textDecoration: 'none',
          marginTop: '1rem',
        }}
      >
        RETURN TO ENTRANCE
      </Link>
    </main>
  );
}
