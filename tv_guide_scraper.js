const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const { title } = require('process');

const app = express();
const port = 5000;

const url = 'https://tv-guide-listings.co.uk/';
const SerieAurl = 'https://www.live-footballontv.com/live-italian-football-on-tv.html'



// Function to scrape data
async function scrapeData(channel) {
  try {
    const response = await axios.get(url);
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
      return { title: cell1Title, description: cell1Description, time: cell1Time, progress: progressTime};
    } else {
      console.log(`Failed to fetch the data. Status code: ${response.status}`);
      throw new Error('Failed to fetch data');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// Cache object to store scraped data
const cache = {};

// Function to scrape data
// async function scrapeData(channel) {
//   try {
//     if (cache[channel] && cache[channel].expiration > Date.now()) {
//       // If data is already in cache and not expired, return it
//       return cache[channel].data;
//     }

//     const response = await axios.get(url);
//     if (response.status === 200) {
//       const $ = cheerio.load(response.data);
//       const btSport1Element = $(channel);

//       // Extract data...
//       // Extract data for cell1 component
//       const cell1TitleElement = btSport1Element.find('.timeline-item.cell1 .title');
//       const cell1Title = cell1TitleElement.clone().children().remove().end().text().trim();
//       const cell1Description = cell1TitleElement.find('.sDesc').text().trim();
//       const cell1Time = (btSport1Element.find('.timeline-item.cell1 .time').text().trim() + " " + btSport1Element.find('.timeline-item.cell2 .time').text().trim()).slice(0, -1);
//       const progressTime = btSport1Element.find('.progress span').attr('style').slice(6, -2);
       
  
//       // Return the scraped data as an object
//       const scrapedData = { title: cell1Title, description: cell1Description, time: cell1Time, progress: progressTime };

     
//       // Store scraped data in cache with expiration time (e.g., 30 seconds from now)
//       cache[channel] = { data: scrapedData, expiration: Date.now() + 1 * 30 * 1000 };

//       return scrapedData;
//     } else {
//       console.log(`Failed to fetch the data. Status code: ${response.status}`);
//       throw new Error('Failed to fetch data');
//     }
//   } catch (error) {
//     console.error('Error fetching data:', error);
//     throw error;
//   }
// }





// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve the "views" folder for EJS files
app.set('views', path.join(__dirname, 'views'));

// ... (other imports and code
app.get('/', async (req, res) => {
  try {
    

    const promises = [ scrapeData('#tv-guide-bt-sport-1'), scrapeData('#tv-guide-bt-sport-2'), scrapeData('#tv-guide-bt-sport-3'), scrapeData('#tv-guide-sky-sports-premier-league'), scrapeData('#tv-guide-premier-sports-1'), scrapeData('#tv-guide-premier-sports-2'), scrapeData('#tv-guide-sky-sports-football'), scrapeData('#tv-guide-sky-sports-main-event'),scrapeData('#tv-guide-sky-sports-news') ]; 
    const [ TNTSports1, TNTSports2, TNTSports3, SkySportsEPL, PremierSports1, PremierSports2, SkySportsFootball, SkySportsMainEvent,SkySportsNews ] = await Promise.all(promises);

    
    // const scrapedData2 = await scrapeDataForBTSport2();
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
