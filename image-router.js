const fs = require('fs');
const router = require("express").Router();

router.get("/", (req, res, next) => {
  if (req.query.apikey != API_KEY) return next();
  fs.readdir(IMAGE_DIR, function (err, files) {
    if (err) {
      console.error(err);
      next();
      return;
    }
    var files = files.filter((file) => file.endsWith("-png") || file.endsWith("-jpg") || file.endsWith("-jpeg") );
    res.send(files);
  });
});

router.post("/", (req, res, next) => {
  if (req.query.apikey != API_KEY) return next();
  var filename = req.query.filename;
  var file = req.files.image;
  fs.writeFileSync(IMAGE_DIR + "/" + filename, file.data);
  res.status(200).send({});
})

module.exports = router;