const { join } = require("path");
const { File } = require("./utils");

function def() {
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

  new File().ForceExistsFile("ban.sqlite");
}

module.exports = def;
