const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const { HttpsProxyAgent } = require('https-proxy-agent');


const fs = require('fs');
const xml2js = require('xml2js');
const cors = require('cors');




const app = express();
const port = 80;

const url = 'https://tv-guide-listings.co.uk/';
const proxyUrl = "http://qxeslhzw-rotate:gcikoi18z3qy@p.webshare.io:80/";
const xmlFilePath = 'skysportseplxml'; // Replace with the path to your XML file


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

app.use(cors({origin:true}))


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



function getCurrentTimeFormatted() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-indexed, so add 1 and pad with 0.
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  const timeZoneOffset = now.getTimezoneOffset(); // Get the time zone offset in minutes.

  // Convert the time zone offset to the desired format (+/-HHMM).
  const offsetHours = Math.abs(Math.floor(timeZoneOffset / 60));
  const offsetMinutes = Math.abs(timeZoneOffset % 60);
  const offsetSign = timeZoneOffset < 0 ? '-' : '+';
  const offsetFormatted = `${offsetSign}${String(offsetHours).padStart(2, '0')}${String(offsetMinutes).padStart(2, '0')}`;

  // Create the formatted date string.
  const formattedTime = `${year}${month}${day}${hours}${minutes}${seconds} ${offsetFormatted}`;

  return formattedTime;
}

// Call the function to get the current time.
const currentTime = getCurrentTimeFormatted();
// console.log(currentTime);


// Read the XML data from the file.
fs.readFile(xmlFilePath, 'utf-8', (err, data) => {
  if (err) {
    console.error('Error reading the XML file:', err);
  } else {
    // Data contains the contents of the XML file as a string.
    const xmlData = data;

    // Now you can use Cheerio to parse the XML data.
    const cheerio = require('cheerio');
    const $ = cheerio.load(xmlData, { xmlMode: true });
    
     // Select all 'programme' elements and iterate through them.
$('programme').each((index, element) => {
  const program = $(element);

  // Extract channel information from the 'channel' element.
  const channel = $('channel').attr('id');

  // Extract title from the 'title' element.
  const title = $('title', program).text();

  // Extract start and end times from the 'start' and 'stop' attributes.
  const start = program.attr('start');
  const end = program.attr('stop');

 // Extract description from the 'desc' element.
 const desc = $('desc', program).text();
  
  const programs = [{channel,title,desc,start,end}]
  // console.log(programs)

  // console.log('Channel:', channel);
  // console.log('Title:', title);
  // console.log('Desc:', desc);
  // console.log('Start:', start);
  // console.log('End:', end);
  // console.log('---');

  // Example list of program objects with start and stop times

const currentUtc = "20231020083000 +0200";

let currentProgram = null;

for (const program of programs) {
  const startTime = program.start;
  const endTime = program.stop;

  if (currentUtc >= startTime && currentUtc <= endTime) {
    currentProgram = program;
    break; // Found the current program, no need to continue searching
  }
}

if (currentProgram) {
  console.log('Currently playing program:');
  console.log('Title:', currentProgram.title);
  console.log('Start Time:', currentProgram.start);
  console.log('End Time:', currentProgram.stop);
} else {
  // console.log('No program is currently playing.');
}

  });
  }
});

// Replace 'YOUR_BEARER_TOKEN' with your actual bearer token
const bearerToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZGNhZDVkMjE3NzhlNTRlMjVmMjU0ODIwY2Q2MDlkZjg3MjE3OTI3MzQyOTRhNjliYmE3YTM4NmNiZmVjMTE0Mzc4MWFiNmM4OWUwNGJiYzUiLCJpYXQiOjE2OTc4Njk1NzMsIm5iZiI6MTY5Nzg2OTU3MywiZXhwIjoxNzI5NDkxOTczLCJzdWIiOiIxNDA4NzEiLCJzY29wZXMiOltdfQ.pmdv5PrU6Q1O0oX4cTJCMqADj2hUIcjsY6Q8mSgFG8BUXVXr0hMmgsySfM06xHUfJVz7vaSyBjh0t9jo06dkclreBu75jV4WTe2PYOMksyj62kEg4_7udT7s2aUACKZq17MpqgGx1OYuYAjE1jWkcts3JgZdo5fPZjWyRbEZA9RfZf9Ry2hcTKwVrPz3YPpwP8_liGp5sFtq5CdSEEBDcFKW1TnJEuT1JHL0d9x_BwFqeQP2D30RhR0AeRtq1EGqEhYGWY-FRPFvFICmEGuONsf47UmJz1T-D1hvO7VTDZjRCymc-PtM23mCFbH9emhRXEJMw2n74V8rJ2mSHTsePwyfXQj5kdHO6lGU-JrgOJmGLRuvlLTtxqT8lddCjL6oFwSgc1qfWmu8xerbn9ug4ttLVGWGWwtIp3DvrSHy_HpDse3ZyjXhqrE86HwpYHmCQxf5sf1akqxi1lq-2yc3v7h-QjxyuzB6ckX5uG6mJzUNPZmqBasKVQaVXgSabvtW2lc9iqiTImr8ni2x0ehX32j_gL5UziIafvKqxbz2HVWopKH56xGK8jDMU-N6AWNCQ5e4H9QmDFRJ6YY-qLy7EqrTvB5GXNXK0y_abI2C8W3fERnS6OTbzdBMMk1qsAbUU_j9hS4WYUlJUfwmYOZCnSyUxND3Py03qBmqJxaJQnw';




// Create an endpoint that proxies the external API  
// beINSports1En.qa
// beINSports2En.qa
// SkySportsPremiereLeague.uk 
// SkySportsMainEvent.uk
// SkySportsFootball.uk
// SkySportsNews.uk
// ViaplaySports1.uk
// ViaplaySports2.uk


// Set the time zone to UK time (GMT/UTC)
const options = { timeZone: 'Europe/London' };
const currentDate = new Date().toLocaleString('en-GB', options);


const day = currentDate.slice(0,2)
const month = currentDate.slice(3,5)
const year = currentDate.slice(6,10)

// Create the formatted date string
const formattedDate = `${year}-${month}-${day}`;

app.get('/api/programmes', async (req, res) => {
  try {
    const response = await fetch(`https://epg.best/api/programmes?date=${formattedDate}&channels[]=TNTSport1.uk&channels[]=TNTSport2.uk&channels[]=TNTSport3.uk&channels[]=beINSports1En.qa&channels[]=beINSports2En.qa&channels[]=SkySportsPremiereLeague.uk&channels[]=SkySportsMainEvent.uk&channels[]=SkySportsFootball.uk&channels[]=SkySportsNews.uk&channels[]=ViaplaySports1.uk&channels[]=ViaplaySports2.uk`, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      res.json(data);
    } else {
      console.error('API Error:', response.status, await response.text()); // Log error details
      res.status(response.status).json({ error: 'Failed to fetch data from the external API' });
    }
  } catch (error) {
    console.error('Request Error:', error); // Log error details
    res.status(500).json({ error: 'Failed to fetch data from the external API' });
  }
});




// Serve static files (e.g., CSS, JS) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

