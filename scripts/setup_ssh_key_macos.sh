#!/usr/bin/env bash
set -euo pipefail

# Helper: generate ed25519 SSH key and add to macOS keychain
# Usage: ./scripts/setup_ssh_key_macos.sh "you@example.com"

EMAIL=${1:-"you@example.com"}
KEY_PATH="$HOME/.ssh/id_ed25519_korfbal"

mkdir -p "$HOME/.ssh"
if [ -f "$KEY_PATH" ] || [ -f "${KEY_PATH}.pub" ]; then
  echo "Key already exists at $KEY_PATH (or .pub) — choose a different filename or remove existing key."
  exit 1
fi

echo "Generating ED25519 key for $EMAIL -> $KEY_PATH"
ssh-keygen -t ed25519 -C "$EMAIL" -f "$KEY_PATH" -N ""

eval "$(ssh-agent -s)"
# macOS-specific add to keychain; fall back to ssh-add if option unsupported
if ssh-add --apple-use-keychain "$KEY_PATH" 2>/dev/null; then
  echo "Added key to ssh-agent and macOS keychain"
else
  ssh-add "$KEY_PATH"
  echo "Added key to ssh-agent"
fi

echo "Public key copied to clipboard. Paste it into GitHub > Settings > SSH and GPG keys"
pbcopy < "${KEY_PATH}.pub"

echo "Public key path: ${KEY_PATH}.pub"
ssh-keygen -lf "${KEY_PATH}.pub"

echo "Done. After adding the key to GitHub, verify with: ssh -T git@github.com"
