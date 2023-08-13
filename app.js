const { Server } = require("./utils");
const { Ws, Api } = require("./config");
const DBSqlite3 = require("./db/DBSqlite3");
const def = require("./def");
const express = require("express");
const nodeCron = require("node-cron");
const { DBAdapter } = require("./db/Adapter");
require("dotenv").config();

const app = express();
const api = new Api();
const DBType = new DBSqlite3();

def();

(async () => {
  await api.create();

  await api.token();

  const url = await new Server().CleanAddress(
    `${process.env.ADDRESS}:${process.env.PORT_ADDRESS}`,
    false,
    false,
  );

  const ws = new Ws({ url, accessToken: api.accessToken, DB: DBType });

  ws.logs();
})();

const PORT = process.env?.PORT;

// const db = new DBAdapter(DBType);
// db.deleteInactiveUsers();

nodeCron.schedule(
  `*/${process.env.CHECK_INACTIVE_USERS_DURATION} * * * *`,
  () => {
    const db = new DBAdapter(DBType);

    db.deleteInactiveUsers();
  },
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
