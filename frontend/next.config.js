/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '1337',
        pathname: '/**',
      },
      ...(process.env.NEXT_PUBLIC_IMAGE_HOST_PROTOCOL && process.env.NEXT_PUBLIC_IMAGE_HOST_NAME
        ? [
            {
        protocol: process.env.NEXT_PUBLIC_IMAGE_HOST_PROTOCOL,
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOST_NAME,
        port: '',
              pathname: '/**',
      },
          ]
        : []),
    ],
  },
};

module.exports = nextConfig;
