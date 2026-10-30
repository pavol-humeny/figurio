#!/usr/bin/env sh

# Stop on errors
set -e

# HELP
usage() {
  cat <<EOF
Usage: sh deploy.sh [-h|--help]

Builds the application (npm run build) and commits the contents of dist/
into a fresh local git repository. Nothing is pushed.
Push the build afterwards with: sh deployPush.sh (npm run deploy:push)

Options:
  -h, --help    Show this help and exit
EOF
}

case "$1" in
  -h|--help) usage; exit 0 ;;
  "") ;;
  *) echo "Unknown option: $1" >&2; usage >&2; exit 1 ;;
esac

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
