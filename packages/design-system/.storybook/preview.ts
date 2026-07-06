import type { Preview, Decorator } from '@storybook/react'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import { useEffect } from 'storybook/preview-api'
import '../src/styles/index.css'

/**
 * Custom decorator for data-color-scheme.
 *
 * withThemeByDataAttribute uses a single shared GLOBAL_KEY ("theme") for all
 * instances. Using it twice causes the brand decorator to receive color-scheme
 * names ("Dark"/"Light"), which don't exist in the brand themes map, resulting
 * in setAttribute('data-brand', undefined) and broken brand tokens.
 *
 * This decorator reads its own globalTypes entry ("colorScheme") independently.
 */
const withColorScheme: Decorator = (storyFn, context) => {
  const colorScheme = (context.globals['colorScheme'] as string) || 'light'
  useEffect(() => {
    document.querySelector('html')?.setAttribute('data-color-scheme', colorScheme)
  }, [colorScheme])
  return storyFn()
}

const preview: Preview = {
  globalTypes: {
    colorScheme: {
      description: 'Color scheme',
      defaultValue: 'light',
      toolbar: {
        title: 'Color Scheme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    withColorScheme,
    // withThemeByDataAttribute owns the addon-themes GLOBAL_KEY exclusively for brand.
    withThemeByDataAttribute({
      themes: {
        Neutral: 'neutral',
        'Client A': 'client-a',
        'Client B': 'client-b',
      },
      defaultTheme: 'Neutral',
      attributeName: 'data-brand',
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: { disable: true },
  },
}

export default preview
