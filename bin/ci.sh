#!/bin/sh

function npmtest() {
    rm -rf node_modules
    npm cache clean
    nvm use $1
    npm install
    npm test
}

function run () {
    case "$CIRCLE_NODE_INDEX" in
        0)
            npmtest 6
            ;;
        1)
            npmtest 7
            ;;
        2)
            npmtest 8
            ;;
        3)
            npmtest 9
            ;;
        *)
            ;;
    esac
}

run
