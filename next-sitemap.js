/** @type {import('next-sitemap').IConfig} */

const excludePaths = (process.env.NEXT_PUBLIC_SITEMAP_EXCLUDE || '/privacy-policy').split(',');

module.exports = {
  siteUrl: 'https://www.cbbettonagli.it',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: excludePaths, // può essere dinamica o fissa
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
};