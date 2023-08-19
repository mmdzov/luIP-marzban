const crypto = require("crypto-js");
const { File } = require("../utils");
const { join } = require("path");
const fs = require("fs");
const { response } = require("./utils");

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

    if (file.includes(data.email))
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
}

module.exports = Model;
