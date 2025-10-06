/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.cbbettonagli.it',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/privacy-policy'], // se vuoi escludere qualche pagina
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
};