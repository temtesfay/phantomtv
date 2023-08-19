const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const { title } = require('process');

const app = express();
const port = 4000;

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

async function scrapeSerieA() {
  try {
    const response = await axios.get(SerieAurl);
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

app.get('/seriea', async (req, res) => {
  try {
    const response = await axios.get(SerieAurl);
    const $ = cheerio.load(response.data);

    const fixtures = [];
    let currentDate = ''; // Initialize the current date

    $('.fixture').each((index, element) => {
      const dateDivAbove = $(element).prev('.fixture-date');
      const dateDivBelow = $(element).next('.fixture-date');

      if (dateDivAbove.length) {
        currentDate = dateDivAbove.text().trim(); // Update the current date
      } else if (dateDivBelow.length) {
        currentDate = ''; // Reset the current date if no date div is above
      }

      const time = $(element).find('.fixture__time').text().trim();
      const teamsText = $(element).find('.fixture__teams').text().trim();
      const [homeTeam, awayTeam] = teamsText.split(' v ');

      const competition = $(element).find('.fixture__competition').text().trim();
      const channel = $(element).find('.channel-pill').text().trim();

      if(competition === "Serie A") {
        fixtures.push({
          date: currentDate,
          time,
          teams: { home: homeTeam, away: awayTeam },
          competition,
          channel
        });
      }
    });
    res.json(fixtures);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
}); 

app.get('/videos', async (req, res) => {
  try {
    const response = await axios.get('https://www.youtube.com/@fuboTVOfficial/videos');
    console.log(response)
    const $ = cheerio.load(response.data);

    const videos = [];

    $('a#video-title-link').each((index, element) => {
      const videoLink = $(element).attr('href');
      const videoTitle = $(element).find('yt-formatted-string#video-title').text();

      console.log(`Video ${index + 1}: Link: ${videoLink}, Title: ${videoTitle}`);

      videos.push({
        link: `https://www.youtube.com${videoLink}`,
        title: videoTitle,
        gay:'gay niggas'
      });
    });

    console.log(videos); // Log the entire videos array
    res.json(videos);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});



// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve the "views" folder for EJS files
app.set('views', path.join(__dirname, 'views'));

// ... (other imports and code
app.get('/', async (req, res) => {
  try {
    const TNTSports1 = await scrapeData('#tv-guide-bt-sport-1');
    const TNTSports2 = await scrapeData('#tv-guide-bt-sport-2');
    const TNTSports3 = await scrapeData('#tv-guide-bt-sport-3');
    const SkySportsEPL = await scrapeData('#tv-guide-sky-sports-premier-league');
    const PremierSports1 = await scrapeData('#tv-guide-premier-sports-1');
    const PremierSports2 = await scrapeData('#tv-guide-premier-sports-2');
    const SkySportsFootball = await scrapeData('#tv-guide-sky-sports-football')
    const SkySportsMainEvent = await scrapeData('#tv-guide-sky-sports-main-event');
    const SkySportsNews = await scrapeData('#tv-guide-sky-sports-news');




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
