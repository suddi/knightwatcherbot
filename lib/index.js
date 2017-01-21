'use strict';

const ApiBuilder = require('claudia-api-builder');

const DB = require('./db');
const Interface = require('./interface');

function bootstrap() {
    const app = new ApiBuilder();

    app.get('/', function (req, res) {
        return Interface.respond(this, 200);
    }.bind(app));

    app.post('/init', function (req, res) {
        const item = {
            id: req.body.id,
            payload: req.body.payload
        };
        const params = {
            TableName: req.env.tableName,
            Item: item
        };
        return DB
            .putItem(params)
            .then(Interface.respond.bind(null, this, 200, item))
            .catch(Interface.respond.bind(null, this, 200));
    }.bind(app));

    return app;
}

module.exports = bootstrap();
