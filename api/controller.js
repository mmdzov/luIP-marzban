const Model = require("./model");
const Validator = require("./validator");
const router = require("express").Router();

const validator = new Validator();
const model = new Model();

router.post("/token", validator.token, (req, res) => {
  const result = model.token();

  return res.json({ api_key: result });
});

module.exports = router;
