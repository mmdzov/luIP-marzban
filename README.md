# luIP-marzban
Limit users in each proxy configuration


## Installation

If you don't have node.js installed on your server, install it with nvm


#### Install Node.js
```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
  source ~/.bashrc
  nvm install --lts
```


#### Install iptables

```bash
  sudo apt-get install -y iptables
```


#### Install luIP-marzban
```bash
  git clone https://github.com/mmdzov/luIP-marzban.git
  cd luIP-marzban
  cp .env.example .env
  npm install
```
#### Install PM2
```bash
  npm install pm2 -g
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

## Permission to use ipban.sh
In order for the file to work, permission must be obtained to use it
```bash
  # Open the project folder, then execute the follow command
  chmod +x ./ipban.sh
```


## Run the project
After configuring the project, run it
```bash
  # Open the project folder, then execute the follow command
  npm start

```
