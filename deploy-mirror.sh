#!/usr/bin/env bash
set -e

git push origin main
rsync -avz --delete \
  --exclude=.git \
  --exclude=.DS_Store \
  ./ \
  willi@teclast.local:/var/www/html/arcadia-github/