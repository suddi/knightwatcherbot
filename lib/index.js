'use strict';

const _ = require('lodash');
const ApiBuilder = require('claudia-api-builder');

const Controller = require('./controller');

function bootstrap() {
    const app = new ApiBuilder();

    app.get('/', Controller.whoami.bind(app));

    app.post('/command', Controller.processCommand.bind(app));

    app.post('/message', Controller.sendMessage.bind(app));

    return app;
}

module.exports = bootstrap();
