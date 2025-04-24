const path = require('path');

module.exports = {
  mode: 'production', // Use 'development' for debugging or 'production' for optimized builds
  entry: './dist/index.js', // Entry point of your project
  output: {
    path: path.resolve(__dirname, 'dist/final'), // Output directory
    filename: 'jizy-modal.min.js', // Output file name
    library: 'JizyDOM', // Name of the global variable for UMD builds
    libraryTarget: 'umd', // Universal Module Definition (UMD) for compatibility
    globalObject: 'this', // Ensures compatibility in different environments (e.g., Node.js, browser)
    clean: true // Cleans the output directory before each build
  },
  resolve: {
    extensions: ['.ts', '.js'], // Resolve TypeScript and JavaScript files
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // Match TypeScript files
        use: 'ts-loader', // Use ts-loader to transpile TypeScript
        exclude: /node_modules/, // Exclude node_modules from transpilation
      },
    ],
  },
  devtool: 'source-map', // Generate source maps for easier debugging
};