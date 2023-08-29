const crypto = require("crypto-js");
const { File } = require("../utils");
const { join } = require("path");
const fs = require("fs");
const { response } = require("./utils");
const DBSqlite3 = require("../db/DBSqlite3");

class Model {
  constructor() {
    this.usersCsvPath = join(__dirname, "../", "users.csv");
  }

  token() {
    const expireAt =
      Date.now() + 1000 * 60 * 60 * 24 * +process.env.API_EXPIRE_TOKEN_AT;

    const token = crypto.AES.encrypt(
      JSON.stringify({
        expireAt,
      }),
      process.env.API_SECRET,
    ).toString();

    return response({
      data: { api_key: token },
      status: 1,
    });
  }

  /**
   * @typedef {Object} ApiAddDataType
   * @property {string} email
   * @property {string} limit
   *
   * @param {ApiAddDataType} data
   */

  add(data) {
    let file = new File().GetCsvFile(this.usersCsvPath).toString();

    file = file.split("\r\n").map((item) => item.split(","));

    if (file.some((item) => item[0] === data.email) === true)
      return response({
        error: {
          type: "DUPLICATE",
          reason: "This email already exists",
        },
      });

    const dataToCsv = `${data.email},${data.limit}\r\n`;

    file += dataToCsv;

    fs.writeFileSync(this.usersCsvPath, file);

    return response({
      status: 1,
    });
  }

  /**
   * @typedef {Object} ApiAddDataType
   * @property {string} email
   * @property {string} limit
   *
   * @param {ApiAddDataType} data
   */

  update(data) {
    let file = new File().GetCsvFile(this.usersCsvPath).toString();

    let emails = file
      .split("\r\n")
      .filter((item) => item.trim())
      .map((item) => [item.split(",")[0], item.split(",")[1]]);

    if (!file.includes(data.email))
      return response({
        error: {
          type: "NOT_FOUND",
          reason: "This email does not exist",
        },
      });

    const index = emails.findIndex((item) => item[0] === data.email);

    emails[index][1] = data.limit;

    emails = emails.map((item) => `${item[0]},${item[1]}`);

    emails = emails.join("\r\n");

    fs.writeFileSync(this.usersCsvPath, emails);

    return response({
      status: 1,
    });
  }

  /**
   * @typedef {Object} ApiAddDataType
   * @property {string} email
   *
   * @param {ApiAddDataType} data
   */
  delete(data) {
    let file = new File().GetCsvFile(this.usersCsvPath).toString();

    let emails = file.split("\r\n").filter((item) => item.trim());

    if (!file.includes(data.email))
      return response({
        error: {
          type: "NOT_FOUND",
          reason: "This email does not exist",
        },
      });

    emails = emails.filter((item) => item.split(",")[0] !== data.email);

    emails = emails.join("\r\n");

    fs.writeFileSync(this.usersCsvPath, emails);

    return response({
      status: 1,
    });
  }

  async getUser(email) {
    const db = new DBSqlite3();

    let user = null;

    try {
      user = await db.read(email);
    } catch (e) {
      // console.error(e)
      return response({
        error: {
          type: "NOT_FOUND",
          reason: "This email does not exist",
        },
      });
    }

    return response({
      data: {
        email,
        ips: user.ips,
        connections: user.ips.length,
      },
      status: 1,
    });
  }

  clear() {
    fs.writeFileSync(this.usersCsvPath, "");

    return response({
      status: 1,
    });
  }
}

module.exports = Model;
