const { Server } = require("./utils");
const { Ws, Api, Socket, IPGuard } = require("./config");
const DBSqlite3 = require("./db/DBSqlite3");
const def = require("./def");
const app = require("express")();
const nodeCron = require("node-cron");
const { DBAdapter } = require("./db/Adapter");
const { exec } = require("child_process");
const { join } = require("path");
const router = require("./api/controller");
const bodyParser = require("body-parser");
const tg = require("./telegram/tg");
const server = require("http").createServer(app);

require("dotenv").config();

const api = new Api();
const DBType = new DBSqlite3();

DBType.deleteInactiveUsers();

def();

const socket = new Socket({
  server,
  callback: (socket) => {
    // console.log("Connected to socket server.");
  },
});

(async () => {
  tg();

  api.create();

  await api.token();

  const url = new Server().CleanAddress(
    `${process.env.ADDRESS}:${process.env.PORT_ADDRESS}`,
    false,
    false,
  );

  const wsData = {
    url,
    accessToken: `${api.accessToken}`,
    DB: DBType,
    api,
    socket,
  };

  const ws = new Ws(wsData);

  const nodes = await api.getNodes();

  let websockets = [];

  const wss = ws.logs();

  websockets.push(wss);

  for (let i in nodes) {
    const node = nodes[i];

    const ws = new Ws({ ...wsData, node });

    const wss = ws.logs();

    websockets.push(wss);
  }

  nodeCron.schedule(`*/30 * * * *`, async () => {
    await api.token();

    for (let i in websockets) {
      const ws = websockets[i];

      ws.access_token = api.accessToken;
    }
  });
})();

if (process.env.NODE_ENV.includes("production")) {
  nodeCron.schedule(
    `*/${process.env.CHECK_INACTIVE_USERS_DURATION} * * * *`,
    () => {
      const db = new DBAdapter(DBType);
      db.deleteInactiveUsers();
    },
  );
  
  if (process.env?.TARGET === "IP") {
    nodeCron.schedule(
      `*/${process.env.CHECK_IPS_FOR_UNBAN_USERS} * * * *`,
      () => {
        socket.UnbanIP();

        exec("bash ./ipunban.sh", (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing ipunban.sh: ${error.message}`);
            return;
          }
          if (stderr) {
            console.error(`ipunban.sh stderr: ${stderr}`);
            return;
          }
          // console.log(`ipunban.sh stdout: ${stdout}`);
        });
      },
    );
  }

  if (process.env?.TARGET === "PROXY") {
    nodeCron.schedule(
      `*/${process.env.CHECK_IPS_FOR_UNBAN_USERS} * * * *`,
      () => {
        // console.log("Check for unban users");
        new IPGuard({
          api,
          db: DBType,
        }).activeUsersProxy();
      },
    );
  }
}

// Api server
if (process.env?.API_ENABLE === "true") {
  const PORT = process.env?.API_PORT || 3000;

  let address = new Server().CleanAddress(
    `${process.env.ADDRESS}:${PORT}`,
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

  server.listen(PORT, () => {
    console.log(`Server running: ${address}`);
  });
}
