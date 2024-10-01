/** @type {import('next').NextConfig} */
const nextConfig = {
env: {
  PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET,
  PRIVY_APP_ID: process.env.PRIVY_APP_ID
}
};

export default nextConfig;
