'use strict';

const ApiBuilder = require('claudia-api-builder');

const Controller = require('./controller');
const Logger = require('./logger');

function bootstrap() {
    const app = new ApiBuilder();

    app.get('/', Logger.accessLog(Controller.whoami.bind(app)));

    app.get('/favicon.ico', Logger.accessLog(Controller.getFavicon.bind(app)), {
        success: {
            contentType: 'image/png',
            contentHandling: 'CONVERT_TO_BINARY'
        }
    });

    // Legacy - Would need to update all .circleci/config.yml in order to update
    app.post('/hooks/circle', Logger.accessLog(Controller.processCircleCIHook.bind(app)));

    app.post('/v1/{botName}/hooks/{hookType}', Logger.accessLog(Controller.processHook.bind(app)));

    app.post('/v1/{botName}/messages', Logger.accessLog(Controller.sendMessage.bind(app)));

    return app;
}

module.exports = bootstrap();
