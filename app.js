const { Server } = require("./utils");
const { Ws, Api } = require("./config");
const DBSqlite3 = require("./db/DBSqlite3");
const def = require("./def");
const express = require("express");
const nodeCron = require("node-cron");
const { DBAdapter } = require("./db/Adapter");
const { exec } = require("child_process");
const { join } = require("path");
const router = require("./api/controller");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const api = new Api();
const DBType = new DBSqlite3();

def();

(async () => {
  api.create();

  await api.token();

  const url = new Server().CleanAddress(
    `${process.env.ADDRESS}:${process.env.PORT_ADDRESS}`,
    false,
    false,
  );

  const ws = new Ws({ url, accessToken: api.accessToken, DB: DBType });

  ws.logs();
})();

// nodeCron.schedule(
//   `*/${process.env.CHECK_INACTIVE_USERS_DURATION} * * * *`,
//   () => {
//     const db = new DBAdapter(DBType);

//     db.deleteInactiveUsers();
//   },
// );

// nodeCron.schedule(`*/${process.env.CHECK_IPS_FOR_UNBAN_USERS} * * * *`, () => {
//   exec("bash ./ipunban.sh", (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Error executing ipunban.sh: ${error.message}`);
//       return;
//     }
//     if (stderr) {
//       console.error(`ipunban.sh stderr: ${stderr}`);
//       return;
//     }
//     console.log(`ipunban.sh stdout: ${stdout}`);
//   });
// });

// Api server
if (Boolean(process.env?.API_ENABLE) === true) {
  const PORT = process.env?.API_PORT;

  let address = new Server().CleanAddress(
    `${process.env.ADDRESS}:${process.env.API_PORT}`,
    false,
    true,
  );

  address = `${address}${process.env.API_PATH}`;

  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );
  app.use(bodyParser.json());

  app.use(`${process.env.API_PATH}`, router);

  const server = app.listen(PORT, () => {
    console.log(`Server running: ${address}`);
  });
}
