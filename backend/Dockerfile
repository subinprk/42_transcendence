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
	libz-dev \
	libsqlite3-dev \
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
COPY ./src ./src
COPY ./server.ts .
COPY ./package.json .
COPY ./server.ts .
COPY ./db ./db

RUN npm install

# =========== Expose the port ==============
EXPOSE 3000

# ========== Set SQLite DB file inside container =============
RUN npm install better-sqlite3

# ========== Start the server =============
CMD ["npm", "start"]