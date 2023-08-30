const { join } = require("path");
const { DBInterface } = require("../interface");
const { File } = require("../utils");
const sqlite3 = require("sqlite3").verbose();

function connect() {
  const dbPath = join(__dirname, "../", "db.sqlite");

  new File().ForceExistsFile(dbPath, "");

  return new sqlite3.Database(dbPath);
}

const db = connect();

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (email TEXT UNIQUE, ips TEXT)");
});

class DBSqlite3 extends DBInterface {
  async read(email) {
    return await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
          if (err) {
            reject(err);
          } else {
            if (row) {
              row.ips = JSON.parse(row.ips);
              // console.log("Read db:", row);
              resolve(row);
            } else resolve(null);
          }
        });
      });
    });
  }

  async readAll() {
    return await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get("SELECT * FROM users", (err, row) => {
          if (err) {
            reject(err);
          } else {
            // console.log(row);
          }
        });
      });
    });
  }

  addUser(data) {
    db.serialize(() => {
      db.run(
        "INSERT INTO users (email, ips) VALUES (?, ?)",
        [data.email, JSON.stringify(data.ips)],
        (err, res) => {
          if (err) {
            throw new Error(err);
          }
        },
      );
    });
  }

  addIp(email, ipData) {
    // Do not continue if the email is empty
    if (!email?.trim()) return;
    if (!ipData?.ip) return;

    db.serialize(() => {
      // Find user based on email
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) {
          throw new Error(err);
        } else {
          // If the email does not exist, create it and assign the input IP to its first IP
          if (!row) {
            this.addUser({
              email,
              ips: [{ ...ipData, first: true }],
            });
            return;
          }

          const ips = JSON.parse(row.ips);
          const indexOfIp = ips.findIndex((item) => item.ip === ipData.ip);

          // Get the users.json file
          const usersJson = new File().GetJsonFile(
            join(__dirname, "../", "users.json"),
          );
          const indexOfUser = usersJson.findIndex((item) => item[0] === email);

          const userJson = usersJson[indexOfUser] || [
            email,
            process.env.MAX_ALLOW_USERS,
          ];

          // If the IP is not already available and if there is enough space in database, add it
          if (indexOfIp === -1 && ips.length < +userJson[1]) {
            ips.push(ipData);

            db.run(
              'UPDATE users SET ips = JSON_REPLACE(ips, "$", ?) WHERE email = ?',
              [JSON.stringify(ips), email],
              (updateErr, updateRow) => {
                if (updateErr) {
                  throw new Error(updateErr);
                } else {
                  // console.log("Ip Successfully Updated");
                }
              },
            );

            return;
          } else if (indexOfIp !== -1) {
            ips[indexOfIp].date = new Date().toISOString().toString();

            db.run(
              'UPDATE users SET ips = JSON_REPLACE(ips, "$", ?) WHERE email = ?',
              [JSON.stringify(ips), email],
              (updateErr, updateRow) => {
                if (updateErr) {
                  throw new Error(updateErr);
                } else {
                  // console.log("Ip Successfully Added");
                }
              },
            );
          }
        }
      });
    });
  }

  deleteIp(email, ip) {
    db.serialize(() => {
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) throw new Error(err);
        else {
          if (!row) return;

          const ips = JSON.parse(row.ips);
          const newIps = ips.filter((item) => item.ip !== ip);

          db.run(
            'UPDATE users SET ips = JSON_REPLACE(ips, "$", ?) WHERE email = ?',
            [JSON.stringify(newIps), email],
            (updateErr, updateRow) => {
              if (updateErr) {
                throw new Error(updateErr);
              } else {
                // console.log("Ip Successfully Added");
              }
            },
          );
        }
      });
    });
  }

  deleteLastIp(email) {
    db.serialize(() => {
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) throw new Error(err);
        else {
          if (!row) return;

          const ips = JSON.parse(row.ips);

          ips.pop();

          db.run(
            'UPDATE users SET ips = JSON_REPLACE(ips, "$", ?) WHERE email = ?',
            [JSON.stringify(ips), email],
            (updateErr, updateRow) => {
              if (updateErr) {
                throw new Error(updateErr);
              } else {
                // console.log("Ip Successfully Added");
              }
            },
          );
        }
      });
    });
  }

  deleteUser(email) {
    db.run("DELETE FROM users WHERE email = ?", email, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully deleted email from db.sqlite");
      }
    });
  }

  deleteInactiveUsers() {
    const currentTime = new Date().getTime();
    const fewMinutesLater = new Date(
      currentTime - +process.env.CHECK_INACTIVE_USERS_DURATION * 60 * 1000,
    );
    // console.log(fewMinutesLater.toISOString());

    db.serialize(function () {
      db.all(
        `SELECT * FROM users WHERE json_extract(ips, '$[0].date') <= ?`,
        fewMinutesLater.toISOString().toString(),
        function (err, rows) {
          if (err) {
            console.error(err);
            return;
          }

          rows.forEach(function (row) {
            const email = row.email;
            const ips = JSON.parse(row.ips);

            const updatedIds = ips.filter(function (id) {
              const idDate = new Date(id.date);
              return idDate > fewMinutesLater;
            });

            // console.log("updateIds", updatedIds);

            db.run(
              `UPDATE users SET ips = ? WHERE email = ?`,
              JSON.stringify(updatedIds),
              email,
              function (err) {
                if (err) {
                  console.error(err);
                  return;
                }
                // console.log(`Record with email ${email} updated.`);
              },
            );
          });
        },
      );
    });
  }
}

module.exports = DBSqlite3;
