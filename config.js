const WebSocket = require("ws");
const { User, Server, IPGuard, File } = require("./utils");
const { default: axios } = require("axios");
const { DBAdapter } = require("./db/Adapter");
const { join } = require("path");
const sqlite3 = require("sqlite3");
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
    this.ws.on("message", (msg) => {
      const bufferToString = msg.toString();
      const { ip, port } = this.user.GetNewUserIP(bufferToString);
      if (!ip) return;
      const email = this.user.GetEmail(bufferToString);

      this.ipGuard.use(
        ip,
        () => this.db.read(email),
        () =>
          this.db.addIp(email, {
            ip,
            port,
            date: new Date().toLocaleString("en-US"),
          }),
      );
    });

    // Closed connections
    // this.ws.on("message", async (msg) => {
    //   const bufferToString = msg.toString();
    //   const cid = new User().Closed(bufferToString);

    //   if (cid === 0) return;

    //   const record = await this.db.getRecordWithCid(cid);

    //   //! get details
    //   console.log("record:", record, cid);

    //   if (!record) return;

    //   // If the user was connected, delete the connection. If it was blocked, fix it
    //   this.db.deleteIp(record.email, cid);
    //   this.ipGuard.unban(cid);
    // });
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
    try {
      const { data } = await this.axios.post("/admin/token", {
        username: process.env.USER,
        password: process.env.PASS,
      });

      this.accessToken = data.access_token;
      this.accessTokenType = data.token_type;
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
