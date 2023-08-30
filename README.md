# luIP-marzban
Limit users in each proxy configuration

## Introduction

- [Mechanism](https://github.com/mmdzov/luIP-marzban/tree/main#mechanism)
- [Features](https://github.com/mmdzov/luIP-marzban/tree/main#features)
- [Requirements](https://github.com/mmdzov/luIP-marzban/tree/main#installation)
  - [Install node.js](https://github.com/mmdzov/luIP-marzban/tree/main#install-nodejs)
  - [Install iptables / gawk / csvtool](https://github.com/mmdzov/luIP-marzban/tree/main#install-other-requirements)
- [Install luIP-marzban](https://github.com/mmdzov/luIP-marzban/tree/main#install-luip-marzban)
- [Environments](https://github.com/mmdzov/luIP-marzban/tree/main#luip-marzbanenv-file)
- [Target](https://github.com/mmdzov/luIP-marzban/tree/dev#target)
- [users.json](https://github.com/mmdzov/luIP-marzban/tree/main#usersjson)
- [Permissions](https://github.com/mmdzov/luIP-marzban/tree/main#permission-to-use-ipbansh--ipunbansh)
- [Run the project](https://github.com/mmdzov/luIP-marzban/tree/main#run-the-project)
- [luIP-marzban-node version](https://github.com/mmdzov/luIP-marzban/tree/dev#node-version)
- [API Reference](https://github.com/mmdzov/luIP-marzban/tree/main#run-the-project)
- [FAQ](https://github.com/mmdzov/luIP-marzban/tree/main#faq)


## Mechanism

The luIP-marzban project was created and developed based on node.js and uses the marzban api.

luip stores connected and authorized users in the sqlite database. Saving and updating users is done through websocket where traffic is intercepted by luIP-marzban and data including IPs are received from there.

Users are updated through websocket and with a schedule based on the `FETCH_INTERVAL_LOGS_WS` variable located in `.env`

Every x minutes, it is checked based on the `CHECK_INACTIVE_USERS_DURATION` variable: if the last update of a connected IP was y minutes, based on the `CHECK_INACTIVE_USERS_DURATION` variable, the user's IP will be removed from the connected list. And this possibility is provided so that space remains empty and other clients are allowed to connect

IPs are blocked via [iptables](https://www.digitalocean.com/community/tutorials/iptables-essentials-common-firewall-rules-and-commands), then incoming traffic on said IP is blocked for the duration specified in the `BAN_TIME` variable.

Blocked IPs automatically in `blocked_ips.csv` file are stored, then every x minutes based on the value of the `CHECK_IPS_FOR_UNBAN_USERS` variable, the ipunban.sh file is executed and checks: if the stored IPs have been jailed for y minutes or more, they will be released from jail

<p align="center" width="100%">
    <img width="80%" src="https://github.com/mmdzov/luIP-marzban/blob/7b92fabdad4ab1e7ea818fd988b9875c866b8eaa/luIP-marzban.jpg" />
</p>


## Features

- Automatic log
- Connect to Telegram bot
- API
- Specific determination of users
- Import/Export Backup
- IP target

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


| Parameter | Description                |
| :-------- | :------------------------- |
| `TARGET` | You can set the target. [More](https://github.com/mmdzov/luIP-marzban/tree/dev#node-version) |

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

#### Telegram bot configuration

| Parameter | Description                |
| :-------- | :------------------------- |
| `TG_ENABLE` | If you want to use Telegram bot for logs, set this value to `true` |
| `TG_TOKEN` | The bot token you received from @botfather |
| `TG_ADMIN` | Your user ID that you received from @userinfobot |

## Target
You can set the target. Its value is considered as IP by default.


### TARGET=IP
Blocks unauthorized IPs and maintains connections

Advantages

1. Better user experience: Unauthorized IPs are blocked and connected users are not disconnected.

2. View connected users: You can view connected users and monitor them.


### TARGET=PROXY

In this method, the focus is on enabling/disabling the proxy, and if the connections of a proxy reach its limit, it will be disabled and will be turned on again after a period of time has passed.


Advantages

1. Easier to use.

2. Less consumption of resources.

3. No need to install [luIP-marzban-node](https://github.com/mmdzov/luIP-marzban/tree/dev#node-version).

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
  chmod +x ./restore_banned_ips.sh
```


## Run the project
After configuring the project, run it
```bash
  # Open the project folder, then execute the follow command
  npm start

```


## Node version
If you want the IP limiter to be supported in the nodes, first make sure in the .env file that the TARGET is equal to the IP, then install and run the [luIP-marzban-node](https://github.com/mmdzov/luIP-marzban-node) project on all your nodes.

## Stop luIP with kill process

You can run the command below, but whenever you want, you can go to the project path [ `cd /luIP-marzban` ] and type `npm start`, luIP will run again.

```bash
pm2 kill
pm2 flush # Deletes the log
```

## Checking blocked IPs

```bash
iptables -L -n
```

## Unblock all IPs
First, empty blocked_ips.csv, then run the following command
```bash
iptables -F
```

## Uninstall

```bash
pm2 kill
sudo rm -rf /luIP-marzban
```


## API Reference

We get to know the following environment variables that are located in the .env file by default.

##### When you use the api, the data will be stored in a file called `users.csv`, and this file has a higher priority in reading than `MAX_ALLOW_USERS` and `users.json`, just as `users.json` has a higher priority than `MAX_ALLOW_USERS`.


| Parameter | Description                |
| :-------- | :------------------------- |
| `API_ENABLE` | If you want to use api, set the value of this variable equal to `true` |
| `API_SECRET` | Short secret for access_token. The encryption type of access_tokens is AES, and only the expiration date of the token is included in the access_token. secret is a password to encrypt and decrypt access_token with AES encryption type. |
| `API_PATH` | Displays api path by default /api |
| `API_LOGIN` | Enter a desired username and password in the username:password format so that you can be identified to receive the token |
| `API_EXPIRE_TOKEN_AT` | Each access_token you receive has an expiration date. You can set it here |
| `API_PORT` | Choose a port for your api address. Also make sure it is not occupied. By default 4000 |

Your default api address: https://example.com:4000/api

#### Get access_token

```http
  POST /api/token
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `username` | `string` | **Required**. Your `API_LOGIN` username |
| `password` | `string` | **Required**. Your `API_LOGIN` password |


#### Note: In all the following apis, send the value of api_key: YOUR_ACCESS_TOKEN as header. (Fill YOUR_ACCESS_TOKEN with the value you received from /api/token)

#### Add user

```http
  POST /api/add
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required**. The name of your target config. For example test |
| `limit`      | `number` | **Required**. What is the maximum limit? |

#### Update user

```http
  POST /api/update
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required**. The name of your target config. For example test |
| `limit`      | `number` | **Required**. What is the maximum limit? |

#### Delete user

```http
  GET /api/delete/<email>
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required**. The name of your target config. For example test |

#### Clear luIP database

```http
  GET /api/clear
```



## FAQ

#### If there are changes in marzban-node, should I restart luIP?

Yes, to apply the changes, it is necessary to restart luIP through the following command

```bash
# first Open the project dir with follow command
cd /luIP-marzban

# then run follow command
pm2 kill
npm start
```

