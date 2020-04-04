# knightwatcherbot

[![CircleCI](https://circleci.com/gh/suddi/knightwatcherbot.svg?style=svg)](https://circleci.com/gh/suddi/knightwatcherbot)
[![codecov](https://codecov.io/gh/suddi/knightwatcherbot/branch/master/graph/badge.svg)](https://codecov.io/gh/suddi/knightwatcherbot)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/462b2e476c1641b0ac4ade17a6064a8d)](https://www.codacy.com/app/Suddi/knightwatcherbot)
[![David](https://img.shields.io/david/suddi/knightwatcherbot.svg)](https://david-dm.org/suddi/knightwatcherbot)
[![David](https://img.shields.io/david/dev/suddi/knightwatcherbot.svg)](https://david-dm.org/suddi/knightwatcherbot?type=dev)
[![StackShare](https://img.shields.io/badge/tech-stack-0690fa.svg?style=flat)](https://stackshare.io/suddi/knightwatcherbot)
[![license](https://img.shields.io/github/license/suddi/knightwatcherbot.svg)](https://github.com/suddi/knightwatcherbot/blob/master/LICENSE)

[![codecov](https://codecov.io/gh/suddi/knightwatcherbot/branch/master/graphs/commits.svg)](https://codecov.io/gh/suddi/knightwatcherbot)

AWS Lambda function to get alerts via telegram for system alerts

## Installation

````
npm install
````

## Usage

To run the API locally:

````
npm start
````

To create the deployment with `claudia`:

````
claudia create --name <NAME> --region <AWS_REGION> --api-module lib
````

This will generate a config file named `claudia.json`

To deploy the same function afterwards to AWS Lambda:

````
claudia update
````

**NOTE:** `claudia` is a `devDependency` within this package, you will need to reference it within `node_modules` if it is not globally installed
