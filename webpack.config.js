const path = require('path');

module.exports = {
  entry: {
    tabs: "./src/js/tabs.js",
    options: "./src/js/options.js"
         },
  output: {
    path: PATHS.build,
    filename: "[name].js"
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style!css" }
    ]
  }
};

