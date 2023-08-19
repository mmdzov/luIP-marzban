const { Bot } = require("grammy");
const { run, sequentialize } = require("@grammyjs/runner");
const { SocksProxyAgent } = require("socks-proxy-agent");

function tg() {
  if (Boolean(process.env.TG_ENABLE) === false) return;

  let bot = {};

  if (process.env.NODE_ENV === "development") {
    const socksAgent = new SocksProxyAgent("socks://127.0.0.1:10808");

    bot = new Bot(process.env.TG_TOKEN, {
      client: {
        baseFetchConfig: {
          agent: socksAgent,
        },
      },
    });
  } else bot = new Bot(process.env.TG_TOKEN);

  const runner = run(bot);

  if (runner.isRunning()) console.log("Bot is running");

  bot.catch((err) => {
    console.log(err);
  });

  globalThis.bot = bot;

  return bot;
}

module.exports = tg;
