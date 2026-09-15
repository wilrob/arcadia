#!/usr/bin/env bash
set -e

git push origin master
rsync -avz --delete \
  --exclude=.git \
  --exclude=.DS_Store \
  ./ \
  willi@teclast.local:/var/www/html/arcadia-github/