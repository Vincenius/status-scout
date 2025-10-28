FROM mcr.microsoft.com/playwright:v1.55.0-jammy

WORKDIR /app

# Install system dependencies needed to fetch and build Go tools
RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates curl git build-essential openssh-client \
	&& rm -rf /var/lib/apt/lists/*

# Install Go (required version >= 1.24 for subfinder); adjust GOLANG_VERSION if needed
ENV GOLANG_VERSION=1.24.5
RUN curl -fsSL "https://go.dev/dl/go${GOLANG_VERSION}.linux-amd64.tar.gz" -o /tmp/go.tar.gz \
	&& tar -C /usr/local -xzf /tmp/go.tar.gz \
	&& rm /tmp/go.tar.gz

# Ensure go binary and installed go/bin are on PATH and set GOPATH
ENV PATH="/usr/local/go/bin:/root/go/bin:${PATH}"
ENV GOPATH=/root/go

# Install subfinder and subzy into GOPATH/bin
RUN /usr/local/go/bin/go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest \
	&& /usr/local/go/bin/go install -v github.com/PentestPad/subzy@latest

# Copy monorepo root package.json and yarn.lock so workspaces are available
COPY package.json yarn.lock ./

# Copy packages into image
COPY packages/ ./packages/
COPY packages/worker/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

# Use yarn from root to install workspace deps so @statusscout/shared resolves locally
RUN corepack enable && yarn config set nodeLinker node-modules && yarn install --frozen-lockfile --production=false

WORKDIR /app/packages/worker

# Run your script
ENTRYPOINT ["/app/docker-entrypoint.sh"]
