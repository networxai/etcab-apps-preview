#!/bin/sh
# usage: mk.sh "rider-home rider-home?preorder=1" -> writes shoot.js for the Playwright MCP runner
D=$(dirname "$0"); sed "s#__WANT__#$1#" "$D/shoot.tpl.js" > "$D/shoot.js"
