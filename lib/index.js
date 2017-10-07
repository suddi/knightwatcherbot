'use strict';

const ApiBuilder = require('claudia-api-builder');

const Controller = require('./controller');

function bootstrap() {
    const app = new ApiBuilder();

    app.get('/', Controller.whoami.bind(app));

    app.post('/hooks/telegram', Controller.processTelegram.bind(app));

    app.post('/hooks/circle', Controller.processCircle.bind(app));

    app.post('/message', Controller.sendMessage.bind(app));

    app.get('/favicon.ico', Controller.getFavicon.bind(app), {
        success: {
            contentType: 'image/png',
            contentHandling: 'CONVERT_TO_BINARY'}
        }
    );

    return app;
}

module.exports = bootstrap();
