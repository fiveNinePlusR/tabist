#! /usr/bin/env sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$DIR"

if [[ $DIR ]]
then
    rm -f ./**/.DS_Store
    webpack
    web-ext --api-key "$AMO_USER" --api-secret="$AMO_TOKEN" \
    --verbose \
    --channel "unlisted" \
    --source-dir "./tabist" \
    --artifacts-dir "./web-ext-artifacts" \
    --id "{ce07cd61-26f3-4c82-b1d7-95ca19e7442c}"\
    sign
fi

