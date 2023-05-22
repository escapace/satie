FROM node:18-alpine

ARG PNPM_VERSION=8.4.0
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache \
  libxslt-dev libxml2-dev py3-brotli \
  zopfli gcc libc-dev python3-dev python3 shadow sudo g++ \
  && ln -sf python3 /usr/bin/python \
  && python3 -m ensurepip \
  && pip3 install --no-cache --upgrade pip setuptools
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt && rm -f requirements.txt \
  && mkdir -p /web-fonts/src/font /web-fonts/lib/cli

ENV UID=1000
ENV GID=1000
ENV UMASK=0022

COPY packages/container/lib/esm /web-fonts/lib/esm
COPY packages/container/src/font/font-loader.ts /web-fonts/src/font
COPY packages/container/src/font/font-strip.py /web-fonts/src/font

COPY packages/container/package.json /web-fonts
COPY packages/container/scripts/docker-entrypoint.sh /usr/local/bin/
COPY packages/web-fonts /web-fonts/node_modules/@escapace/web-fonts

WORKDIR /web-fonts

RUN npm install -g pnpm@${PNPM_VERSION} \
  && find /web-fonts -type d -exec chmod 755 {} \+ \
  && find /web-fonts -type f -exec chmod 644 {} \+ \
  && pnpm install --ignore-scripts --shamefully-hoist --no-frozen-lockfile --prod \
  && deluser --remove-home node \
  && (delgroup node || true)

ENTRYPOINT ["docker-entrypoint.sh"]
CMD []
