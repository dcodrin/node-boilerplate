const path = require('path'),
    webpack = require('webpack'),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

//Example of vendor modules
const vendorModules = ['jquery'];

//IMPORTANT when invoking webpack from the server
const dirname = path.resolve('./');


function createConfig(isDebug) {
    const plugins = [
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js')
    ];
    const cssLoader = {test: /\.css$/, loader: 'style!css'};
    const sassLoader = {test: /\.scss$/, loader: 'style!css!sass'};

    if(!isDebug){
        plugins.push(new webpack.optimize.UglifyJsPlugin({compressor: {warnings: false}}));
        //The [name].css is webpack templating
        //It tells webpack to create a file with the name of the file that it compiles
        plugins.push(new ExtractTextPlugin('[name].css'));

        cssLoader.loader = ExtractTextPlugin.extract('style', 'css');
        sassLoader.loader = ExtractTextPlugin.extract('style', 'css!sass');
    }

    //|--------------------------------------------------------|
    //DO NOT USE IN PRODUCTION
    //eval will create mini source maps
    const devtool = isDebug ? 'eval-source-map' : 'source-map';
    //|--------------------------------------------------------|

    const appEntry = ['./src/client/app.js'];

    // -----------------------
    // WEBPACK CONFIG
    return {
        devtool: devtool,
        entry: {
            app: appEntry,
            //All vendor modules will be placed in 'vendor.js'
            vendor: vendorModules
        },
        output: {
            path: path.join(dirname, 'public', 'build'),
            filename: '[name].js',
            //tell webpack where to expect files from when in browser
            publicPath: '/build/'
        },
        resolve: {
            alias: {
                shared: path.join(dirname, 'src', 'shared')
            }
        },
        module: {
            loaders: [
                {test: /\.js$/, loader: 'babel', exclude: /node_modules/},
                {test: /\.js$/, loader: 'eslint', exclude: /node_modules/},
                //The limit can inline images by encoding them into the bundle file
                //This saves on requests
                {test: /\.(png|jpg|jpeg|gif|woff|ttf|eot|svg|woff2)/, loader: 'url-loader?limit=512'},
                cssLoader,
                sassLoader
            ]
        },
        plugins: plugins
    };
    // -----------------------
}

module.exports = createConfig(true);
module.exports.create = createConfig;