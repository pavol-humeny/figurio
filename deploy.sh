#!/usr/bin/env sh

# Stop on errors
set -e

# CONFIGURATION
CUSTOM_MESSAGE=""           # Custom commit message (optional)

# BUILD
npm run build

# Move to the build output directory
cd dist

# Initialize a new git repo
git init
git add -A

# Get version and extract major number
VERSION=$(node -p "require('../package.json').version")
MAJOR_VERSION=$(echo "$VERSION" | cut -d. -f1)

# Get parent repo data
BRANCH=$(git -C .. rev-parse --abbrev-ref HEAD)
HASH=$(git -C .. log -1 --format=%h)
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Compose commit message
COMMIT_MSG="Deploy release v$VERSION from $BRANCH ($HASH) at $DATE"

[ -n "$CUSTOM_MESSAGE" ] && COMMIT_MSG="$COMMIT_MSG — $CUSTOM_MESSAGE"

# Commit without pushing
git commit -m "$COMMIT_MSG"

# Reminder to user
echo "Build committed locally for gh-pages-$MAJOR_VERSION"

# Go back
cd -
