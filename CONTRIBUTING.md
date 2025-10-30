# Contributing

Thanks for wanting to contribute! This file explains how to clone the repository and authenticate with GitHub.

## Clone (HTTPS — recommended)

HTTPS is the recommended default for new contributors and CI workflows.

```bash
git clone https://github.com/TomvandevenCapgemini/korfbalTracker.git
```

If you need to push and prefer to use a Personal Access Token (PAT) for HTTPS, generate one on GitHub (Settings → Developer settings → Personal access tokens). Use the token as the password when Git prompts.

## Clone (SSH — optional)

If you prefer SSH (key-based auth), you can clone via SSH once you have an SSH key registered with GitHub:

```bash
# clone via SSH
git clone git@github.com:TomvandevenCapgemini/korfbalTracker.git
```

To switch an existing repo to SSH:

```bash
git remote set-url origin git@github.com:TomvandevenCapgemini/korfbalTracker.git
```

## Switching remote URLs

To set the remote back to HTTPS:

```bash
git remote set-url origin https://github.com/TomvandevenCapgemini/korfbalTracker.git
```

## Useful tips for macOS developers

- To add your SSH key to the macOS keychain and ssh-agent:

```bash
# generate a key if needed
ssh-keygen -t ed25519 -C "you@example.com"
# start agent and add key to keychain
eval "$(ssh-agent -s)"
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
# copy pubkey and add to GitHub
pbcopy < ~/.ssh/id_ed25519.pub
```

- For HTTPS + PAT flows: when prompted for credentials by Git over HTTPS, use your GitHub username and the PAT as the password. The macOS Keychain helper will cache it if configured.

## More details

See `docs/authentication.md` for an expanded guide with screenshots and CI tips.
