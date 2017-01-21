'use strict';

function getEnv() {
    return {
        TABLENAME: process.env.TABLENAME || '',
        TELEGRAM_API_KEY: process.env.TELEGRAM_API_KEY || ''
    };
}

module.exports = {
    getEnv: getEnv
};
