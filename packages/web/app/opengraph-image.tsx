import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const alt = 'CodeCompass - AI-Powered Codebase Onboarding'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        />
        
        {/* Compass icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <svg
            width="180"
            height="180"
            viewBox="0 0 512 512"
            style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))' }}
          >
            <circle cx="256" cy="256" r="240" fill="white" opacity="0.95" />
            <circle cx="256" cy="256" r="180" fill="none" stroke="#f56565" strokeWidth="8" opacity="0.3" />
            <circle cx="256" cy="256" r="160" fill="none" stroke="#f56565" strokeWidth="4" opacity="0.5" />
            <circle cx="256" cy="96" r="8" fill="#f56565" />
            <circle cx="256" cy="416" r="8" fill="#f56565" />
            <circle cx="96" cy="256" r="8" fill="#f56565" />
            <circle cx="416" cy="256" r="8" fill="#f56565" />
            <g transform="translate(256, 256) rotate(-15)">
              <path d="M 0,-120 L 20,0 L 0,10 L -20,0 Z" fill="#f56565" />
              <path d="M 0,120 L -20,0 L 0,-10 L 20,0 Z" fill="#f56565" opacity="0.4" />
              <circle cx="0" cy="0" r="14" fill="#f56565" />
              <circle cx="0" cy="0" r="8" fill="white" />
            </g>
          </svg>
        </div>
        
        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: '80px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: '20px',
            textShadow: '0 4px 12px rgba(0,0,0,0.2)',
            letterSpacing: '-2px',
          }}
        >
          CodeCompass
        </div>
        
        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: '36px',
            color: 'white',
            textAlign: 'center',
            opacity: 0.95,
            maxWidth: '900px',
            lineHeight: 1.4,
            textShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          Make joining new codebases 10x faster with AI
        </div>
        
        {/* Code accent */}
        <div
          style={{
            display: 'flex',
            fontSize: '64px',
            color: 'white',
            marginTop: '40px',
            opacity: 0.7,
            fontFamily: 'monospace',
          }}
        >
          {'</>'}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
