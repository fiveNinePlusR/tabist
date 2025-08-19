#! /usr/bin/env sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$DIR"

if [[ $DIR ]]
then
    rm -f ./**/.DS_Store
    webpack
    web-ext --source-dir "./tabist" --artifacts-dir "./web-ext-artifacts" build
fi

