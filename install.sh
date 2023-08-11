#!/bin/bash


# Install node.js & npm
cd ~
sudo curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh
sudo source ~/.bashrc
nvm install --lts # current: v18.17.1


clear

# Install node_modules
cd /luIP-marzban
npm i

clear

# Running project
nodemon ./app.js