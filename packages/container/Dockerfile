FROM quay.io/centos/centos:stream9 as BASE
ARG UID=1000
ARG GID=1000
ARG GOSU_VERSION=1.17
ARG NODE_VERSION=20.12.0
ENV PYTHONUNBUFFERED=1
ENV NODE_ENV=production

# https://github.com/nodejs/docker-node/blob/main/18/alpine3.16/Dockerfile
RUN set -eux; \
  export GNUPGHOME="$(mktemp -d)"; \
  export ARCH="$(uname -m)"; \
  case "$ARCH" in \
    x86_64) ARCH="amd64";; \
    aarch64) ARCH="arm64";; \
    *) echo "unsupported architecture"; exit 1 ;; \
  esac; \
  dnf clean all; \
  dnf update -y; \
  dnf install -y --allowerasing ca-certificates curl gnupg dirmngr xz libatomic python3 python3-pip; \
  curl -fsSL --compressed -o /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$ARCH"; \
  curl -fsSL --compressed -o /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$ARCH.asc"; \
  gpg --batch --keyserver hkps://keys.openpgp.org --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4; \
  gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu; \
  chmod +x /usr/local/bin/gosu; \
  gosu nobody true; \
  export ARCH="$(uname -m)"; \
  case "$ARCH" in \
    x86_64) ARCH="x64";; \
    aarch64) ARCH="arm64";; \
    *) echo "unsupported architecture"; exit 1 ;; \
  esac; \
  for key in \
    4ED778F539E3634C779C87C6D7062848A1AB005C \
    141F07595B7B3FFE74309A937405533BE57C7D57 \
    74F12602B6F1C4E913FAA37AD3A89613643B6201 \
    DD792F5973C6DE52C432CBDAC77ABFA00DDBF2B7 \
    61FC681DFB92A079F1685E77973F295594EC4689 \
    8FCCA13FEF1D0C2E91008E09770F7A9A5AE15600 \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
    890C08DB8579162FEE0DF9DB8BEAB4DFCF555EF4 \
    C82FA3AE1CBEDC6BE46B9360C43CEC45C17AB93C \
    108F52B48DB57BB0CC439B2997B01419BD92F80A \
    A363A499291CBBC940DD62E41F10027AF002F8B0 \
  ; do \
    gpg --batch --keyserver hkps://keys.openpgp.org --recv-keys "$key" || \
    gpg --batch --keyserver keyserver.ubuntu.com --recv-keys "$key"; \
  done; \
  curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-$ARCH.tar.xz"; \
  curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc"; \
  gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc; \
  grep " node-v$NODE_VERSION-linux-$ARCH.tar.xz\$" SHASUMS256.txt | sha256sum -c -; \
  tar -xJf "node-v$NODE_VERSION-linux-$ARCH.tar.xz" -C /usr/local --strip-components=1 --no-same-owner; \
  ln -s /usr/local/bin/node /usr/local/bin/nodejs; \
  gpgconf --kill all; \
  rm -rf "$GNUPGHOME" /usr/local/bin/gosu.asc "node-v$NODE_VERSION-linux-$ARCH.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt; \
  groupadd --gid=$GID node; \
  useradd --shell=/bin/sh --uid=$UID -g node node; \
  mkdir -p /opt/app; \
  chmod 770 /opt/app; \
  chown $UID:$GID /opt/app; \
  npm install -g npm; \
  gosu --version; \
  node --version; \
  npm --version

RUN set -eux \
  && dnf install -y --nodocs dnf-plugins-core \
  && dnf config-manager -y --add-repo https://releases.escapace.com/stable/linux/centos/escapace.repo \
  && dnf upgrade -y --nodocs \
  && dnf install --nodocs --assumeyes gcc gcc-c++ freetype-devel glib2-devel cairo-devel python3-devel

FROM base AS app

ARG PNPM_VERSION=8.15.5
RUN npm install -g pnpm@${PNPM_VERSION}

COPY --chown=node:node package/packages/container/requirements.txt /opt/app/packages/container/requirements.txt

RUN pip3 install --no-cache --upgrade pip setuptools \
  && pip3 install -r /opt/app/packages/container/requirements.txt

RUN dnf --assumeyes remove gcc gcc-c++ freetype-devel glib2-devel cairo-devel python3-devel \
  && dnf --assumeyes autoremove \
  && dnf --assumeyes clean all \
  && rm -f /etc/yum.repos.d/escapace.repo \
  && rm -rf /var/cache/yum/ /var/cache/dnf/ /tmp/*

COPY --chown=node:node package /opt/app

WORKDIR /opt/app

RUN --mount=type=cache,id=pnpm,target=/home/node/.local/share/pnpm pnpm install --prod --frozen-lockfile
RUN rm -f /opt/app/packages/container/requirements.txt \
  /opt/app/Dockerfile \
  /opt/app/pnpm-lock.yaml

# TODO: use uid:gid
WORKDIR /wd
ENTRYPOINT ["/usr/local/bin/gosu", "node:node", "node", "--enable-source-maps", "--no-warnings", "--experimental-vm-modules", "/opt/app/packages/container/lib/esm/cli.mjs"]
CMD []
