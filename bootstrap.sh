#!/usr/bin/env bash

apt-get update
apt-get install -y openvpn
sed -i -e 's/# it_IT.UTF-8 UTF-8/it_IT.UTF-8 UTF-8/' /etc/locale.gen
dpkg-reconfigure --frontend noninteractive locales

# Node.js installation
VERSION=v18.13.0
DISTRO=linux-x64
INSTALL_PATH=/usr/local/lib/nodejs
wget "https://nodejs.org/dist/$VERSION/node-$VERSION-linux-x64.tar.gz" --progress=dot:mega -O /tmp/node.tar.gz
mkdir -p "$INSTALL_PATH"
sudo tar -xzf /tmp/node.tar.gz -C "$INSTALL_PATH"
echo "export PATH=$INSTALL_PATH/node-$VERSION-$DISTRO/bin:$PATH" > /etc/profile.d/node.sh
