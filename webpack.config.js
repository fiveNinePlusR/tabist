module.exports = {
  entry: "./src/js/tabs.js",
  output: {
    path: __dirname + "/tabist",
    filename: "tabs.js"
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style!css" }
    ]
  }
};

