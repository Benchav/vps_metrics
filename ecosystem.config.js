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
    },
    {
      name: 'vps-metrics-frontend',
      script: 'serve',
      args: '-s frontend/dist -l 3015',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
