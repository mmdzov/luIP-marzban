const { join } = require("path");
const { File } = require("./utils");

function def() {
  new File().ForceExistsFile(
    join(__dirname, "users.json"),
    JSON.stringify(
      [
        ["user1", 1],
        ["user2", 2],
      ],
      0,
      1,
    ),
  );

  new File().ForceExistsFile(join(__dirname, "blocked_ips.csv"), "");
  // new File().ForceExistsFile(
  //   join(__dirname, "session.json"),
  //   JSON.stringify({
  //     api: {
  //       key: "",
  //       expireAt: 0,
  //     },
  //   }),
  // );

  if (process.env?.TARGET === "PROXY") {
    new File().ForceExistsFile(
      join(__dirname, "deactives.json"),
      JSON.stringify([]),
    );
  }
}

module.exports = def;
