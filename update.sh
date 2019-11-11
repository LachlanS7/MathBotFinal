#!/bin/bash
cd "$(dirname "$0")"
git pull
forever restart bot.js
