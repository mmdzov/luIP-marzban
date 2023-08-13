const WebSocket = require("ws");
const { User, Server, IPGuard, File } = require("./utils");
const { default: axios } = require("axios");
const { DBAdapter } = require("./db/Adapter");
const { join } = require("path");
const sqlite3 = require("sqlite3").verbose();
const DBSqlite3 = require("./db/DBSqlite3");

class Ws {
  /**
   * @param {WebSocketConfigType} params
   */
  constructor(params) {
    const url = `${process.env.SSL ? "wss" : "ws"}://${
      params.url
    }/api/core/logs?interval=${process.env.FETCH_INTERVAL_LOGS_WS}&token=${
      params.accessToken
    }`;
    const db = new DBAdapter(params.DB);
    const ws = new WebSocket(url);
    const user = new User();
    const ipGuard = new IPGuard(new DBSqlite3());

    /**
     * someProperty is an example property that is set to `true`
     * @type {WebSocketConfigType}
     * @public
     */
    this.params = params;

    this.db = db;
    this.user = user;
    this.ws = ws;
    this.ipGuard = ipGuard;
  }

  logs() {
    // Opened connections
    this.ws.on("message", async (msg) => {
      const bufferToString = msg.toString();
      const data = this.user.GetNewUserIP(bufferToString);
      if (data.length === 0) return;

      let num = data.length;
      while (num--) {
        const item = data[num];

        await this.ipGuard.use(
          item.ip,
          () => this.db.read(item.email),
          () =>
            this.db.addIp(item.email, {
              ip: item.ip,
              port: item.port,
              date: new Date().toISOString().toString(),
            }),
        );
      }
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

  accessTokenExpireAt = null;

  /**
   * @description Creates an instance to communicate with the marzban api
   * @returns {Promise}
   */
  async create() {
    const url = await new Server().CleanAddress(
      `${process.env.ADDRESS}:${process.env.PORT_ADDRESS}`,
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
    if (this.accessTokenExpireAt && Date.now() < +this.accessTokenExpireAt)
      return;

    try {
      const { data } = await this.axios.post("/admin/token", {
        username: process.env.P_USER,
        password: process.env.P_PASS,
      });

      this.accessToken = data.access_token;
      this.accessTokenType = data.token_type;
      this.accessTokenExpireAt = new Date() + 1000 * 60 * 60;
    } catch (e) {
      console.error(e);
    }
  }
}

class Connection {
  /**
   *
   * @deprecated
   */
  BanDB() {
    const dbPath = join(__dirname, "ban.sqlite");

    new File().ForceExistsFile(dbPath);

    return new sqlite3.Database(dbPath);
  }
}

/**
 * @deprecated
 */
class BanDBConfig {
  constructor() {
    this.db = new Connection().BanDB();

    this.db.serialize(() => {
      const sql =
        "CREATE TABLE IF NOT EXISTS banned (ip TEXT, cid TEXT, date TEXT)";

      this.db.run(sql);
    });
  }

  /**
   * @param {BanIpConfigAddType} params
   */
  add(params) {
    this.db.serialize(() => {
      const sql = "SELECT * FROM banned WHERE cid = ?";
      this.db.get(sql, [params.cid], (err, row) => {
        if (err) throw new Error(err);

        if (!row) {
          const sql = "INSERT INTO banned (ip, cid, date) VALUES (?, ?, ?) ";
          this.db.run(
            sql,
            [{ ...params, date: new Date().toLocaleString("en-US") }],
            (err) => {
              if (err) throw new Error(err);
              console.log("Ip banned:", cid);
            },
          );
        }

        console.log("Ip already banned:", params.cid);
      });
    });
  }

  remove(cid) {
    this.db.serialize(() => {
      const sql = "DELETE FROM banned WHERE cid = ?";
      this.db.run(sql, [cid], (err) => {
        if (err) throw new Error(err);

        console.log("Ip unbanned:", cid);
      });
    });
  }
}

module.exports = { Ws, Api, Connection, BanDBConfig };
