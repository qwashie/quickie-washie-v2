# Quickie Washie

A Cross-Platform Mobile Application for an all-in-one booking and management for Car Services.

![demo](./demo.png)

## Prerequisites

1. [docker](https://www.docker.com)
2. [direnv](https://direnv.net/#getting-started)
3. [eas-cli](https://github.com/expo/eas-cli)

## Setup

1. Install Dependencies
```bash
yarn install
```

2. Setup `.env` files
```bash
cp apps/server/.env.example apps/server/.env
cp packages/db/.env.example packages/db/.env
```

3. Setup `.envrc` for mobile app
```bash
cp .envrc.example .envrc # replace contents with your ipv4 address 
direnv allow .
```

## Usage

1. Start postgres in docker & sync with prisma
```bash
docker compose up -d && \
yarn workspace @qw/db run prisma db push
```

2. Start server
```bash
yarn dev
```

3. Start mobile app
> Separated command so you can still interact with expo cli commands and scan QR
```bash
yarn workspace mobile start # then scan with Expo Go application
```

## Building

1. Server
```bash
yarn build
```

2. Mobile (android)
```bash
eas build --platform android --profile preview
```
