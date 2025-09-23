#!/usr/bin/env sh

# Stop on errors
set -e

# Navigate to the build output directory
cd dist

# Get version and extract major number
VERSION=$(node -p "require('../package.json').version")
MAJOR_VERSION=$(echo "$VERSION" | cut -d. -f1)

# Push to branch gh-pages-X
git push -f git@github.com:pavol-humeny/figurio.git master:gh-pages-"$MAJOR_VERSION"

# Return to previous directory
cd -

echo "Pushed to gh-pages-$MAJOR_VERSION."
