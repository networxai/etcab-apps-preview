#!/bin/sh
# usage: tools/mk.sh "dispatch rides" "[[1440,900],[1366,768]]"  -> writes tools/shoot.js for the Playwright MCP runner
D=$(dirname "$0"); sed "s#__WANT__#$1#; s#__SIZES__#${2:-[[1440,900]]}#" "$D/shoot.tpl.js" > "$D/shoot.js"
