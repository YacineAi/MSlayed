const express = require("express");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const app = express();
const sharp = require('sharp');
sharp.cache(false);
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
        limit: 30,
        
        json: `{"manga_name":"${req.params.q}","sort_by_direction":"ASC","sort_by":"manga_id","manga_status":"All","genre_include_ids":""}`,
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

app.get('/cover/fit', async (req, res) => {
  try {
    const imageUrl = req.query.imageUrl;
    const width = 909;
    const height = 476;
    const blur = 6;
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });
    const inputBuffer = Buffer.from(response.data, 'binary');
    const blurredBuffer = await sharp(inputBuffer)
      .resize(width, height)
      .modulate({ brightness: 0.3 })
      .blur(blur)
      .toBuffer();

    const resizedBuffer = await sharp(inputBuffer)
      .resize({
        fit: sharp.fit.contain,
        height: height
    })
      .toBuffer();

    const outputBuffer = await sharp(blurredBuffer)
      .composite([{ input: resizedBuffer, gravity: 'center' }])
      .toBuffer();

    res.set('Content-Type', 'image/jpeg');
    res.send(outputBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while processing the image : ', error);
  }
});

/* -----< MLIK >----- */ 
app.get("/mello/search/:q", (req, res) => {
axios.get(`https://api.mangamello.com/v1/mangas/search?title=${req.params.q}&genres=0&lang=ar&per_page=21&page=1`, {
  headers: {
    'Accept': 'application/json',
  },
})
  .then(response => {
    res.json(response.data.data);
  })
  .catch(error => {
    console.error(error);
  });
});

app.get("/mello/manga/:id", (req, res) => {
axios.get(`https://api.mangamello.com/v1/mangas/${req.params.id}?relations=chapters,genres&rate=true`, {
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Accept': 'application/json',
  },
})
  .then(response => {
    res.json(response.data.data);
  })
  .catch(error => {
    console.error(error);
  });
});

app.get("/mello/chapter/:cid/:mid", (req, res) => {
  axios.get(`https://api.mangamello.com/v1/mangas/${req.params.mid}/chapters/${req.params.cid}?relations=chapterImages`, {
    headers: {
      'Accept': 'application/json',
    },
  })
  .then(response => {
    res.json(response.data.data);
  })
  .catch(error => {
    console.error(error);
  });
});

app.get("/mello/hot", (req, res) => {
  axios.get("https://api.mangamello.com/v1/mangas?dir=desc&sort_by=views", {
    headers: {
      'Accept': 'application/json',
    },
  })
  .then(response => {
    res.json(response.data.data);
  })
  .catch(error => {
    console.error(error);
  });
});

app.listen(3000, () => {
  console.log(`app listening on port 3000`);
});
