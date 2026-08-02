import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'vanilla-js-datepicker',
  description: 'Lightweight zero-dependency vanilla TypeScript datepicker',
  base: '/vanilla-js-datepicker/',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'vanilla-js-datepicker' }],
    ['meta', {
      property: 'og:description',
      content: 'Lightweight, dependency-free datepicker for vanilla JavaScript and TypeScript.',
    }],
  ],

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api' },
      { text: 'Cookbook', link: '/cookbook/range' },
      { text: 'Demo', link: 'https://tito10047.github.io/vanilla-js-datepicker/demo/', target: '_blank' },
      {
        text: 'v0.1.0',
        items: [
          { text: 'Changelog', link: 'https://github.com/tito10047/vanilla-js-datepicker/releases' },
        ],
      },
      {
        text: 'Links',
        items: [
          { text: 'GitHub', link: 'https://github.com/tito10047/vanilla-js-datepicker' },
          { text: 'npm', link: 'https://www.npmjs.com/package/vanilla-js-datepicker' },
        ],
      },
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
    search: { provider: 'local' },
    editLink: {
      pattern: 'https://github.com/tito10047/vanilla-js-datepicker/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 tito10047',
    },
  },
});
