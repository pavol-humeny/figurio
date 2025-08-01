#!/usr/bin/env sh

# Stop on errors
set -e

# Build the project
npm run build

# Move to the build output directory
cd dist

# Initialize a new git repo
git init
git add -A

# Get data from parent folder (project root)
VERSION=$(node -p "require('../package.json').version")
BRANCH=$(git -C .. rev-parse --abbrev-ref HEAD)
HASH=$(git -C .. log -1 --format=%h)
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Compose commit message
COMMIT_MSG="Deploy release v$VERSION from $BRANCH ($HASH) at $DATE"

# Commit and push
git commit -m "$COMMIT_MSG"
git push -f git@github.com:pavol-humeny/BP_Image_editor.git master:gh-pages

# Go back
cd -
