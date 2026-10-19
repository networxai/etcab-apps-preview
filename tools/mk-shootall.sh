#!/bin/sh
D=$(dirname "$0"); sed "s#__FILES__#$1#" "$D/shootall.tpl.js" > "$D/shootall.js"
