const { response } = require("./utils");
const crypto = require("crypto-js");
const Joi = require("joi");

const AuthApiKey = (req, res, next) => {
  let apiKey = (req.headers["api_key"] || "").trim();

  if (!apiKey)
    return res.status(403).json(
      response({
        error: {
          type: "AUTH",
          reason: "api_key Not found!",
        },
      }),
    );

  let decryptedKey = crypto.AES.decrypt(
    apiKey,
    process.env.API_SECRET,
  ).toString(crypto.enc.Utf8);

  const parseKey = JSON.parse(decryptedKey);

  if (Date.now() > +parseKey.expireAt)
    return res.status(403).json(
      response({
        error: {
          type: "AUTH",
          reason: "api_key expired Please get a new api_key",
        },
      }),
    );

  return next();
};

class Validator {
  token(req, res, next) {
    /**
     * @type {ApiSetTokenType}
     */
    const data = req.body;

    const schema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return res.status(403).json(
        response({
          error: {
            type: "INVALID",
            reason: error.message,
          },
        }),
      );
    }

    if (process.env.API_LOGIN !== `${data.username}:${data.password}`)
      return res.status(403).json(
        response({
          error: {
            type: "NOT_MATCH",
            reason: "Username or password doesn't match",
          },
        }),
      );

    return next();
  }

  add(req, res, next) {
    const schema = Joi.object({
      email: Joi.string().required(),
      limit: Joi.number().required(),
    });

    const data = req.body;

    const { error } = schema.validate(data);

    if (error) {
      return res.status(403).json(
        response({
          error: {
            type: "INVALID",
            reason: error.message,
          },
        }),
      );
    }

    return next();
  }
}

module.exports = {
  AuthApiKey,
  Validator,
};
