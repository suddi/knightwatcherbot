'use strict';

/* eslint no-console: off */

/*
 * To execute:
 *      - npm install -g ngrok
 *      - ngrok http 3000
 *      - start up the server with node scripts/test_webhook.js
 *      - make a request to fire the webhook
 */
const express = require('express');
const bodyParser = require('body-parser');

function bootstrap() {
    const app = express();
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    app.all('/', function (req, res) {
        console.log('---------------- incoming request ---------------------------');
        console.log(req.method);
        console.log(JSON.stringify(req.body, null, 4));
        console.log('-------------------------------------------------------------');
        return res.status(200).json({});
    });

    const port = 3000;
    app.listen(port);
    console.log('webhook listening at ' + port);
}

if (!module.parent) {
    bootstrap();
}
