const fetch = require("./fetch");
const cheerio = require("cheerio");

async function stopwordInProperty(property, stopwords) {
  // search summary
  if (stopwords.some((s) => property["summary"].toLowerCase().includes(s))) {
    return true;
  }

  // search display prices
  if (
    stopwords.some((s) => {
      const displayPrices = property["price"]["displayPrices"];
      for (let j = 0; j < displayPrices.length; j++) {
        const displayPrice = displayPrices[j]["displayPrice"];
        const displayPriceQualifier = displayPrices[j]["displayPriceQualifier"];

        if (displayPrice.toLowerCase().includes(s)) return true;
        if (displayPriceQualifier.toLowerCase().includes(s)) return true;
      }
      return false;
    })
  ) {
    return true;
  }

  let foundOnPage = false;
  let html;

  try {
    html = await fetch(
      "https://www.rightmove.co.uk" + property["propertyUrl"],
      { type: "text" }
    );
  } catch (err) {
    log.warn("stopword check aborted");
    return false;
  }

  const $ = cheerio.load(html);

  // search key features
  $("div.key-features > ul > li").each(function () {
    const keyFeature = $(this).text().toLowerCase();
    if (stopwords.some((s) => keyFeature.includes(s))) {
      foundOnPage = true;
    }
  });

  // search description
  const description = $('[itemprop="description"]').text();
  if (stopwords.some((s) => description.toLowerCase().includes(s))) {
    foundOnPage = true;
  }

  if (foundOnPage) {
    return true;
  }

  return false;
}

// const Promise = require("bluebird");
// const mockResponse = require("../responses/properties.json");

// const properties = mockResponse["properties"];

// properties.sort((a, b) =>
//   a["price"]["amount"] <= b["price"]["amount"] ? -1 : 1
// );

// Promise.mapSeries(properties, async (p) => {
//   const bool = await stopwordInProperty(
//     p,
//     [
//       "Shared ownership",
//       "share",
//       "ownership",
//       "Shared equity",
//       "Auction",
//       "Refurbishment",
//       "RENT TO BUY",
//       "Minimum Age",
//       "RETIREMENT APARTMENT",
//       "Residents' lounge",
//       "shared equity scheme",
//       "equity scheme",
//       "shared",
//       "Public notice",
//       "POA",
//       "Part",
//       "Part buy, part rent",
//       "lodge",
//       "chalet",
//       "plot",
//       "caravan",
//     ].map((i) => i.toLowerCase())
//   );

//   console.log(mockResponse["properties"].indexOf(p), bool, p["displayAddress"]);
// });

module.exports = { stopwordInProperty };
