'use strict';

const ApiBuilder = require('claudia-api-builder');

const Controller = require('./controller');

function bootstrap() {
    const app = new ApiBuilder();

    app.get('/', Controller.whoami.bind(app));

    app.get('/favicon.ico', Controller.getFavicon.bind(app), {
        success: {
            contentType: 'image/png',
            contentHandling: 'CONVERT_TO_BINARY'
        }
    });

    app.post('/v1/hooks/circleci', Controller.processCircleCI.bind(app));

    app.post('/v1/hooks/telegram', Controller.processTelegram.bind(app));

    app.post('/v1/messages', Controller.sendMessage.bind(app));

    return app;
}

module.exports = bootstrap();
