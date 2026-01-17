# Quran REST API

[![license](https://img.shields.io/github/license/emptydeen/api.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen.svg)](https://nodejs.org/)
[![Fastify](https://img.shields.io/badge/fastify-v5.x-blue.svg)](https://www.fastify.io/)

Fast REST API for Quranic data - Arabic text, French translations, tafsir, pronunciations, and audio recitations.

Uses data from **[emptydeen/data](https://github.com/emptydeen/data)**.

## Table of Contents

- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Data Setup](#data-setup)
- [Data Sources](#data-sources)
- [Contributing](#contributing)

## Quick Start

```bash
# Clone and install
git clone https://github.com/emptydeen/api.git
cd api
npm install

# Setup data (see Data Setup section below)

# Start server
node server.js
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /surahs` | Get all surahs list |
| `GET /surah/:surah` | Get complete surah data |
| `GET /surah/:surah/:aya` | Get specific aya |
| `GET /surah/:surah/:aya/audio` | Stream aya audio (MP3) |

**Example:**
```bash
curl http://localhost:3000/surah/1/1
```

## Data Setup

This API requires data from **[emptydeen/data](https://github.com/emptydeen/data)**.

```bash
# 1. Clone data repository
git clone https://github.com/emptydeen/data.git
cd data

# 2. Extract database
unzip data/quran.sqlite.zip -d data/

# 3. Install and generate
npm install
node server.js

# 4. Copy output to API project
cp -r output/ /path/to/api/data/
```

Your project structure:
```
api/
├── server.js
├── package.json
└── data/
    ├── surahs.json
    └── audios/
        ├── 1/
        └── ...
```

## Data Sources

Processed by **[emptydeen/data](https://github.com/emptydeen/data)**:

- **Translations & Quran**: [tanzil.net/trans](https://tanzil.net/trans/)
- **Tafsir**: [quranenc.com](https://quranenc.com/fr/)
- **Pronunciations**: [transliteration.org](http://transliteration.org/)

## Contributing

Feel free to [open an issue](https://github.com/emptydeen/api/issues/new) or submit a pull request.