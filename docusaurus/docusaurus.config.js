module.exports = {
  title: 'Spatial Commerce Projects',
  tagline: 'This is a microsite for the Spatial Commerce team to share sometimes-interactive summaries of each sprint.',
  url: 'https://spatial-commerce-projects.docs.shopify.io',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'Shopify',
  projectName: 'spatial-commerce-projects',
  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    prism: {
      additionalLanguages: ['ruby', 'sql'],
    },
    navbar: {
      title: 'Spatial Commerce Projects',
      items: [
        {
          href: 'https://github.com/shopify/spatial-commerce-projects',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Microsite Docs',
          items: [
            {
              label: 'Microsite Docs',
              to: 'https://development.shopify.io/engineering/keytech/apidocs/microsites',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/shopify/spatial-commerce-projects',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Shopify Inc.`,
    },
  },
  plugins: [
    [
      "@easyops-cn/docusaurus-search-local",
      {
        docsDir: 'docs',
        indexPages: true,
        docsRouteBasePath: '/',
      }
    ]
  ],
  themes: ['@shopify/docusaurus-shopify-theme'],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          path: 'docs',
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/shopify/spatial-commerce-projects/edit/main/docusaurus/',
        },
        blog: false,
        pages: false,
        sitemap: false,
      },
    ],
  ],
};
