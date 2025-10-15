/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/**',
      },
    ],
  },

  // 🔁 Redirect vecchi URL del sito (404 → /)
  async redirects() {
    return [
      // Redirect generici
      {
        source: '/:path*/',
        has: [
          {
            type: 'query',
            key: '',
            value: '',
          },
        ],
        destination: '/',
        permanent: true,
      },
      // Redirect feed XML/WordPress
      {
        source: '/:path*/feed',
        destination: '/',
        permanent: true,
      },
      {
        source: '/comments/feed',
        destination: '/',
        permanent: true,
      },
      // Redirect PDF o vecchi media
      {
        source: '/wp-content/:path*',
        destination: '/',
        permanent: true,
      },
      // Redirect vecchie pagine specifiche
      {
        source: '/home-2/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/tubi-flessibili/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/guarnizioni-di-tenuta/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/cosa-facciamo/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/apparecchiature-oleodinamiche/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/chi-siamo/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/contatti/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/raccordi/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/offerte/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/treviglio/:path*',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // 🧠 Header per forzare favicon aggiornata
  async headers() {
    return [
      {
        source: '/favicon-v3.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;