const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // This will proxy any request starting with /api
    createProxyMiddleware({
      target: 'https://salesdriver.co:8089', // Your actual API server
      changeOrigin: true,
      // This is the most important part:
      proxyTimeout: 60000, // Wait for 60 seconds (60,000 milliseconds)
      timeout: 60000, // Also set this for good measure
    })
  );
};