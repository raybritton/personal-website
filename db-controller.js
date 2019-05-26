const sqlite = require('sqlite3');
const util = require("util");

const db = new sqlite.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Could not connect to database');
    console.error(err);
  }
});

db.exec("CREATE TABLE IF NOT EXISTS articles (id TEXT PRIMARY KEY, image BLOB, title TEXT, body TEXT, created TEXT, published INTEGER)");

if (DB_FILE === ":memory:") {
  db.run("INSERT INTO articles (id, image, title, body, created, published) VALUES (?, ?, ?, ?, ?, ?)", [
    "hex-live-wallpaper", "hex-live-wallpaper-jpg", "Hex Live Wallpaper", "After seeing a static image of blue hexagons I really wanted an animated version but none of the live wallpapers on the Play Store were close enough so I created this and I've used on all my phones since. I originally had quite a bit of trouble with the co-ordinate system until I read <i>the</i> article on hexagon co-ords: <a href=\"https://www.redblobgames.com/grids/hexagons\">https://www.redblobgames.com/grids/hexagons</a>. <br><br>The app is available on the store for free at <a href=\"https://play.google.com/store/apps/details?id=com.moorhenapps.bluehex\">https://play.google.com/store/apps/details?id=com.moorhenapps.bluehex</a>", new Date().toString(), 1
  ], function (err) {
    if (err) console.error(err);
  });
  db.run("INSERT INTO articles (id, image, title, body, created, published) VALUES (?, ?, ?, ?, ?, ?)", [
    "hex-live-wallpaper2", "hex-live-wallpaper-jpg", "Hex Live Wallpaper", "After seeing a static image of blue hexagons I really wanted an animated version but none of the live wallpapers on the Play Store were close enough so I created this and I've used on all my phones since. I originally had quite a bit of trouble with the co-ordinate system until I read <i>the</i> article on hexagon co-ords: <a href=\"https://www.redblobgames.com/grids/hexagons\">https://www.redblobgames.com/grids/hexagons</a>. <br><br>The app is available on the store for free at <a href=\"https://play.google.com/store/apps/details?id=com.moorhenapps.bluehex\">https://play.google.com/store/apps/details?id=com.moorhenapps.bluehex</a>", new Date().toString(), 1
  ], function (err) {
    if (err) console.error(err);
  });
}

var exports = module.exports = {};

exports.getPublishedArticles = function(callback) {
  db.all("SELECT id, title, image, created FROM articles WHERE published = 1", (err, rows) => {
    if (err) {
      console.error(err);
      callback({
        error: true,
        err: err
      });
    } else {
      callback(rows.sort((a,b) => (a.created < b.created) ? 1 : ((b.created < a.created) ? -1 : 0)));
    }
  });
};

exports.getArticles = function(callback) {
  db.all("SELECT id, title, published FROM articles", (err, rows) => {
    if (err) {
      console.error(err);
      callback({
        error: true,
        err: err
      });
    } else {
      callback(rows.sort((a,b) => (a.created < b.created) ? 1 : ((b.created < a.created) ? -1 : 0)));
    }
  });
};

exports.getArticle = function(id, callback) {
  db.get("SELECT * FROM articles WHERE id = ?", id, (err, row) => {
    if (err || row === undefined) {
      console.error(err || "no article");
      callback({
        error: true,
        err: (row === undefined) ? {msg: "no results"} : err
      });
    } else {
      callback(row);
    }
  });
}

exports.setPublished = function(id, published, callback) {
  db.run("UPDATE articles SET published = ? WHERE id = ?", [published ? 1 : 0, id], function (err) {
    if (err) {
      console.error(err);
      callback({
        error: true,
        err: err
      });
    } else {
      callback(undefined);
    }
  });
}

exports.addArticle = function(article, callback) {
  db.run("INSERT INTO articles (id, image, title, body, created) VALUES (?, ?, ?, ?, ?)", [
    article.id, article.image, article.title, article.body, new Date().toString()
  ], function (err) {
    console.error(err);
    if (err) {
      callback({
        error: true,
        err: err
      });
    } else {
      callback(undefined);
    }
  });
}

exports.editArticle = function(article, callback) {
  db.run("UPDATE articles SET image=?, title=?, body=? WHERE id = ?", [
    article.image, article.title, article.body, article.id
  ], function (err) {
    console.error(err);
    if (err) {
      callback({
        error: true,
        err: err
      });
    } else {
      callback(undefined);
    }
  });
}