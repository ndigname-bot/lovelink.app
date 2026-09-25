/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Creator-ID",
            value: "deadlyzarkan",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
