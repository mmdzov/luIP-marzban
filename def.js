const { join } = require("path");
const { PFile } = require("./utils");

function def() {
  new PFile().ForceExistsFile(
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

  // new PFile().ForceExistsFile("ban.sqlite");
}

module.exports = def;
