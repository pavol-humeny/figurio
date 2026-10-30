#!/usr/bin/env sh

# Stop on errors
set -e

# HELP
usage() {
  cat <<EOF
Usage: sh deployPush.sh [-h|--help]

Force-pushes the build committed by deploy.sh (dist/, branch master)
to branch gh-pages-<MAJOR> of git@github.com:pavol-humeny/figurio.git,
where <MAJOR> is the major version from package.json.
Run sh deploy.sh (npm run deploy) first.

Options:
  -h, --help    Show this help and exit
EOF
}

case "$1" in
  -h|--help) usage; exit 0 ;;
  "") ;;
  *) echo "Unknown option: $1" >&2; usage >&2; exit 1 ;;
esac

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
