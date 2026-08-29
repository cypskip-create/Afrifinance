# Multi-stage build, same pattern as backend/Dockerfile: compile in a full
# node image, run the compiled output in a slim one.
#
# NOTE: from Phase 4 onward (Playwright browser worker) this Dockerfile
# will need Chromium system dependencies (`npx playwright install-deps`)
# and a heavier base image. Left as a TODO here — deliberately not added
# before there's actual browser-automation code to run, per the phased
# build order.
FROM node:20-slim AS build
WORKDIR /app
# poppler-utils provides pdftotext (native PDF text extraction) AND
# pdftoppm (PDF-to-image rasterization for the OCR fallback, Phase 5).
# Same package, both tools.
RUN apt-get update && apt-get install -y --no-install-recommends poppler-utils && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends poppler-utils && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist

EXPOSE 4100
CMD ["node", "dist/index.js"]