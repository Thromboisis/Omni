#!/bin/sh
# OmniLaunch Git pre-push hook: Verifies TypeScript compilation before pushing
echo "OmniLaunch: Running pre-push checks..."
npm run lint
if [ $? -ne 0 ]; then
    echo "TypeScript check failed! Push aborted."
    exit 1
fi
echo "Pre-push check passed. Code compiles cleanly."
exit 0
