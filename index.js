const express = require("express");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const app = express();
const port = process.env.PORT || 3000;
const headers = {
  accept: "application/json",
  "accept-encoding": "gzip",
  "client-id": "manga-android-app2",
  "client-secret": "9befba1243cc14c90e2f1d6da2c5cf9b252bfcbh",
  connection: "Keep-Alive",
  enc: "No",
  host: "mangaslayer.com",
  "user-agent": "okhttp/3.12.1",
};

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.get("/search/:q", (req, res) => {
  axios.get("https://mangaslayer.com/manga-app-api/get-all-published-manga", {
      params: {
        list_type: "filter",
        limit: 10,
        json: `{"manga_name":"${req.params.q}","sort_by_direction":"DESC","sort_by":"manga_id","manga_status":"All","genre_include_ids":""}`,
      },
      headers: headers,
    })
    .then((response) => {
      res.json(JSON.parse(response.data.result));
    })
    .catch((error) => {
      console.error(error);
    });
});

app.get("/manga/:id", (req, res) => {
  axios.get("https://mangaslayer.com/manga-app-api/get-published-manga-details-info", {
      params: {
        manga_id: req.params.id,
        chapters: "Yes",
      },
      headers: headers,
    })
    .then((response) => {
      res.json(JSON.parse(response.data.result));
    })
    .catch((error) => {
      console.error(error);
    });
});

app.get("/details/:id", (req, res) => {
  axios.get("https://mangaslayer.com/manga-app-api/get-published-manga-details-info", {
      params: {
        manga_id: req.params.id,
        chapters: "No",
      },
      headers: headers,
    })
    .then((response) => {
      res.json(JSON.parse(response.data.result));
    })
    .catch((error) => {
      console.error(error);
    });
});
app.get("/chapter/:cid", (req, res) => {
  axios.get("https://mangaslayer.com/manga-app-api/get-published-manga-chapter-pages", {
      params: {
        manga_id: 1234,
        chapter_id: req.params.cid,
        device_id: uuidv4(),
      },
      headers: headers,
    })
    .then((response) => {
      res.json(JSON.parse(response.data.result));
    })
    .catch((error) => {
      console.error(error);
    });
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
