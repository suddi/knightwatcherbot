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

    app.post('/v1/hooks/telegram', Controller.processTelegram.bind(app));

    app.post('/v1/hooks/circle', Controller.processCircle.bind(app));

    app.post('/v1/message', Controller.sendMessage.bind(app));

    return app;
}

module.exports = bootstrap();
