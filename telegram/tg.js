const { Bot, session, InputFile } = require("grammy");
const { run } = require("@grammyjs/runner");
const { SocksProxyAgent } = require("socks-proxy-agent");
const { Menu } = require("@grammyjs/menu");
const { hydrateFiles } = require("@grammyjs/files");
const fs = require("fs");
const { join } = require("path");
const { File } = require("../utils");
const DBSqlite3 = require("../db/DBSqlite3");

function tg() {
  if (process.env.TG_ENABLE === "false") return;

  let bot = null;

  if (process.env.NODE_ENV.includes("development")) {
    const socksAgent = new SocksProxyAgent("socks://127.0.0.1:10808");

    bot = new Bot(process.env.TG_TOKEN, {
      client: {
        baseFetchConfig: {
          agent: socksAgent,
        },
      },
    });
  } else bot = new Bot(process.env.TG_TOKEN);

  bot.use((ctx, next) => {
    if (+ctx.chat.id !== +process.env.TG_ADMIN) return;

    return next();
  });

  const db = new DBSqlite3();

  // bot.api.setMyCommands([
  //   {
  //     command: "start",
  //     description: "Start the bot",
  //   },
  // ]);

  bot.api.config.use(hydrateFiles(bot.token));

  const initial = () => ({
    waitingFor: "",
  });

  bot.use(session({ initial }));

  const menu = new Menu("main-menu")
    .text("Import backup", async (ctx) => {
      ctx.reply("Send me users.csv or users.json or both files");

      ctx.session.waitingFor = "FILE";
    })
    .text("Export backup", async (ctx) => {
      await ctx.replyWithDocument(
        new InputFile(join(__dirname, "../", "users.json"), "users.json"),
      );

      try {
        await ctx.replyWithDocument(
          new InputFile(join(__dirname, "../", "users.csv"), "users.csv"),
        );
      } catch (e) {}
    })
    .row()
    .text("Focus", async (ctx) => {
      ctx.session.waitingFor = "Focus";

      ctx.reply("Send the proxy username");
    })
    .row();

  // .text("Clear connections", async (ctx) => {
  //   fs.writeFileSync(join(__dirname, "../", "db.sqlite"), "");

  //   ctx.answerCallbackQuery({
  //     text: "Applied",
  //   });
  // });

  bot.use(menu);

  bot.command("start", (ctx) => {
    ctx.reply(
      `
Hi
How can i help you ?
    `,
      {
        reply_markup: menu,
      },
    );
  });

  // get connections
  bot.on(
    "message",
    (ctx, next) => {
      if (ctx.session.waitingFor === "Focus") return next();
    },
    async (ctx) => {
      const username = (ctx.message?.text || "").trim();

      if (!username) {
        ctx.session.waitingFor = "";

        return;
      }

      try {
        const data = await db.read(username);

        ctx.reply(`
  Username: ${data.email}      
  Connections: [
  ${data.ips
    .map((item) => `${item.ip}, ${new Date(item.date).toLocaleString("fa-IR")}`)
    .join("\r\n")}  
  ]
  
        `);
      } catch (e) {
        ctx.reply(
          "Failed: The user may not have connected to the proxy yet or may have disconnected.",
        );
        console.log(e);
      }
    },
  );

  bot.on(
    ":document",
    (ctx, next) => {
      if (ctx.session.waitingFor === "FILE") return next();
    },
    async (ctx) => {
      const file = await ctx.getFile();

      let filename = "";

      if (file.file_path.includes(".csv")) {
        filename = join(__dirname, "../", "users.csv");
      } else if (file.file_path.includes(".json")) {
        filename = join(__dirname, "../", "users.json");
      } else return ctx.reply("Unknown file type");

      fs.rmSync(filename);
      await file.download(filename);

      ctx.reply("The backup was registered successfully");
    },
  );

  const runner = run(bot);

  if (runner.isRunning()) console.log("Bot is running");

  bot.catch((err) => {
    console.log(err);
  });

  globalThis.bot = bot;

  return bot;
}

module.exports = tg;
