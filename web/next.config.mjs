const API_URL = process.env.API_URL || 'http://localhost:5015';

const nextConfig = {
  reactStrictMode: false,
  images: { unoptimized: true },
  output: 'standalone',
  experimental: {
    optimizePackageImports: [
      '@tabler/icons-react',
      '@mui/icons-material',
      '@mui/material',
      '@mui/lab',
      'lodash',
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
      {
        source: '/hubs/:path*',
        destination: `${API_URL}/hubs/:path*`,
      },
    ];
  },
};

export default nextConfig;
