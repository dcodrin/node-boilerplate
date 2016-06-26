const path = require('path'),
    fs = require('fs'),
    webpack =require('webpack');

//Configure webpack to NOT include node packages in the bundle
const nodeModules = fs.readdirSync('./node_modules').filter(d => d !== '.bin');
function ignoreNodeModules(context, request, callback){
    //Ignore imports starting with a '.'
    if(request[0] === '.'){
        return callback();
    }
    //Save the module name
    const module = request.split('/')[0];
    //Import node module with commonjs
    if(nodeModules.indexOf(module) !== -1){
        //NOTICE SPACE AFTER commonjs
        return callback(null, 'commonjs ' + request);
    }
    return callback();
}


function createConfig(isDebug) {
    const plugins = [];
    if(!isDebug){
        plugins.push(new webpack.optimize.UglifyJsPlugin({compressor: {warnings: false}}));
    }
    // -----------------------
    // WEBPACK CONFIG
    return {
        target: 'node',
        devtool: 'source-map',
        entry: './src/server/server.js',
        output: {
            path: path.join(__dirname, 'build'),
            filename: 'server.js'
        },
        resolve: {
            alis: {
                shared: path.join(__dirname, 'src', 'shared')
            }
        },
        module: {
            loaders: [
                {
                    test: /\.js$/, loader: 'babel', exclude: /node_modules/, query: {
                    presets: ['es2015']
                }
                },
                {test: /\.js$/, loader: 'eslint-loader', exclude: /node_modules/}
            ]
        },
        externals: [ignoreNodeModules],
        plugins: plugins
    };
    // -----------------------
}

module.exports = createConfig(true);
module.exports.create = createConfig;