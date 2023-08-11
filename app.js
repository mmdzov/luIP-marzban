const { Server } = require("./utils");
const { Ws, Api } = require("./config");
const DBSqlite3 = require("./db/DBSqlite3");
const def = require("./def");
require("dotenv").config();

def();

const api = new Api();

(async () => {
  await api.create();

  await api.token();

  const url = await new Server().CleanAddress(
    `${process.env.ADDRESS}:${process.env.PORT}`,
    false,
    false,
  );

  const ws = new Ws({ url, accessToken: api.accessToken, DB: new DBSqlite3() });

  ws.logs();
})();
