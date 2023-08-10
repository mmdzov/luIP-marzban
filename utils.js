const fs = require("fs");

class User {
  /**
   *
   * @typedef {Object} NewUserIpType
   * @property {string} ip
   * @property {string} port
   *
   * @param {string} data Raw websocket data
   * @returns {NewUserIpType}
   */
  GetNewUserIP = (data) => {
    let returnData = { ip: "", port: "" };

    const chunks = data.split(" ");

    const accepted = "accepted";

    if (!chunks.includes(accepted)) return returnData;

    const fullAddress = chunks.reduce((prev, curr, index) => {
      if (curr === accepted) prev = chunks[index - 1];

      return prev;
    }, "");

    const [ip, port] = fullAddress.split(":");

    return { ip, port };
  };

  /**
   *
   * @param {string} data Raw websocket data
   * @returns {string}
   */
  GetEmail = (data) => {
    let returnData = "";

    const chunks = data.split(" ");

    if (!chunks.includes("email:")) return returnData;

    const index = chunks.findIndex((item) => item === "email:");

    const email = chunks[index + 1].split(".")[1].split("\n")[0];

    return email;
  };
}

class Server {
  /**
   * @param {string} address address with port. Like: example.com:443
   * @param {boolean} api Return address with api
   * @returns {Promise<string>}
   */
  async CleanAddress(address, api = true, showHttp = true) {
    const [ADDRESS, port] = address.split(":");

    let _address = address;

    if (+port === 443) _address = ADDRESS;

    if (showHttp)
      if (process.env.SSL == "true") _address = `https://${_address}`;
      else _address = `http://${_address}`;

    if (api) _address += "/api";

    return _address;
  }
}

class File {
  ForceExistsFile(path, data = null) {
    if (!fs.existsSync(path)) fs.writeFileSync(path, data ? data : "");

    return;
  }

  GetFilesJson(path) {
    this.ForceExistsFile(path);

    return JSON.parse(fs.readFileSync(path));
  }
}

module.exports = { User, Server, File };
