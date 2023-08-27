/** @format */

const express = require("express");
const app = express();
const port = 3000;

const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// const bodyParser = require("body-parser");

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

function unEscape(htmlStr) {
  htmlStr = htmlStr.replace(/&lt;/g, "<");
  htmlStr = htmlStr.replace(/&gt;/g, ">");
  htmlStr = htmlStr.replace(/&quot;/g, '"');
  htmlStr = htmlStr.replace(/&#39;/g, "'");
  htmlStr = htmlStr.replace(/&amp;/g, "&");
  return htmlStr;
}

app.get("/", async (req, res) => {
  let url = req.query.url;
  res.set("Content-Type", "text/html");

  if (url == "" || url == undefined || url == null) {
    res.send("<h1>Please pass a <strong>url</strong> in the query param </h1>");
  }

  try {
    const urlObject = new URL(url);

    if (urlObject.hostname.toLowerCase().includes("medium.com") == false) {
      res.send("Not a medium.com URL");
      return;
    }

    let finalData = "medium.com URL";

    // get the data from google web cache
    const response = await axios.get(
      `http://webcache.googleusercontent.com/search?q=cache:${url}&strip=0&vwsrc=1&&hl=en&lr=lang_en`
    );

    let data = response.data;
    const { document } = new JSDOM(data).window;

    const preTagContent = document.getElementsByTagName("pre");

    if (preTagContent.length == 0) {
      res.send("No data found.");
      return;
    }

    let textData = preTagContent[0].innerHTML;
    textData = unEscape(textData);

    // now remove the script tag
    textData = textData
      .replace(/<script[^>]*>(?:(?!<\/script>)[^])*<\/script>/g, "")
      .trim();

    finalData = textData;

    res.send(finalData);
    return;
  } catch (error) {
    console.log(error);
    // console.log(error.response?.status);

    res.send("<h1>Invalid URL or No Data found</h1>");
    return;
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;