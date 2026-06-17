import StyleDictionary from 'style-dictionary'

/**
 * Figma exports W3C tokens with $value.hex for colors and number values for font sizes.
 * This config transforms them into CSS custom properties.
 */

StyleDictionary.registerTransform({
  name: 'figma/color',
  type: 'value',
  filter: (token) => token.$type === 'color' || token.type === 'color',
  transform: (token) => {
    const val = token.$value ?? token.value
    if (typeof val === 'object' && val.hex) return val.hex
    return val
  },
})

StyleDictionary.registerTransform({
  name: 'figma/number-to-px',
  type: 'value',
  filter: (token) => {
    const type = token.$type ?? token.type
    return type === 'number' || type === 'dimension'
  },
  transform: (token) => {
    const val = token.$value ?? token.value
    if (typeof val === 'number') return `${val}px`
    return val
  },
})

const sd = new StyleDictionary({
  source: ['tokens/**/*.tokens.json'],
  platforms: {
    css: {
      transforms: ['name/kebab', 'figma/color', 'figma/number-to-px'],
      prefix: 'ds',
      buildPath: 'src/styles/dist/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
          options: { outputReferences: false },
        },
      ],
    },
  },
})

await sd.buildAllPlatforms()
