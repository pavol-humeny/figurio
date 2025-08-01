#!/usr/bin/env sh

# Stop on errors
set -e

# Build
npm run build

# Navigate to the build output directory
cd dist

# Initialize a new git repository
git init
git add -A
git commit -m 'New Deployment'

# Push to the gh-pages branch of the repository
git push -f git@github.com:pavol-humeny/BP_Image_editor.git master:gh-pages

# Return to the previous directory
cd -