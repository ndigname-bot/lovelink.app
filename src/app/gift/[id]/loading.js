export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center">
      <div style={{ color: '#ec4899', fontSize: '4rem', animation: 'pulse 2s infinite', marginBottom: '2rem' }}>
        ❤️
      </div>
      <p style={{ color: '#a1a1aa', fontWeight: '500', animation: 'pulse 2s infinite' }}>Unwrapping gift...</p>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.5; }
        }
      `}} />
    </div>
  );
}
