#!/usr/bin/env node

/**
 * V0 Component Converter
 * Converts V0-generated components to match project standards
 * 
 * Usage: node scripts/convert-v0-component.js <input-file> <output-file>
 */

const fs = require('fs')
const path = require('path')

function convertV0Component(inputContent, componentName) {
  let converted = inputContent

  // Fix export format
  converted = converted.replace(
    /export default function Component\(\)/g,
    `export function ${componentName}({ className = '', state = 'default', size = 'md' }: ${componentName}Props)`
  )

  // Add proper interface if missing
  if (!converted.includes('interface') && !converted.includes('type')) {
    const interfaceCode = `
interface ${componentName}Props {
  className?: string
  state?: 'default' | 'active' | 'processing' | 'success' | 'error'
  size?: 'sm' | 'md' | 'lg'
}

`
    converted = converted.replace(
      /import React/,
      `import React, { useState } from 'react'\n${interfaceCode}`
    )
  }

  // Convert common Tailwind classes to CSS properties
  const tailwindToCss = {
    'w-full': 'width: "100%"',
    'h-full': 'height: "100%"',
    'flex': 'display: "flex"',
    'items-center': 'alignItems: "center"',
    'justify-center': 'justifyContent: "center"',
    'absolute': 'position: "absolute"',
    'relative': 'position: "relative"',
    'rounded-lg': 'borderRadius: "8px"',
    'shadow-lg': 'boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"',
    'cursor-pointer': 'cursor: "pointer"',
    'transition-transform': 'transition: "transform 0.3s ease"',
    'hover:scale-105': 'transform: isHovered ? "scale(1.05)" : "scale(1)"',
    'bg-gradient-to-br': 'background: "linear-gradient(135deg, ...)"',
    'from-emerald-100': '',
    'to-emerald-200': '',
    'border-2': 'border: "2px solid"',
    'border-emerald-300': 'borderColor: "#6ee7b7"'
  }

  // Convert className usage to style objects
  converted = converted.replace(
    /className="([^"]+)"/g,
    (match, classes) => {
      // This is a simplified conversion - for complex cases, manual review needed
      console.log(`Found className: ${classes}`)
      return 'style={{/* Converted from: ' + classes + ' */}}'
    }
  )

  // Remove wrapper divs that are just for demo
  converted = converted.replace(
    /<div className="flex items-center justify-center min-h-screen[^>]*>/g,
    '// Removed demo wrapper'
  )

  return converted
}

function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.log('Usage: node convert-v0-component.js <input-file> <output-file>')
    console.log('   or: node convert-v0-component.js <component-name> (reads from clipboard)')
    process.exit(1)
  }

  const [input, output] = args
  const componentName = path.basename(output || input, '.tsx')
  
  try {
    let content
    if (fs.existsSync(input)) {
      content = fs.readFileSync(input, 'utf8')
    } else {
      // If file doesn't exist, assume it's component name and read from clipboard
      console.log('Input file not found. Please paste V0 component code:')
      console.log('(This would integrate with clipboard in a real implementation)')
      process.exit(1)
    }

    const converted = convertV0Component(content, componentName)
    
    if (output) {
      fs.writeFileSync(output, converted)
      console.log(`✅ Converted component saved to: ${output}`)
    } else {
      console.log('✅ Converted component:')
      console.log(converted)
    }

    console.log('\n⚠️  Manual review needed for:')
    console.log('- Complex Tailwind class combinations')
    console.log('- State management integration')
    console.log('- Custom animations')
    console.log('- Prop interface adjustments')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
} 