#!/bin/bash
cd "$(dirname "$0")"
git commit -a -m "update"
git push
git pull
forever restart bot.js
