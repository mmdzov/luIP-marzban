const Joi = require("joi");

class Validator {
  token(req, res, next) {
    /**
     * @type {ApiSetTokenType}
     */
    const data = req.body;

    console.log(data);

    const schema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
    });

    const { error } = schema.validate(data);

    if (error) return next(error.message);

    if (process.env.API_LOGIN !== `${data.username}:${data.password}`)
      return next("Username or password doesn't match");

    return next();
  }
}

module.exports = Validator;
