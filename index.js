const express = require("express");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const app = express();
const sharp = require("sharp");
const ejs = require("ejs");
const os = require('os');
sharp.cache(false);

const headers = {
  'accept': 'application/json',
  'enc': 'No',
  'user-agent': 'okhttp/3.12.1'
};

function formatBytes(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

app.use(express.static("public"));

app.set("view engine", "ejs");


app.get("/", (req, res) => {
  const memoryUsage = process.memoryUsage();
  let uptimeInSeconds = process.uptime();

  let uptimeString = "";
  if (uptimeInSeconds < 60) {
    uptimeString = `${uptimeInSeconds.toFixed()} seconds`;
  } else if (uptimeInSeconds < 3600) {
    uptimeString = `${(uptimeInSeconds / 60).toFixed()} minutes`;
  } else if (uptimeInSeconds < 86400) {
    uptimeString = `${(uptimeInSeconds / 3600).toFixed()} hours`;
  } else {
    uptimeString = `${(uptimeInSeconds / 86400).toFixed()} days`;
  }

  const osInfo = {
    totalMemoryMB: (os.totalmem() / (1024 * 1024)).toFixed(2),
    freeMemoryMB: (os.freemem() / (1024 * 1024)).toFixed(2),
    cpus: os.cpus(),
  };

  res.render("index", { memoryUsage, uptimeString, formatBytes, osInfo });
});




app.get("/search/:q", async (req, res) => {
  try {
    const response = await axios.get(
      "https://mangaslayer.com/manga-app-api/get-all-published-manga",
      {
        params: {
          list_type: "filter",
          limit: 30,
          json: `{"manga_name":"${req.params.q}","sort_by_direction":"ASC","sort_by":"manga_id","manga_status":"All","genre_include_ids":""}`,
        },
        headers: headers,
      }
    );

    res.json(JSON.parse(response.data.result));
  } catch (error) {
    console.error(error.response.status);
    res.status(500).send("An error occurred while fetching manga data.");
  }
});

app.get("/manga/:id", async (req, res) => {
  try {
    const response = await axios.get(
      "https://mangaslayer.com/manga-app-api/get-published-manga-details-info",
      {
        params: {
          manga_id: req.params.id,
          chapters: "Yes",
        },
        headers: headers,
      }
    );

    res.json(JSON.parse(response.data.result));
  } catch (error) {
    console.error(error.response.status);
    res.status(500).send("An error occurred while fetching manga details.");
  }
});

app.get("/details/:id", async (req, res) => {
  try {
    const response = await axios.get(
      "https://mangaslayer.com/manga-app-api/get-published-manga-details-info",
      {
        params: {
          manga_id: req.params.id,
          chapters: "No",
        },
        headers: headers,
      }
    );

    res.json(JSON.parse(response.data.result));
  } catch (error) {
    console.error(error.response.status);
    res.status(500).send("An error occurred while fetching manga details.");
  }
});

app.get("/chapter/:cid", async (req, res) => {
  try {
    const response = await axios.get(
      "https://mangaslayer.com/manga-app-api/get-published-manga-chapter-pages",
      {
        params: {
          manga_id: 1234,
          chapter_id: req.params.cid,
          device_id: uuidv4(),
        },
        headers: headers,
      }
    );

    res.json(JSON.parse(response.data.result));
  } catch (error) {
    console.error(error.response.status);
    res.status(500).send("An error occurred while fetching chapter pages.");
  }
});

app.get("/cover/fit", async (req, res) => {
  try {
    const response = await axios.get(req.query.imageUrl, {
      responseType: "arraybuffer",
    });

    const inputBuffer = Buffer.from(response.data, "binary");
    const width = 909;
    const height = 476;
    const blur = 6;

    const blurredBuffer = await sharp(inputBuffer)
      .resize(width, height)
      .modulate({ brightness: 0.3 })
      .blur(blur)
      .toBuffer();

    const resizedBuffer = await sharp(inputBuffer)
      .resize({
        fit: sharp.fit.contain,
        height: height,
      })
      .toBuffer();

    const outputBuffer = await sharp(blurredBuffer)
      .composite([{ input: resizedBuffer, gravity: "center" }])
      .toBuffer();

    res.set("Content-Type", "image/jpeg");
    res.send(outputBuffer);
  } catch (error) {
    console.error(error.response.status);
    res.status(500).send("An error occurred while processing the image.");
  }
});

/* -----< MLIK >----- */
app.get("/mello/search/:q", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.mangamello.com/v1/mangas/search?title=${req.params.q}&genres=0&lang=ar&per_page=21&page=1`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    res.json(response.data.data);
  } catch (error) {
    console.error(error.response.status);
    res.status(500).send("An error occurred while fetching manga data.");
  }
});

app.get("/mello/manga/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.mangamello.com/v1/mangas/${req.params.id}?relations=chapters,genres&rate=true`,
      {
        headers: {
          Authorization: "Bearer YOUR_ACCESS_TOKEN",
          Accept: "application/json",
        },
      }
    );

    res.json(response.data.data);
  } catch (error) {
    console.error(error.response.status);
    res.status(500).send("An error occurred while fetching manga details.");
  }
});

app.get("/mello/chapter/:cid/:mid", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.mangamello.com/v1/mangas/${req.params.mid}/chapters/${req.params.cid}?relations=chapterImages`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    res.json(response.data.data);
  } catch (error) {
    console.error(error.response.status);
    res.status(500).send("An error occurred while fetching chapter details.");
  }
});

app.get("/mello/hot", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.mangamello.com/v1/mangas?dir=desc&sort_by=views",
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    res.json(response.data.data);
  } catch (error) {
    console.error(error.response.status);
    res.status(500).send("An error occurred while fetching hot manga data.");
  }
});

app.listen(3000, () => {
  console.log("App listening on port 3000");
});