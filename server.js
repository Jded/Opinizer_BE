'use strict';

const MAINPASS = '4H6]w<#qB"PkF;M;4:4D:#7>Z%s,^3sn';
const Hapi = require('hapi');
const CookieAuth = require('hapi-auth-cookie');
// Create a server with a host and port
const config = {'connections':{
    'routes':{
        cors: {
            origin: ['*'],
            credentials: true
        }
    }
}}
const server = new Hapi.Server();

server.connection({
    host: 'local.com',
    port: 8000
});

const plugin = {
    register: require('hapi-node-postgres'),
    options: {
        connectionString: 'postgres://op_write:op_write@localhost:5432/postgres',
        native: false
    }
};

server.register(plugin, (err) => {
    if (err) {
        console.error('Failed loading "hapi-node-postgres" plugin');
    }
});

server.register(CookieAuth, function (err) {
    const cache = server.cache({ segment: 'sessions', expiresIn: 3 * 24 * 60 * 60 * 1000 });
    server.app.cache = cache;
    const options = {
        ttl: 1000 * 60 * 60 * 24 * 3,
        keepAlive:true,
        password: MAINPASS,
        isSecure: false,
        isHttpOnly: false,
        validateFunc: function (request, session, callback) {
            cache.get(session.sid, (err, cached) => {
                if (err) {
                    return callback(err, false);
                }
                if (!cached) {
                    return callback(null, false);
                }
                return callback(null, true, cached.account);
            });
        }
    }
    server.auth.strategy('session', 'cookie', true, options);
    let routes = [].concat(
        require('./routes/session/session.routes.js'),
        require('./routes/user/user.routes.js'),
        require('./routes/item-template/item-template.routes.js')
    )
    // Add the route
    server.route(routes);

    // Start the server
    server.start((err) => {

        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });

});




