const WebSocket = require("ws");
const { User, Server } = require("./utils");
const { default: axios } = require("axios");
const { DBAdapter } = require("./db/Adapter");
const DBRedis = require("./db/DBSqlite3");

class Ws {
  /**
   * @typedef {object} WebSocketConfigType
   * @property {string} url
   * @property {string} accessToken
   *
   *
   * @param {WebSocketConfigType} params
   *
   */
  constructor(params) {
    const url = `${process.env.SSL ? "wss" : "ws"}://${
      params.url
    }/api/core/logs?interval=${process.env.FETCH_INTERVAL_LOGS_WS}&token=${
      params.accessToken
    }`;

    const ws = new WebSocket(url);

    this.params = params;

    this.ws = ws;
  }

  logs() {
    this.ws.on("message", (msg) => {
      const bufferToString = msg.toString();
      const { ip, port } = new User().GetNewUserIP(bufferToString);
      const email = new User().GetEmail(bufferToString);

      const db = new DBAdapter(new DBRedis());

      db.addIp(email, {
        ip,
        port,
        date: new Date().toLocaleString("en-US"),
      });
    });
  }
}

class Api {
  /**
   * @description Marzban access_token
   */
  accessToken = "";

  /**
   * @description Default: Bearer
   */
  accessTokenType = "Bearer";

  /**
   * @description Creates an instance to communicate with the marzban api
   * @returns {Promise}
   */
  async create() {
    const url = await new Server().CleanAddress(
      `${process.env.ADDRESS}:${process.env.PORT}`,
    );

    this.axios = axios.create({
      baseURL: url,
      headers: {
        accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  /**
   * @description It receives access_token from Marzban api
   * @returns {Promise}
   */
  async token() {
    const { data } = await this.axios.post("/admin/token", {
      username: process.env.USER,
      password: process.env.PASS,
    });

    this.accessToken = data.access_token;
    this.accessTokenType = data.token_type;
  }
}

module.exports = { Ws, Api };
