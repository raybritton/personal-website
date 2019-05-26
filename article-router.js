module.exports = function (db) {
  const module = {};

  const util = require("util");
  module.router = require("express").Router();
  const basicAuth = require("express-basic-auth");

  module.router.post("/new", basicAuth(BASIC_AUTH_OPTIONS), (req, res, next) => {
    if (!IP_WHITELIST.includes(req.ip)) return next();
    if (req.query.apikey != API_KEY) return next();
    var article = req.body;
    db.addArticle(article, function(err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send({});
      }
    });
  });

  module.router.get("/articles", basicAuth(BASIC_AUTH_OPTIONS), (req, res, next) => {
    if (!IP_WHITELIST.includes(req.ip)) return next();
    if (req.query.apikey != API_KEY) return next();
    var config = makeHbsConfig("Articles", "");
    db.getArticles(function (result) {
      if (result.error) {
        console.error(result.err);
        res.render(error);
      } else {
        config.article = result.map((row) => {
          return {
            id: row.id,
            title: row.title,
            published: (row.published == 1)
          };
        });
        config.apikey = API_KEY;
        res.render("articles", config);
      }
    });
  });

  module.router.post("/:articleid", basicAuth(BASIC_AUTH_OPTIONS), (req, res, next) => {
    if (!IP_WHITELIST.includes(req.ip)) return next();
    if (req.query.apikey != API_KEY) return next();
    var article = req.body;
    db.editArticle(article, function(err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send({});
      }
    });
  });

  module.router.get("/:articleid", basicAuth(BASIC_AUTH_OPTIONS), (req, res, next) => {
    if (req.query.action && req.query.apikey == API_KEY && IP_WHITELIST.includes(req.ip)) {
      switch (req.query.action) {
        case "view": 
          showArticle(req.params.articleid, res, next, true);
          break;
        case "edit":
          showEditor(res, req.params.articleid);
          break;
        case "publish":
          publish(res, req.params.articleid);
          break;
        case "unpublish":
          unpublish(res, req.params.articleid);
          break;
      }
    } else if (req.params.articleid == "new" && req.query.apikey == API_KEY && IP_WHITELIST.includes(req.ip)) {
      showEditor(res);
    } else {
      showArticle(req.params.articleid, res, next, false);
    }
  });

  function showEditor(res, articleId) {
    var config = makeHbsConfig("Editor", "Edit an article");
    config.apikey = API_KEY;
    if (articleId) {
      db.getArticle(articleId, function (result) {
        if (result.error) {
          console.error(result.err);
          res.render("error");
        } else {
          config.article_title = result.title;
          config.article_body = result.body;
          config.article_image = result.image;
          config.article_id = result.id;
          config.article_published = result.published;
          res.render("editor", config);
        }
      });
    } else {
      res.render("editor", config);
    }
  }

  function publish(res, articleId) {
    db.setPublished(articleId, true, function(err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send({});
      }
    });
  }

  function unpublish(res, articleId) {
    db.setPublished(articleId, false, function(err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send({});
      }
    });
  }

  function showArticle(articleId, res, next) {
    db.getArticle(articleId, function (result) {
      if (result.error) {
        console.error(result.err);
        res.render("error");
      } else {
        var config = makeHbsConfig(result.title, result.body.substr(0, 300).replace(/<\/{0,1}[a-z]+>/gi, "").substr(0, 100));
        config.article_title = result.title;
        config.article_body = result.body;
        config.article_image = result.image;
        res.render("article", config);
      }
    });
  }

  return module;
}

