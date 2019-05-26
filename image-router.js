const fs = require('fs');
const router = require("express").Router();

router.get("/", (req, res, next) => {
  if (req.query.apikey != API_KEY) return next();
  var files = fs.readdirSync(IMAGE_DIR)
      .filter((file) => file.endsWith("-png") || file.endsWith("-jpg") || file.endsWith("-jpg") );

  res.send(files);
});

router.post("/", (req, res, next) => {
  if (req.query.apikey != API_KEY) return next();
  var filename = req.query.filename;
  var file = req.files.image;
  fs.writeFileSync(IMAGE_DIR + "/" + filename, file.data);
  res.status(200).send({});
})

module.exports = router;