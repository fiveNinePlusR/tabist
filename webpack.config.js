const path = require('path');

// can also use an array of configurations [{}, ..., {}]
module.exports = {
  // mode: "production", // enable many optimizations for production builds
  mode: "development", // enabled useful tools for development
  devtool: "nosources-source-map",

  entry: {
    tabs: "./src/js/tabs.js",
    options: "./src/js/options.js"
  },
  output: {
    path: path.resolve(__dirname, "tabist/"),
    filename: "[name].js"
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: {
          loader: "style!css"
        },
      }
    ]
  },

};

