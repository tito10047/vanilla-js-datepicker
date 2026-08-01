import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'vanilla-js-datepicker',
  description: 'Lightweight zero-dependency vanilla TypeScript datepicker',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api' },
      { text: 'Cookbook', link: '/cookbook/range' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Options', link: '/guide/options' },
          { text: 'Events', link: '/guide/events' },
          { text: 'Localization', link: '/guide/localization' },
          { text: 'Theming', link: '/guide/theming' },
        ],
      },
      {
        text: 'Cookbook',
        items: [
          { text: 'Range Picker', link: '/cookbook/range' },
          { text: 'Multiple Selection', link: '/cookbook/multiple' },
          { text: 'Async Cell Render', link: '/cookbook/async-cell' },
          { text: 'Disabled Dates', link: '/cookbook/disabled-dates' },
          { text: 'Inline Calendar', link: '/cookbook/inline' },
        ],
      },
      { text: 'API Reference', link: '/api' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/tito10047/vanilla-js-datepicker' },
    ],
  },
});
