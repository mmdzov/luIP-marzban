const { join } = require("path");
const { DBInterface } = require("../interface");
const sqlite3 = require("sqlite3");
const { File } = require("../utils");

function connect() {
  const dbPath = join(__dirname, "../", "db.sqlite");

  new File().ForceExistsFile(dbPath);

  return new sqlite3.Database(dbPath);
}

const db = connect();

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (email TEXT, ips TEXT)");
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
              resolve(row);
            } else resolve(null);
          }
        });
      });
    });
  }

  addUser(data) {
    db.serialize(() => {
      db.run("INSERT INTO users (email, ips) VALUES (?, ?)", [
        data.email,
        JSON.stringify(data.ips),
      ]);
    });
  }

  addIp(email, ipData) {
    // Do not continue if the email is empty
    if (!email?.trim()) return;

    db.serialize(() => {
      // Find user based on email
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) {
          throw new Error(err);
        } else {
          // If the email does not exist, create it and assign the input IP to its first IP
          if (!row)
            this.addUser({
              email,
              ips: [{ ...ipData, first: true }],
            });
          else {
            const ips = JSON.parse(row.ips);
            const indexOfIp = ips.findIndex((item) => item.ip === ipData.ip);

            // Get the users.json file
            const usersJson = new File().GetFilesJson(join("users.json"));
            const indexOfUser = usersJson.findIndex(
              (item) => item[0] === email,
            );

            const userJson = usersJson[indexOfUser] || [
              email,
              process.env.ALL_PROXIED,
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
                    // console.log("Ip Successfully Added");
                  }
                },
              );

              return;
            } else if (indexOfIp !== -1) {
              ips[indexOfIp].date = new Date().toLocaleString("en-US");

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
}

module.exports = DBSqlite3;
