//Generate source maps
//|-----------------------------------|
import "source-map-support/register";
//|-----------------------------------|

const isDevelopment = process.env.NODE_ENV !== 'production';

import express from 'express';
import http from 'http';
import socketIo from 'socket.io';
import chalk from 'chalk';

//|-----------------------------------|
//Setup

const app = express();
const server = new http.Server(app);
const io = socketIo(server);


//|-----------------------------------|
//Client Webpack
//This will intercept requests to the bundles and compile them on the fly
//It simulates how the webpack devserver works
if(process.env.USE_WEBPACK === 'true'){
    const webpackMiddleware = require('webpack-dev-middleware'),
        webpackHotMiddleware = require('webpack-hot-middleware'),
        webpack = require('webpack'),
        clientConfig = require('../../webpack.client');

    const compiler = webpack(clientConfig);
    app.use(webpackMiddleware(compiler, {
        publicPath: '/build/',
        stats: {
            colors: true,
            chunks: false,
            assets: false,
            timings: false,
            modules: false,
            hash: false,
            version: false
        }
    }));

    app.use(webpackHotMiddleware(compiler));

    console.log(chalk.white.bgRed('Using WebPack Dev Middleware! THIS IS FOR DEV ONLY!'));
}

//|-----------------------------------|
//Configure Express

app.set('view engine', 'jade');
app.use(express.static('public'));

const useExternalStyles = !isDevelopment;

app.get('/', (req, res) => {
    res.render('index', {
        useExternalStyles
    });
});

//|-----------------------------------|
//Modules

//|-----------------------------------|
//Socket

io.on('connection', socket => {
    console.log(`Connection from ${socket.request.connection.remoteAddress}`);
});

//|-----------------------------------|
//Startup

const PORT = process.env.PORT || 3000;
function startServer() {
    server.listen(PORT, () => {
        console.log(`Server started on port ${PORT}.`);
    });
}

startServer();