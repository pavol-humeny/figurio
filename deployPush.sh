#!/usr/bin/env sh

# Stop on errors
set -e

# Navigate to the build output directory
cd dist

# Push to GitHub Pages (assumes repo already initialized and committed)
git push -f git@github.com:pavol-humeny/BP_Image_editor.git master:gh-pages

# Return to previous directory
cd -

echo "Pushed to gh-pages."
