const { Bot, session, InputFile } = require("grammy");
const { run } = require("@grammyjs/runner");
const { SocksProxyAgent } = require("socks-proxy-agent");
const { Menu } = require("@grammyjs/menu");
const { hydrateFiles } = require("@grammyjs/files");
const fs = require("fs");
const { join } = require("path");
const { File } = require("../utils");

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

  bot.api.setMyCommands([
    {
      command: "start",
      description: "Start the bot",
    },
  ]);

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
    .row()
    .text("Export backup", async (ctx) => {
      await ctx.replyWithDocument(
        new InputFile(join(__dirname, "../", "users.json"), "users.json"),
      );
      await ctx.replyWithDocument(
        new InputFile(join(__dirname, "../", "users.csv"), "users.csv"),
      );
    });

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
