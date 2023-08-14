const { join } = require("path");
const { File } = require("./utils");

function def() {
  new File().ForceExistsFile(
    join("users.json"),
    JSON.stringify(
      [
        ["user1", 1],
        ["user2", 2],
      ],
      0,
      1,
    ),
  );
}

module.exports = def;
