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
    # write key and ensure correct line endings and permissions
    printf '%s' "$SSH_PRIVATE_KEY" > /root/.ssh/id_rsa
    chmod 600 /root/.ssh/id_rsa
    # try to add key to ssh-agent if available
    if [ -n "$SSH_AUTH_SOCK" ] && [ -S "$SSH_AUTH_SOCK" ]; then
      echo "Adding key to ssh-agent via SSH_AUTH_SOCK=$SSH_AUTH_SOCK"
      SSH_AUTH_SOCK_PATH="$SSH_AUTH_SOCK"
      # attempt to start ssh-agent if ssh-add fails
      if ! ssh-add /root/.ssh/id_rsa >/dev/null 2>&1; then
        echo "ssh-add failed; proceeding without agent. Using -i for ssh." 
      fi
    fi
    SSH_OPTIONS="$SSH_OPTIONS -i /root/.ssh/id_rsa"
  fi

  # Diagnostic: show status of SSH_AUTH_SOCK and mounted socket path
  echo "SSH_AUTH_SOCK=${SSH_AUTH_SOCK:-<not set>}"
  if [ -n "$SSH_AUTH_SOCK" ]; then
    if [ -S "$SSH_AUTH_SOCK" ]; then
      echo "SSH_AUTH_SOCK points to a socket and exists: $SSH_AUTH_SOCK"
      ls -l "$SSH_AUTH_SOCK" || true
    else
      echo "SSH_AUTH_SOCK is set but not a socket or not accessible: $SSH_AUTH_SOCK"
      ls -l $(dirname "$SSH_AUTH_SOCK") || true
    fi
  else
    echo "No SSH_AUTH_SOCK provided to container; ensure you mount your agent socket or pass SSH_PRIVATE_KEY"
  fi

  # open tunnels (with per-connection retries)
  start_tunnel() {
    local local_port=$1
    local remote_port=$2
    local tries=0
    while [ $tries -lt 3 ]; do
      echo "Opening tunnel $local_port -> 127.0.0.1:$remote_port (attempt $((tries+1)))"
      ssh $SSH_OPTIONS -N -L ${local_port}:127.0.0.1:${remote_port} root@"$SSH_TUNNEL_HOST" &
      pid=$!
      sleep 2
      # check whether process is still running and not immediately failing
      if kill -0 $pid >/dev/null 2>&1; then
        echo "Tunnel for port ${local_port} started (pid=${pid})"
        return 0
      else
        echo "Tunnel attempt failed (pid=${pid}). Checking last ssh exit code..."
        wait $pid || true
        tries=$((tries+1))
        sleep 1
      fi
    done
    echo "Failed to establish tunnel ${local_port} after ${tries} attempts"
    return 1
  }

  start_tunnel 6379 6379 || true
  start_tunnel 27017 27017 || true

  # Wait briefly to ensure tunnels are ready
  sleep 3
else
  echo "Skipping SSH tunnels (SSH_TUNNEL_HOST not set)"
fi

# Start the app
exec npm start