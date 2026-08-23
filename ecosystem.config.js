/**
 * PM2 Ecosystem Config
 *
 * Usage:
 *   With Docker:  docker run ...
 *   Bare metal:   pm2 start ecosystem.config.js
 *
 * The server starts in open mode (direct access).
 */
module.exports = {
  apps: [
    {
      name: 'vps-metrics-backend',
      script: 'node',
      args: 'backend/dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3012
      }
    }
  ]
};
