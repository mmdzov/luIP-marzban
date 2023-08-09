const WebSocket = require("ws");
const { User } = require("./utils");

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

      //   new User().getEmail(bufferToString);
    });
  }
}

module.exports = { Ws };
