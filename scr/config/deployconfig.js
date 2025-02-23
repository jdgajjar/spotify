module.exports = {
    // Example configuration
    publicPath: process.env.NODE_ENV === 'production' ? '/spotify/' : '/',
    outputDir: 'dist',
    assetsDir: 'static',
    devServer: {
      proxy: 'https://your-api-endpoint.com'
    }
  };