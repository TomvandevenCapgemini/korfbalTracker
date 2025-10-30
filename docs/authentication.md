# Authentication and Git setup

This document contains detailed instructions for authenticating with GitHub and configuring your local repository.

## HTTPS with Personal Access Token (PAT)

Recommended for most users and CI workflows.

1. Generate a PAT on GitHub:
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Create a new token with `repo` (full) and `workflow` scopes as needed
   - Copy the token immediately (you will not be able to view it again)

2. Use HTTPS clone and authenticate:

```bash
git clone https://github.com/TomvandevenCapgemini/korfbalTracker.git
# when pushing, use your GitHub username and the PAT as password
```

3. Cache the token on macOS (recommended):

```bash
git config --global credential.helper osxkeychain
# the next push/pull will prompt and the helper will store the credential in your keychain
```

## SSH key-based authentication (optional)

If you prefer key-based auth, follow these steps (macOS):

1. Generate an ed25519 key (if you don't have one already):

```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
```

2. Start the ssh-agent and add your key to the macOS keychain:

```bash
# start agent (if not already running)
eval "$(ssh-agent -s)"
# add the key to the agent and macOS keychain
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

3. Copy your public key and add it to GitHub:

```bash
pbcopy < ~/.ssh/id_ed25519.pub
# then open GitHub > Settings > SSH and GPG keys > New SSH key and paste
```

4. Change remote to SSH (if needed):

```bash
git remote set-url origin git@github.com:TomvandevenCapgemini/korfbalTracker.git
```

## CI considerations

- CI runners (GitHub Actions) typically use HTTPS/git tokens or a preconfigured SSH deploy key. The repository's workflows already run `npm ci` and use standard package installation. If you require pushing from CI, create and securely store a PAT or configure a deploy key in the repository.

- For local CI runs, prefer HTTPS with the osxkeychain helper or SSH with an agent loaded.

## Troubleshooting

- Permission denied (publickey): copy your public key and ensure it's added to the correct GitHub account (the account must have access to the repo).
- 403 when pushing over HTTPS: ensure your PAT has the `repo` scope and you're using the correct account.

If something still fails, open an issue in this repo with the exact error message and I will help debug further.
