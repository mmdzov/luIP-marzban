const { default: axios } = require("axios");

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

    console.log(data);

    const chunks = data.split(" ");

    const accepted = "accepted";

    if (!chunks.includes(accepted)) return returnData;

    const fullIp = chunks.reduce((prev, curr, index) => {
      if (curr === accepted) prev = chunks[index - 1];

      return prev;
    }, "");

    const [ip, port] = fullIp.split(":");

    return { ip, port };
  };

  /**
   *
   * @param {string} data Raw websocket data
   * @returns {string}
   */
  getEmail = (data) => {
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
   * @param {string} address ADDRESS address with port. Like: example.com:443
   * @param {boolean} api Return address with api
   * @returns {string}
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

class Api {
  accessToken = "";
  accessTokenType = "";

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

  async token() {
    const { data } = await this.axios.post("/admin/token", {
      username: process.env.USER,
      password: process.env.PASS,
    });

    this.accessToken = data.access_token;
    this.accessTokenType = data.token_type;
  }
}

module.exports = { User, Server, Api };
