/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.cbbettonagli.it',
  generateRobotsTxt: true, // genera anche robots.txt
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/test'], // se hai pagine da escludere
};
console.log("🔍 NEXT_PUBLIC_SITEMAP_EXCLUDE:", process.env.NEXT_PUBLIC_SITEMAP_EXCLUDE);