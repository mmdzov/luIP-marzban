const crypto = require("crypto-js");

class Model {
  token() {
    const expireAt =
      Date.now() + 1000 * 60 * 60 * 24 * +process.env.API_EXPIRE_TOKEN_AT;

    const token = crypto.AES.encrypt(
      JSON.stringify({
        expireAt,
      }),
      process.env.API_SECRET,
    ).toString();

    return token;
  }
}

module.exports = Model;
