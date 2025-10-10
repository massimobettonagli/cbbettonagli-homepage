/** @type {import('next-sitemap').IConfig} */

// Se vuoi gestire esclusioni anche da variabile d'ambiente, lo gestiamo qui:
const excludePaths = process.env.NEXT_PUBLIC_SITEMAP_EXCLUDE?.split(',') || ['/test'];

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cbbettonagli.it',
  generateRobotsTxt: true, // genera anche robots.txt
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: excludePaths, // esclude percorsi specifici o da env
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: excludePaths },
    ],
  },
};