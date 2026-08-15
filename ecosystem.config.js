/**
 * PM2 Ecosystem Config
 *
 * Usage:
 *   With Docker:  docker run -e API_KEY="your_secret" ...
 *   Bare metal:   export API_KEY="your_secret" && pm2 start ecosystem.config.js
 *
 * If API_KEY is not set, the server will start WITHOUT authentication (insecure).
 */
module.exports = {
  apps: [
    {
      name: 'vps-metrics-backend',
      script: 'node',
      args: 'backend/dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3012,
        // API_KEY is intentionally read from the host environment, not hardcoded here.
        // Set it via: export API_KEY="your_secret" before running pm2 start
        API_KEY: process.env.API_KEY || ''
      }
    }
  ]
};
