// import path from 'path';
// import { fileURLToPath } from 'url';
// import HtmlWebpackPlugin from 'html-webpack-plugin';
// import webpack from 'webpack';
// import dotenv from 'dotenv';
// import TerserPlugin from 'terser-webpack-plugin';
// import CopyWebpackPlugin from 'copy-webpack-plugin';

// dotenv.config();

// const filename = fileURLToPath(import.meta.url);
// const dirname = path.dirname(filename);

// export default {
//   entry: './src/index.jsx',

//   output: {
//     filename: 'bundle.js',
//     path: path.resolve(dirname, 'dist'),
//     publicPath: './',
//     clean: true,
//     globalObject: 'self', // Prevents Webpack runtime from using new Function()
//     environment: {
//       arrowFunction: false, // safer for extensions / older browsers
//       const: true,
//       dynamicImport: false
//     }
//   },

//   target: ['web', 'es2020'],
//   devtool: false,

//   resolve: {
//     extensions: ['.jsx', '.js', '.json'],
//     alias: {
//       react: path.resolve('./node_modules/react'),
//       'react-dom': path.resolve('./node_modules/react-dom')
//     },
//     fullySpecified: false,
//     symlinks: true,
//     mainFields: ['browser', 'module', 'main']
//   },

//   module: {
//     rules: [
//       // ✅ NEW RULE — transpile @mui and @emotion (prevents `new Function()` usage)
//       {
//         test: /\.(js|jsx|mjs)$/,
//         include: [
//           path.resolve('./src'),
//           path.resolve('./node_modules/@mui'),
//           path.resolve('./node_modules/@emotion')
//         ],
//         use: {
//           loader: 'babel-loader',
//           options: {
//             presets: [['@babel/preset-env', { targets: 'defaults' }], '@babel/preset-react'],
//             plugins: [
//               ['@emotion', { sourceMap: false, autoLabel: 'never', labelFormat: '[local]' }]
//             ]
//           }
//         }
//       },

//       // existing babel rule for app source
//       {
//         test: /\.(js|jsx)$/,
//         exclude: /node_modules/,
//         use: {
//           loader: 'babel-loader',
//           options: {
//             presets: [['@babel/preset-env', { targets: 'defaults' }], '@babel/preset-react'],
//             plugins: [
//               ['@emotion', { sourceMap: false, autoLabel: 'never', labelFormat: '[local]' }]
//             ]
//           }
//         }
//       },

//       {
//         test: /\.scss$/,
//         use: ['style-loader', 'css-loader', 'sass-loader']
//       },
//       {
//         test: /\.css$/,
//         use: ['style-loader', 'css-loader']
//       },
//       {
//         test: /\.(png|jpe?g|gif|svg)$/i, // ✅ Handle imported images too
//         type: 'asset/resource',
//         generator: {
//           filename: 'assets/[name][ext]'
//         }
//       }
//     ]
//   },

//   cache: {
//     type: 'filesystem',
//     buildDependencies: {
//       config: [filename]
//     }
//   },

//   optimization: {
//     minimize: true,
//     minimizer: [
//       new TerserPlugin({
//         extractComments: false,
//         terserOptions: {
//           compress: {
//             drop_console: true,
//             passes: 2
//           },
//           format: { comments: false },
//           safari10: true
//         }
//       })
//     ]
//   },

//   devServer: {
//     static: {
//       directory: path.join(dirname, 'public'),
//       watch: true
//     },
//     compress: true,
//     port: 1337,
//     hot: true,
//     open: true,
//     headers: {
//       'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
//       Pragma: 'no-cache',
//       Expires: '0',
//       'Surrogate-Control': 'no-store'
//     }
//   },

//   plugins: [
//     new HtmlWebpackPlugin({
//       template: path.resolve(dirname, 'public/index.html')
//     }),

//     new CopyWebpackPlugin({
//       patterns: [
//         {
//           from: path.resolve(dirname, 'public'), // copy everything from /public
//           to: path.resolve(dirname, 'dist'), // to dist root
//           noErrorOnMissing: true,
//           globOptions: { ignore: ['**/index.html'] } // already handled by HtmlWebpackPlugin
//         }
//       ]
//     }),
//     // ✅ Runtime sanitizer plugin — removes dangerous or dev-only code from final JS
//     {
//       apply(compiler) {
//         compiler.hooks.compilation.tap('SanitizeRuntimePlugin', (compilation) => {
//           compilation.hooks.processAssets.tap(
//             {
//               name: 'SanitizeRuntimePlugin',
//               stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE
//             },
//             (assets) => {
//               for (const assetName of Object.keys(assets)) {
//                 if (assetName.endsWith('.js')) {
//                   let source = assets[assetName].source().toString();

//                   // ✅ 1. Remove "new Function('return this')()" (Webpack runtime global eval)
//                   source = source.replace(/new Function\(["']return this["']\)\(\)/g, 'self');

//                   // ✅ 2. Remove "http://localhost" hardcoded dev base URLs
//                   source = source.replace(/http:\/\/localhost(:\d+)?/g, '');

//                   // ✅ 3. Remove bare "localhost" (in case it appears standalone)
//                   source = source.replace(/["']localhost["']/g, '""');

//                   // ✅ Re-inject patched bundle
//                   compilation.updateAsset(assetName, new webpack.sources.RawSource(source));
//                 }
//               }
//             }
//           );
//         });
//       }
//     },
//     new webpack.DefinePlugin({
//       'process.env': JSON.stringify(process.env)
//       // 'process.env.API_BASE': JSON.stringify(
//       //   process.env.API_BASE?.replace('localhost', 'https://ruutchat.vercel.app')
//       // )
//     })
//   ]
// };

import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import dotenv from 'dotenv';
import TerserPlugin from 'terser-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

dotenv.config();

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Use your production domain for assets
const PUBLIC_URL = process.env.PUBLIC_URL || 'https://ruutchat.vercel.app/';

export default {
  entry: './src/index.jsx',

  output: {
    filename: 'bundle.js',
    path: path.resolve(dirname, 'dist'),
    publicPath: PUBLIC_URL, // ✅ Assets load from your deployed domain
    clean: true,
    globalObject: 'self', // ✅ Prevent Webpack runtime evals
    environment: {
      arrowFunction: false,
      const: true,
      dynamicImport: false
    }
  },

  target: ['web', 'es2020'],
  devtool: false,

  resolve: {
    extensions: ['.jsx', '.js', '.json'],
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom')
    },
    fullySpecified: false,
    symlinks: true,
    mainFields: ['browser', 'module', 'main']
  },

  module: {
    rules: [
      // ✅ Include @mui and @emotion so they are properly transpiled
      {
        test: /\.(js|jsx|mjs)$/,
        include: [
          path.resolve('./src'),
          path.resolve('./node_modules/@mui'),
          path.resolve('./node_modules/@emotion')
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { targets: 'defaults' }], '@babel/preset-react'],
            plugins: [
              ['@emotion', { sourceMap: false, autoLabel: 'never', labelFormat: '[local]' }]
            ]
          }
        }
      },

      // ✅ CSS and SCSS
      {
        test: /\.s?css$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },

      // ✅ Image and static assets handling
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][ext]'
        }
      }
    ]
  },

  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [filename]
    }
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          compress: { drop_console: true, passes: 2 },
          format: { comments: false },
          safari10: true
        }
      })
    ]
  },

  devServer: {
    static: {
      directory: path.join(dirname, 'public'),
      watch: true
    },
    compress: true,
    port: 1337,
    hot: true,
    open: true,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      'Surrogate-Control': 'no-store'
    }
  },

  plugins: [
    // ✅ Inject HTML
    new HtmlWebpackPlugin({
      template: path.resolve(dirname, 'public/index.html')
    }),

    // ✅ Copy all static assets to /dist for deployment
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(dirname, 'public'),
          to: path.resolve(dirname, 'dist'),
          noErrorOnMissing: true,
          globOptions: { ignore: ['**/index.html'] }
        }
      ]
    }),

    // ✅ Strip unsafe evals and localhost references from runtime
    {
      apply(compiler) {
        compiler.hooks.compilation.tap('SanitizeRuntimePlugin', (compilation) => {
          compilation.hooks.processAssets.tap(
            {
              name: 'SanitizeRuntimePlugin',
              stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE
            },
            (assets) => {
              for (const assetName of Object.keys(assets)) {
                if (assetName.endsWith('.js')) {
                  let source = assets[assetName].source().toString();

                  // 1️⃣ Remove Webpack’s runtime global evals
                  source = source.replace(/new Function\(["']return this["']\)\(\)/g, 'self');

                  // 2️⃣ Strip localhost strings
                  source = source.replace(/http:\/\/localhost(:\d+)?/g, '');
                  source = source.replace(/["']localhost["']/g, '""');

                  // 3️⃣ Replace stray “localhost” in URLs
                  source = source.replace(/localhost/g, 'ruutchat.vercel.app');

                  compilation.updateAsset(assetName, new webpack.sources.RawSource(source));
                }
              }
            }
          );
        });
      }
    },

    // ✅ Define environment variables
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
      'process.env.PUBLIC_URL': JSON.stringify(PUBLIC_URL)
    })
  ]
};
