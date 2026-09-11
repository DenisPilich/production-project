const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const CopyWebpackPlugin = require("copy-webpack-plugin"); // ✅ добавить

module.exports = (env = {}) => {
  const mode = env.mode || "development";
  const port = env.port || 3000;
  const isDev = mode === "development";
  const shouldAnalyze = Boolean(env.analyze);

  return {
    mode: mode,
    entry: path.resolve(__dirname, "src", "index.tsx"),
    output: {
      path: path.resolve(__dirname, "build"),
      filename: isDev ? "[name].[contenthash].js" : "[name].[contenthash].js",
      chunkFilename: isDev
        ? "[name].[contenthash].chunk.js"
        : "[name].[contenthash].chunk.js",
      clean: true,
      publicPath: "/",
    },
    optimization: {
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 5,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom|react-redux|react-i18next)[\\/]/,
            name: "react-vendors",
            chunks: "all",
            priority: 10,
          },
          redux: {
            test: /[\\/]node_modules[\\/](@reduxjs\/toolkit|redux)[\\/]/,
            name: "redux-vendors",
            chunks: "all",
            priority: 10,
          },
        },
      },
      runtimeChunk: "single",
    },
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public", "index.html"),
      }),
      new webpack.ProgressPlugin(),
      new webpack.DefinePlugin({
        __IS_DEV__: JSON.stringify(isDev),
      }),
      isDev && new webpack.HotModuleReplacementPlugin(),
      shouldAnalyze &&
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          openAnalyzer: false,
          reportFilename: "bundle-report.html",
        }),

      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "public/locales"),
            to: path.resolve(__dirname, "build/locales"),
          },
        ],
      }),
    ].filter(Boolean),
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.png$/,
          type: "asset/resource",
        },
        {
          test: /\.svg$/,
          use: ["@svgr/webpack"],
        },
        {
          test: /\.s[ac]ss$/i,
          use: ["style-loader", "css-loader", "sass-loader"],
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".jsx"],
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@config": path.resolve(__dirname, "config"),
        "react/jsx-runtime": path.resolve(
          __dirname,
          "node_modules/react/jsx-runtime.js",
        ), 
        react: path.resolve(__dirname, "node_modules/react"),
        "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      },
    },
    devtool: isDev ? "inline-source-map" : false,
    devServer: isDev
      ? {
          port: port,
          open: true,
          hot: true,
          historyApiFallback: true,
        }
      : undefined,
  };
};
