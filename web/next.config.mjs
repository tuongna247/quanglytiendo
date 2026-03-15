const API_URL = process.env.API_URL || 'http://localhost:5015';

const nextConfig = {
  reactStrictMode: false,
  images: { unoptimized: true },
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
