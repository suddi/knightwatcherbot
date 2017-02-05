'use strict';

function getEnv() {
    return {
        TABLENAME: process.env.TABLENAME || '',
        TELEGRAM_API_KEY: process.env.TELEGRAM_API_KEY || '',
        DEFAULT_NOTIFIER: parseInt(process.env.DEFAULT_NOTIFIER, 10) || 0
    };
}

module.exports = {
    getEnv: getEnv
};
