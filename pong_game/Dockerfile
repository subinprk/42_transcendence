#Server using Node.js and fastify framework

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
	curl \
	wget \
	gnupg \
	build-essential \
	ca-certificates \
	git \
	libssl-dev \
	pkg-config \
	libzlib-dev \
	zip \
	unzip \
	npm \
	&& rm -rf /var/lib/apt/lists/*

# ============Install Node.js ============
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
	&& apt-get update \
	&& apt-get install -y nodejs\
	&& rm -rf /var/lib/apt/lists/*

# ============ Install Fastify CLI ============
RUN npm install -g fastify-cli

# ============ Install PHP ===============
# RUN apt-get update && apt-get install -y \
# 	php\
# 	php-cli \
# 	php-mbstring \
# 	php-zip \
# 	php-curl \
# 	php-sqlite3 \
# 	&& rm -rf /var/lib/apt/lists/*

# ============ Set working directory in Docker Container ============
WORKDIR /app

# ============ Copy source code ============
COPY ./src .
