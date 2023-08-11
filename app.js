const { Server } = require("./utils");
const { Ws, Api } = require("./config");
const DBSqlite3 = require("./db/DBSqlite3");
const def = require("./def");
const express = require("express");
require("dotenv").config();

const app = express();

def();

const api = new Api();

(async () => {
  await api.create();

  await api.token();

  const url = await new Server().CleanAddress(
    `${process.env.ADDRESS}:${process.env.PORT_ADDRESS}`,
    false,
    false,
  );

  const ws = new Ws({ url, accessToken: api.accessToken, DB: new DBSqlite3() });

  ws.logs();
})();

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
