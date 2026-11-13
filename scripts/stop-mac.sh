#!/usr/bin/env bash
# Stops the running Prelegal container (it is removed on stop).
set -euo pipefail

docker stop prelegal >/dev/null
echo "Prelegal stopped"
