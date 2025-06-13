# V0 Component Integration Workflow

This guide helps you generate V0 components that work immediately in our project without manual adjustments.

## 🎯 Quick Setup Prompt for V0

Copy and paste this into V0 along with your component request:

```
PROJECT REQUIREMENTS:
- React TypeScript with named exports
- NO Tailwind CSS - use React.CSSProperties (inline styles)
- Include standard props: className, state, size
- Use vanilla CSS properties and hex colors
- Export format: export function ComponentName()

REQUIRED INTERFACE:
interface ComponentNameProps {
  className?: string
  state?: 'default' | 'active' | 'processing' | 'success' | 'error'
  size?: 'sm' | 'md' | 'lg'
}

STYLING REQUIREMENTS:
- Use React.CSSProperties for all styles
- Size variants: sm, md, lg with specific dimensions
- State variants: different colors for each state
- Include hover effects with useState
- Use linear gradients: linear-gradient(135deg, #color1, #color2)
- No className props except for the main container

EXAMPLE STRUCTURE:
const containerStyle: React.CSSProperties = {
  position: 'relative',
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  width: sizeStyles[size].width,
  height: sizeStyles[size].height
}

[YOUR COMPONENT REQUEST HERE]
```

## 📋 Checklist Before Using V0 Component

After V0 generates the component, verify:

- ✅ Uses `export function ComponentName()` (not default export)
- ✅ Has proper TypeScript interface with className, state, size
- ✅ Uses React.CSSProperties instead of className styling
- ✅ No Tailwind classes (w-, h-, bg-, text-, flex, etc.)
- ✅ Includes hover state management with useState
- ✅ Uses hex colors directly (#f3f4f6 not gray-100)

## 🔧 Common Manual Fixes Needed

If V0 still generates Tailwind classes, here are quick replacements:

### Position & Layout
```javascript
// Instead of className="relative flex items-center"
style={{
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
}}
```

### Sizing
```javascript
// Instead of className="w-12 h-16"
style={{
  width: '48px',
  height: '64px'
}}
```

### Colors & Backgrounds
```javascript
// Instead of className="bg-emerald-100 text-emerald-700"
style={{
  backgroundColor: '#d1fae5',
  color: '#065f46'
}}
```

### Borders & Radius
```javascript
// Instead of className="border-2 border-emerald-300 rounded-lg"
style={{
  border: '2px solid #6ee7b7',
  borderRadius: '8px'
}}
```

## 🎨 Standard Color Palette

Use these hex codes for consistency:

```javascript
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
```

## 📱 Standard Size Configurations

```javascript
const sizeStyles = {
  sm: { width: '32px', height: '32px', fontSize: '10px' },
  md: { width: '48px', height: '48px', fontSize: '12px' },
  lg: { width: '64px', height: '64px', fontSize: '16px' }
}
```

## 🚀 Example V0 Prompt

```
Create a LoadingSpinner component for a React TypeScript project.

PROJECT REQUIREMENTS:
- React TypeScript with named exports  
- NO Tailwind CSS - use React.CSSProperties (inline styles)
- Include standard props: className, state, size
- Export format: export function LoadingSpinner()

COMPONENT SPECS:
- Animated spinning circle/ring
- Different colors based on state prop
- Size variants: sm (24px), md (32px), lg (48px)
- Smooth rotation animation
- Clean, modern design

REQUIRED INTERFACE:
interface LoadingSpinnerProps {
  className?: string
  state?: 'default' | 'active' | 'processing' | 'success' | 'error'
  size?: 'sm' | 'md' | 'lg'
}

Use React.CSSProperties for all styling, linear gradients for colors, and useState for any interactive states.
```

## ⚡ Pro Tips

1. **Be specific about "NO Tailwind"** - V0 defaults to Tailwind
2. **Request inline styles explicitly** - mention React.CSSProperties
3. **Provide the exact interface** - reduces prop mismatches
4. **Ask for hex colors** - prevents Tailwind color classes
5. **Mention your export format** - avoids default export issues

Following this workflow should give you components that work immediately without manual adjustments! 