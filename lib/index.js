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

    app.post('/v1/{botName}/hooks/{hookType}', Controller.processHook.bind(app));

    app.post('/v1/{botName}/messages', Controller.sendMessage.bind(app));

    return app;
}

module.exports = bootstrap();
