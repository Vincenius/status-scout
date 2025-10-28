#!/bin/bash
set -e

if [ -f "/app/.env" ]; then
  export $(grep -v '^#' /app/.env | xargs)
fi

# for running multiple workers that connect to redis and mongodb on the main host via SSH tunnels
if [ -n "$SSH_TUNNEL_HOST" ]; then
  echo "Starting SSH tunnels to $SSH_TUNNEL_HOST..."

  # ensure ssh client and .ssh exist (image must include openssh-client)
  mkdir -p /root/.ssh
  chmod 700 /root/.ssh

  # add host key to known_hosts (preferred to disabling host key checking)
  if ! ssh-keygen -F "$SSH_TUNNEL_HOST" >/dev/null 2>&1; then
    echo "Adding $SSH_TUNNEL_HOST to /root/.ssh/known_hosts"
    ssh-keyscan -H "$SSH_TUNNEL_HOST" >> /root/.ssh/known_hosts 2>/dev/null || true
  fi

  # optional: load private key from env var (or mount ~/.ssh into container)
  SSH_OPTIONS="-o ConnectTimeout=10 -o ServerAliveInterval=60 -o ServerAliveCountMax=3"
  if [ -n "$SSH_PRIVATE_KEY" ]; then
    echo "Installing SSH private key from SSH_PRIVATE_KEY env"
    echo "$SSH_PRIVATE_KEY" > /root/.ssh/id_rsa
    chmod 600 /root/.ssh/id_rsa
    SSH_OPTIONS="$SSH_OPTIONS -i /root/.ssh/id_rsa"
  fi

  # open tunnels
  ssh $SSH_OPTIONS -N -L 6379:127.0.0.1:6379 root@"$SSH_TUNNEL_HOST" &
  ssh $SSH_OPTIONS -N -L 27017:127.0.0.1:27017 root@"$SSH_TUNNEL_HOST" &

  # Wait briefly to ensure tunnels are ready
  sleep 3
else
  echo "Skipping SSH tunnels (SSH_TUNNEL_HOST not set)"
fi

# Start the app
exec npm start