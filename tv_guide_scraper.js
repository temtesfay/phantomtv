const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const { title } = require('process');
const { HttpsProxyAgent } = require('https-proxy-agent');
const request = require('request');




const app = express();
const port = 80;

const url = 'https://tv-guide-listings.co.uk/';
const proxyUrl = "http://qxeslhzw-rotate:gcikoi18z3qy@p.webshare.io:80/";



const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/100.0',
  'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:12.0) Gecko/20100101 Firefox/12.0',
  'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)',
  'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.52 Safari/536.5',
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:53.0) Gecko/20100101 Firefox/53.0",
"Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.0; Trident/5.0; Trident/5.0)",
"Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0; MDDCJS)",
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393",
"Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)"

  // Add more user agent strings as needed
];

// Function to generate a random user agent
function getRandomUserAgent() {
  const randomIndex = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomIndex];
}


const agent = new HttpsProxyAgent(proxyUrl);
// Function to scrape data
async function scrapeData(channel) {
  try {
    const headers = {
      'User-Agent': getRandomUserAgent(),
      'Accept': 'text/html, image/avif, image/webp, image/apng, image/svg+xml, */*;q=0.8',
      'Accept-Language': 'en-US, en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Site': 'none',
    };

    const response = await axios.get(url, {
      headers,
      httpsAgent: agent,
      timeout: 10000,
    });

    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const btSport1Element = $(channel);

      // Extract data for cell1 component
      const cell1TitleElement = btSport1Element.find('.timeline-item.cell1 .title');
      const cell1Title = cell1TitleElement.clone().children().remove().end().text().trim();
      const cell1Description = cell1TitleElement.find('.sDesc').text().trim();
      const cell1Time = (btSport1Element.find('.timeline-item.cell1 .time').text().trim() + " " + btSport1Element.find('.timeline-item.cell2 .time').text().trim()).slice(0, -1);
      const progressTime = btSport1Element.find('.progress span').attr('style').slice(6, -2);

      // Return the scraped data as an object
      return { title: cell1Title, description: cell1Description, time: cell1Time, progress: progressTime };
    } else {
      console.log(`Failed to fetch the data. Status code: ${response.status}`);
      throw new Error('Failed to fetch data');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}




  
  


// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve the "views" folder for EJS files
app.set('views', path.join(__dirname, 'views'));

// ... (other imports and code
app.get('/', async (req, res) => {
  try {


    const promises = [ scrapeData('#tv-guide-bt-sport-1'), scrapeData('#tv-guide-bt-sport-2'), scrapeData('#tv-guide-bt-sport-3'), scrapeData('#tv-guide-sky-sports-premier-league'), scrapeData('#tv-guide-premier-sports-1'), scrapeData('#tv-guide-premier-sports-2'), scrapeData('#tv-guide-sky-sports-football'), scrapeData('#tv-guide-sky-sports-main-event'),scrapeData('#tv-guide-sky-sports-news') ]; 
    const [ TNTSports1, TNTSports2, TNTSports3, SkySportsEPL, PremierSports1, PremierSports2, SkySportsFootball, SkySportsMainEvent,SkySportsNews ] = await Promise.all(promises);

    res.render('index', { TNTSports1 , TNTSports2,TNTSports3,SkySportsEPL,SkySportsFootball,
    PremierSports1,PremierSports2,SkySportsFootball,SkySportsMainEvent,SkySportsNews});
  } catch (error) {
    console.error('Failed to scrape data:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Serve static files (e.g., CSS, JS) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

