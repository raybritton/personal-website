require('dotenv').config();

global.IMAGE_DIR = process.env.IMAGE_DIR;
global.API_KEY = process.env.API_KEY;
global.DB_FILE = process.env.DB_FILE || ":memory:";
global.SERVER_HOST = process.env.HOSTNAME || 'localhost';
global.SERVER_PORT = process.env.PORT || '3001';
global.BASIC_AUTH_USERNAME = process.env.AUTH_USER;
global.BASIC_AUTH_PASSWORD = process.env.AUTH_PASS;
global.IP_WHITELIST = (process.env.WHITELIST || "127.0.0.1").split("|");

const bodyParser = require('body-parser');
const express = require('express');
const sprintf = require('sprintf-js').sprintf;
const util = require('util');
const app = express();
const fileupload = require("express-fileupload");
const hbs = require('express-hbs');
const db = require('./db-controller.js');

global.BASIC_AUTH_OPTIONS = {
  users: {},
  challenge: true
};

BASIC_AUTH_OPTIONS.users[BASIC_AUTH_USERNAME] = BASIC_AUTH_PASSWORD;

app.engine('hbs', hbs.express4({
  partialsDir: __dirname + '/views/partials',
  defaultLayout: __dirname + '/views/layout.hbs'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(fileupload({
  limits: { fileSize: 3 * 1024 * 1024 },
  abortOnLimit: true
}));

global.makeHbsConfig = function(title, description) {
  return {
    title: title,
    description: description,
    debug: (DB_FILE === ":memory:") ? "IN MEMORY" : ""
  };
}

app.get("/articleimage/:id", (req, res) => {
  res.sendFile(IMAGE_DIR + "/" + req.params.id);
});

app.get("/", (req, res) => {
  var config = makeHbsConfig("Ray Britton", "Articles and portfolio for Ray Britton - Android Developer");
  db.getPublishedArticles(function (result) {
    if (result.error) {
      console.error(result.err);
      res.render(error);
    } else {
      config.article = result.map((row) => {
        let created = new Date(row.created);
        return {
          id: row.id,
          title: row.title,
          image: row.image,
          date: `${created.getDate()} ${monthToStr(created.getMonth())} ${created.getFullYear()}`
        };
      });
      res.render("home", config);
    }
  });
});

app.use("/article/:articleId", (req, res, next) => {
  var articleId = req.params.articleId;
  db.getArticle(articleId, function (result) {
    if (result.error) {
      console.error(result.err);
      res.render("error");
    } else {
      if (result.published != 1) return next();
      var config = makeHbsConfig(result.title, result.body.substr(0, 300).replace(/<\/{0,1}[a-z]+>/gi, "").substr(0, 100));
      config.article_title = result.title;
      config.article_body = result.body;
      config.article_image = result.image;
      res.render("article", config);
    }
  });
});

app.use("/admin", require("./article-router.js")(db).router);
app.use("/articleimages", require("./image-router.js"));

app.get("/alive", (req, res) => {
  res.sendStatus(200);
});

app.use(function(err, req, res, next) {
  if (res.headersSent) {
      return next(err)
  }
  if (err.status == 404) {
    res.render("error")
  } else {
    if (SERVER_PORT == 3001) {
      res.status(err.status || 500).send({'error': util.inspect(err)});
    } else {
      res.sendStatus(err.status || 500);
    }
  }
});

app.listen(SERVER_PORT, SERVER_HOST);

console.log(sprintf('New website started at %s listening on %s:%s', new Date().toISOString(), SERVER_HOST, SERVER_PORT));

function monthToStr(month) {
  switch (month) {
    case 1: return "Jan"
    case 2: return "Feb"
    case 3: return "Mar"
    case 4: return "Apr"
    case 5: return "May"
    case 6: return "Jun"
    case 7: return "Jul"
    case 8: return "Aug"
    case 9: return "Sep"
    case 10: return "Oct"
    case 11: return "Nov"
    case 12: return "Dec"
  }
}