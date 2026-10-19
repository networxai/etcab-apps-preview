#!/bin/sh
# usage: mk-audit.sh "rider-home rider-book" -> writes auditall.js for the Playwright MCP runner
D=$(dirname "$0"); sed "s#__FILES__#$1#" "$D/auditall.tpl.js" > "$D/auditall.js"
