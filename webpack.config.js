const path = require("path");

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  entry: __dirname + "/app/main.js",
  output: {
    path: __dirname + "/public",
    filename: "bundle.js",
  },
  devtool: "eval-source-map",
  devServer: {
    contentBase: resolve("public"),
    historyApiFallback: true,
    inline: true,
  },
  resolve: {
    extensions: [".js", ".json"],
    alias: {
      "@": resolve("app"),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: [resolve("app")],
      },
    ],
  },
};
