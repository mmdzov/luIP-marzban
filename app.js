const { Server, File } = require("./utils");
const { Ws, Api } = require("./config");
const express = require("express");
const { join } = require("path");

const app = express();

require("dotenv").config();

new File().ForceExistsFile(
  join("users.json"),
  JSON.stringify(
    [
      ["Email1", 1],
      ["Email2", 2],
    ],
    0,
    1,
  ),
);

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

const PORT = process.env.SERVER_PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
