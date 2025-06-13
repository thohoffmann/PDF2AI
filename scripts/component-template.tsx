import React, { useState } from 'react'

interface ComponentNameProps {
  className?: string
  state?: 'default' | 'active' | 'processing' | 'success' | 'error'
  size?: 'sm' | 'md' | 'lg'
}

export function ComponentName({ 
  className = '', 
  state = 'default',
  size = 'md'
}: ComponentNameProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Size configurations
  const sizeStyles = {
    sm: { width: '32px', height: '32px', fontSize: '12px' },
    md: { width: '48px', height: '48px', fontSize: '14px' },
    lg: { width: '64px', height: '64px', fontSize: '16px' }
  }

  // State-based styling
  const stateStyles = {
    default: {
      background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      borderColor: '#d1d5db',
      textColor: '#374151'
    },
    active: {
      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      borderColor: '#93c5fd',
      textColor: '#1d4ed8'
    },
    processing: {
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      borderColor: '#fbbf24',
      textColor: '#92400e'
    },
    success: {
      background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
      borderColor: '#6ee7b7',
      textColor: '#065f46'
    },
    error: {
      background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
      borderColor: '#f87171',
      textColor: '#991b1b'
    }
  }

  const currentSize = sizeStyles[size]
  const currentState = stateStyles[state]

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
    ...currentSize
  }

  const mainStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: currentState.background,
    border: `2px solid ${currentState.borderColor}`,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: currentState.textColor,
    fontSize: currentSize.fontSize,
    fontWeight: 'bold'
  }

  return (
    <div
      className={className}
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={mainStyle}>
        {/* Component content goes here */}
        Content
      </div>
    </div>
  )
}

/* 
USAGE EXAMPLE:
<ComponentName 
  state="success"
  size="md"
  className="transition-all duration-200"
/>

STYLING PATTERNS TO FOLLOW:
- Use React.CSSProperties for all styling
- Include size and state variations
- Use linear gradients for backgrounds
- Include hover effects with useState
- Use hex colors directly (#f3f4f6)
- Always include position, cursor, transition styles
*/ 