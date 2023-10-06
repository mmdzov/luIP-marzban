const fs = require("fs");
const { spawn } = require("child_process");
const axios = require("axios");
const { join } = require("path");

function banIP(ip, email) {
  const scriptPath = "./ipban.sh";
  const args = [
    scriptPath,
    ip,
    `${process.env.BAN_TIME}`,
    `${process.env.SSH_PORT}`,
  ];

  const childProcess = spawn("bash", args);

  childProcess.on("close", (code) => {
    if (code === 0) {
      if (process.env.TG_ENABLE === "true")
        globalThis.bot.api.sendMessage(
          process.env.TG_ADMIN,
          `${email}: IP ${ip} banned successfully.
Duration: ${process.env.BAN_TIME} minutes
          `,
        );

      console.log(`IP ${ip} banned successfully.`);
    } else {
      console.error(`Failed to ban IP ${ip}.`);
    }
  });
}

class User {
  /**
   * @param {string} data Raw websocket data
   * @returns {Promise<NewUserIpType[]>}
   */
  GetNewUserIP = async (data) => {
    let lines = data
      .split(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}/g)
      .map((item) => item.trim())
      .filter((item) => item);

    lines = lines.filter((item) => item.includes("accepted"));

    if (lines.length === 0) return [];

    const getIp = async (params) => {
      const chunks = params.split(":");

      if (/[a-zA-Z]/g.test(params)) chunks.shift();

      // try {
      //   const { data } = await axios.get(`http://ip-api.com/json/${chunks[0]}`);

      //   if (  
      //     data.countryCode !==
      //     (process.env?.COUNTRY_CODE?.toUpperCase() || "IR")
      //   )
      //     return {};
      // } catch (e) {
      //   console.error(e);
      //   return {};
      // }

      return { ip: chunks[0], port: chunks[1] };
    };

    let newLines = [];

    for (let i in lines) {
      const item = lines[i];
      const res = await getIp(item.split(" ")[0]);

      if (Object.keys(res).length === 0) continue;

      newLines.push({
        ...res,
        email: item.split(" ").slice(-1)[0].replace(/\d\./g, ""),
      });
    }

    // console.log("lines", lines);

    // console.log("newLines Before", newLines);

    return newLines.reduce((prev, curr) => {
      const index = prev.findIndex((item) => item.ip === curr.ip);
      if (index !== -1) prev[index] = curr;
      else prev.push(curr);

      return prev;
    }, []);
  };

  /**
   *
   * @param {string} data Raw websocket data
   * @returns {string}
   */
  GetEmail = (data) => {
    let returnData = "";

    const chunks = data.split(" ");

    if (!chunks.includes("email:")) return returnData;

    const index = chunks.findIndex((item) => item === "email:");

    const email = chunks[index + 1].split(".")[1].split("\n")[0];

    return email;
  };

  /**
   *
   * @param {string} data Raw websocket data
   * @returns {number}
   */
  GetConnectionId(data) {
    const chunks = data.split(" ");

    const index = chunks.findIndex((item) => item === "[Info]");

    if (index === -1) return 0;

    const d = chunks[index + 1];

    return JSON.parse(d)[0];
  }

  /**
   *
   * @param {string} data Raw websocket data
   * @returns {number}
   */
  Closed = (data) => {
    const chunks = data.split(" ");

    const ends =
      chunks.includes("connection") &&
      chunks.includes("ends") &&
      chunks.includes("websocket:");

    if (!ends) return 0;

    return this.GetConnectionId(data);
  };
}

class Server {
  /**
   * @param {string} address address with port. Like: example.com:443
   * @param {boolean} api Return address with api
   * @returns {string}
   */
  CleanAddress(address, api = true, showHttp = true, socket = false) {
    const [ADDRESS, port] = address.split(":");

    let _address = address;

    if (+port === 443) _address = ADDRESS;

    if (showHttp)
      if (process.env.SSL == "true") _address = `https://${_address}`;
      else _address = `http://${_address}`;

    if (api) _address += "/api";
    if (socket) _address += process.env.LISTEN_PATH;

    return _address;
  }
}

class File {
  constructor() {}

  ForceExistsFile(path, data) {
    if (!fs.existsSync(path)) fs.writeFileSync(path, data || "");

    return;
  }

  GetJsonFile(path,replace) {
    this.ForceExistsFile(path,replace);

    return JSON.parse(fs.readFileSync(path));
  }

  GetCsvFile(path) {
    this.ForceExistsFile(path, "");

    return fs.readFileSync(path);
  }
}

module.exports = { User, Server, File, banIP };
