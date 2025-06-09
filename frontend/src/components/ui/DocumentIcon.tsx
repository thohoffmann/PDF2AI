import React from 'react'

interface DocumentIconProps {
  className?: string
  state?: 'default' | 'active' | 'processing' | 'success' | 'error'
  size?: 'sm' | 'md' | 'lg'
}

export function DocumentIcon({ 
  className = '', 
  state = 'default',
  size = 'md'
}: DocumentIconProps) {
  const sizeMap = {
    sm: { width: 45, height: 60 },
    md: { width: 70, height: 70 },
    lg: { width: 135, height: 180 }
  }

  const dimensions = sizeMap[size]

  return (
    <svg
      width={dimensions.width}
      height={dimensions.height}
      viewBox="0 0 90 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`document-icon document-icon--${state} document-icon--${size} ${className}`.trim()}
    >
      {/* Document background */}
      <path
        d="M15 10 C15 5 20 0 25 0 L65 0 L75 10 L75 80 C75 85 70 90 65 90 L25 90 C20 90 15 85 15 80 Z"
        className="document-icon__background"
      />
      
      {/* Folded corner */}
      <path
        d="M65 0 L65 10 L75 10 Z"
        className="document-icon__corner"
      />
      
      {/* Document lines */}
      <line
        x1="25" y1="20" x2="65" y2="20"
        className="document-icon__line"
        strokeWidth="2"
      />
      <line
        x1="25" y1="28" x2="65" y2="28"
        className="document-icon__line"
        strokeWidth="2"
      />
      <line
        x1="25" y1="36" x2="55" y2="36"
        className="document-icon__line"
        strokeWidth="2"
      />
      <line
        x1="25" y1="44" x2="65" y2="44"
        className="document-icon__line"
        strokeWidth="2"
      />
      <line
        x1="25" y1="52" x2="60" y2="52"
        className="document-icon__line"
        strokeWidth="2"
      />
      
      {/* PDF text */}
      <text
        x="45"
        y="70"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        className="document-icon__text"
      >
        PDF
      </text>
      
      {/* Scanning line - hidden by default, visible on hover */}
      <line
        x1="18" y1="80" x2="72" y2="80"
        className="document-icon__scan-line"
        strokeWidth="1"
      />
      
      {/* Scanning glow effect */}
      <line
        x1="18" y1="80" x2="72" y2="80"
        className="document-icon__scan-glow"
        strokeWidth="3"
      />
    </svg>
  )
} 