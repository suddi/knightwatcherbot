'use strict';

const _ = require('lodash');
const ApiBuilder = require('claudia-api-builder');

const Controller = require('./controller');

function bootstrap() {
    const app = new ApiBuilder();
    const config = {
        apiKeyRequired: true
    };

    app.get('/', Controller.whoami.bind(app));

    app.post('/command', Controller.processCommand.bind(app), config);

    app.post('/message', Controller.sendMessage.bind(app), config);

    return app;
}

module.exports = bootstrap();
