const nextConfig = {
  reactStrictMode: false,
  images: { unoptimized: true },
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5015/api/:path*',
      },
    ];
  },
};

export default nextConfig;
