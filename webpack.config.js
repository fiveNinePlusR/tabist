const path = require('path');

// can also use an array of configurations [{}, ..., {}]
module.exports = {
  // mode: "production", // enable many optimizations for production builds
  mode: "development", // enabled useful tools for development
  // devtool: "nosources-source-map", // enables stack traces but disables sources
  devtool: "source-map", // enables stack traces but disables sources

  context: path.resolve(__dirname),

  entry: {
    tabs: "./src/js/tabs",
    options: "./src/js/options"
  },

  output: {
    path: path.resolve(__dirname, "tabist/"),
    filename: "[name].js"
  },

  //https://blog.usejournal.com/creating-a-react-app-from-scratch-f3c693b84658
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        options: { presets: ['env']}
      }
    ]
  },

  resolve: { extensions: ['*', '.js', '.jsx'] },

};

