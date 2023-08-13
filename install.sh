#!/bin/bash

# Install node.js & npm
cd ~

# if [ -f /etc/os-release ]; then
#     DISTRO=$(awk -F= '/^ID=/{print $2}' /etc/os-release)
# else
#     echo "The operating system is not supported"
#     exit 1
# fi

# if ! command -v node &> /dev/null; then
#     if [ "$DISTRO" == "centos" ] || [ "$DISTRO" == "UBUNTU" ] || [ "$DISTRO" == "fedora" ]; then
#         curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
#         source ~/.bashrc
#         nvm install --lts

#     else
#         echo "The operating system is not supported"
#         exit 1
#     fi

#     echo "Node.js has been successfully installed."

# else
#     echo "node.js is installed on your system. Current version: $(node --version)"
# fi

# clone project
git clone https://github.com/mmdzov/luIP-marzban.git

# Install node_modules
cd luIP-marzban
npm install

# create .env file
cp env.example .env

read -p "Enter your domain: " domain
read -p "Enter your domain port: " domain_port
read -p "Is your domain ssl enabled? [y/n]: " domain_ssl
read -p "Enter your Panel Username: " panel_username
read -sp "Panel Password: " panel_password

sed -i "s/ADDRESS = .*/ADDRESS = $domain/" ".env"
sed -i "s/PORT = .*/PORT = $domain_port/" ".env"

if [[ "$domain_ssl" == "y" || "$domain_ssl" == "Y" ||  "$domain_ssl" == "" ]]; then
    sed -i "s/SSL = .*/SSL = true/" ".env"
fi

sed -i "s/USER = .*/USER = $panel_username/" ".env"
sed -i "s/PASS = .*/PASS = $panel_password/" ".env"

clear

# Install iptables
function check_iptables() {
  if ! command -v iptables &> /dev/null; then
    return 1
  fi
}

function install_iptables() {
  if command -v apt-get &> /dev/null; then
    apt-get install -y iptables
  elif command -v yum &> /dev/null; then
    yum install -y iptables
  elif command -v dnf &> /dev/null; then
    dnf install -y iptables
  else
    echo "The operating system is not supported"
    exit 1
  fi
}

if ! check_iptables; then
  echo "Istall iptables"
  install_iptables
fi

echo "iptables has been successfully installed"

# Start app
npm start
