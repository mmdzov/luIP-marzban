const { Server, Api } = require("./utils");
const { Ws } = require("./config");

require("dotenv").config();

const api = new Api();

(async () => {
  await api.create();

  await api.token();

  const url = await new Server().CleanAddress(
    `${process.env.ADDRESS}:${process.env.PORT}`,
    false,
    false,
  );

  const ws = new Ws({ url, accessToken: api.accessToken });

  ws.logs();
})();
