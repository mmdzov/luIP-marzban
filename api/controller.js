const { AuthApiKey, Validator } = require("./middlewares");
const Model = require("./model");
const router = require("express").Router();

const validator = new Validator();
const model = new Model();

// Send your api username and password in json format to generate api_key
router.post("/token", validator.token, (req, res) => {
  const result = model.token();

  return res.json(result);
});

// Send your proxy email and limit data in json format to be applied
router.post("/add", AuthApiKey, validator.add, (req, res) => {
  const result = model.add(req.body);

  return res.json(result);
});

// Send your proxy email and limit data in json format to be updated
router.post("/update", AuthApiKey, validator.add, (req, res) => {
  const result = model.update(req.body);

  return res.json(result);
});

// Send your proxy email data to be removed
router.get("/delete/:email", AuthApiKey, (req, res) => {
  const result = model.delete(req.params);

  return res.json(result);
});

// Send your proxy email data to get the user
router.get("/user/:email", AuthApiKey, (req, res) => {
  const result = model.getUser(req.params);

  return res.json(result);
});

// Clear users.csv file
router.get("/clear", AuthApiKey, (req, res) => {
  const result = model.clear();

  return res.json(result);
});

module.exports = router;
