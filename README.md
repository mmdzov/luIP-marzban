# luIP-marzban
Limit users in each proxy configuration


## Introduction

- [Description](https://github.com/mmdzov/luIP-marzban/tree/main#description)
- [Requirements](https://github.com/mmdzov/luIP-marzban/tree/main#installation)
  - [Install node.js](https://github.com/mmdzov/luIP-marzban/tree/main#install-nodejs)
  - [Install iptables / gawk / csvtool](https://github.com/mmdzov/luIP-marzban/tree/main#install-other-requirements)
- [Install luIP-marzban](https://github.com/mmdzov/luIP-marzban/tree/main#install-luip-marzban)
- [Environments](https://github.com/mmdzov/luIP-marzban/tree/main#luip-marzbanenv-file)
- [users.json](https://github.com/mmdzov/luIP-marzban/tree/main#usersjson)
- [Permissions](https://github.com/mmdzov/luIP-marzban/tree/main#permission-to-use-ipbansh--ipunbansh)
- [Run the project](https://github.com/mmdzov/luIP-marzban/tree/main#run-the-project)


## Description 

The luIP-marzban project was created and developed based on node.js and uses the marzban api.

luip stores connected and authorized users in the sqlite database. Saving and updating users is done through websocket where traffic is intercepted by luIP-marzban and data including IPs are received from there.

Users are updated through websocket and with a schedule based on the `FETCH_INTERVAL_LOGS_WS` variable located in `.env`

Every x minutes, it is checked based on the `CHECK_INACTIVE_USERS_DURATION` variable: if the last update of a connected IP was y minutes, based on the `CHECK_INACTIVE_USERS_DURATION` variable, the user's IP will be removed from the connected list. And this possibility is provided so that space remains empty and other clients are allowed to connect

IPs are blocked via [iptables](https://www.digitalocean.com/community/tutorials/iptables-essentials-common-firewall-rules-and-commands), then incoming traffic on said IP is blocked for the duration specified in the `BAN_TIME` variable.

Blocked IPs automatically in `blocked_ips.csv` file are stored, then every x minutes based on the value of the `CHECK_IPS_FOR_UNBAN_USERS` variable, the ipunban.sh file is executed and checks: if the stored IPs have been jailed for y minutes or more, they will be released from jail

### Note: This project does not currently support marzban node, but this support will be provided in the next updates.

## Installation

If you don't have node.js installed on your server, install it with nvm


#### Install Node.js
```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
  source ~/.bashrc
  nvm install --lts
```


#### Install other requirements

```bash
  sudo apt-get install -y iptables
  sudo apt-get install gawk
  sudo apt-get install csvtool
  npm install pm2 -g
```


#### Install luIP-marzban
```bash
  git clone https://github.com/mmdzov/luIP-marzban.git
  cd luIP-marzban
  cp .env.example .env
  npm install
```

## luIP-marzban/.env file
```bash
  # Open the project folder, then execute the follow command
  nano .env
```


#### Address configuration
| Parameter | Description                |
| :-------- | :------------------------- |
| `ADDRESS` | Your domain or sub domain. e.g: example.com or sub.example.com |
| `PORT_ADDRESS` | Your domain port. e.g: 443 |
| `SSL` | Did you get domain SSL? e.g: true or false |


#### Marzban configuration

| Parameter | Description                |
| :-------- | :------------------------- |
| `P_USER` | Enter the username of Marzban panel e.g: admin |
| `P_PASS` | Enter the password of Marzban panel e.g: admin |

#### App configuration

| Parameter | Description                |
| :-------- | :------------------------- |
| `MAX_ALLOW_USERS` | The maximum number of users that can connect to a proxy. e.g: 1 |
| `BAN_TIME` | The length of time an IP is in jail based on minutes. e.g: 5 |

#### Advance configuration

| Parameter | Description                |
| :-------- | :------------------------- |
| `FETCH_INTERVAL_LOGS_WS` | Based on this, websocket logs are checked every x seconds to track traffic. e.g: 1 |
| `CHECK_INACTIVE_USERS_DURATION` | It is checked every x minutes, users whose last update was x minutes ago or more are disabled. e.g: 5 |
| `CHECK_IPS_FOR_UNBAN_USERS` | Every x minutes it checks all ips, if they are in prison for more than the time specified in `BAN_TIME`, they will be unbanned. e.g: 1 |
| `SSH_PORT` | Enter your ssh port in this section. 22 is set by default |


## users.json 
You can set specific users in the users.json file

- Priority is always with this file

In the example below, email1 is the proxy name and 2 represents the maximum number of users that can be connected.

#### luIP-marzban/users.json
```json
  [
    ["email1", 2],
    ["email2", 10]
  ]
```

## Permission to use ipban.sh && ipunban.sh
In order for the file to work, permission must be obtained to use it
```bash
  # Open the project folder, then execute the follow command
  chmod +x ./ipban.sh
  chmod +x ./ipunban.sh
```


## Run the project
After configuring the project, run it
```bash
  # Open the project folder, then execute the follow command
  npm start

```

### Things that need to be done

- [ ] Api ( with token )
- [ ] Marzban node
- [ ] A bash script to summarize installation and configuration
