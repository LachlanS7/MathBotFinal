#!/bin/bash
cd "$(dirname "$0")"
git commit -a -m "update"
git pull
git push
forever restart bot.js
