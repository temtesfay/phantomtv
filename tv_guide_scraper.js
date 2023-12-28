const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

var email = 'temtesfay1234@gmail.com';
var password = 'tem123';

var userPass = '';
var userEmail = '';



const app = express();
const port = 80;

app.use(bodyParser.urlencoded({ extended: true }));

// Proxy route for HLS stream
app.use('/proxy', createProxyMiddleware({
  target: 'https://ptv.lol',
  changeOrigin: true,
  pathRewrite: {
      '^/proxy': '', // Remove the /proxy prefix
  },
  secure: false, // Disable SSL verification (use with caution)
}));


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


  // Replace this with the URL of the API you want to fetch data from
async function fetchData(channel,channelID) {
const url = `https://phantomtv.net/api/programmes`;
const options = {
method: 'GET',
headers: {
}
};

try {
const response = await fetch(url, options);
const data = await response.json();
const fixtures = data.response;
// console.log(response.status);
// console.log(data.data[channel]);

const apiData = data.data[channel];


// // Get the current timestamp (in seconds since Unix epoch)
const currentTimestamp = Math.floor(Date.now() / 1000);


// Find the currently live program
const liveProgram = apiData.find(program => {
  return program.start_utc <= currentTimestamp && currentTimestamp <= program.stop_utc;
});

if (liveProgram) {
// Display or return information about the currently live program
const programTitle = liveProgram.title;
const programSubTitle = liveProgram['sub-title'];
const programDescription = liveProgram.desc;
const programStartTimeStamp = liveProgram.start_utc * 1000; // Convert to milliseconds
const programEndTimeStamp = liveProgram.stop_utc * 1000; // Convert to milliseconds




// Specify the time zone for Edmonton (Mountain Daylight Time)
const timeZone = 'America/Edmonton';
const options = {
timeZone,
hour: '2-digit',
minute: '2-digit',
hour12: true,
};

const formattedStartTime = new Date(programStartTimeStamp).toLocaleString('en-US', options);
const formattedEndTime = new Date(programEndTimeStamp).toLocaleString('en-US', options);

// Create the time range string
const timeRange = `${formattedStartTime} - ${formattedEndTime}`;



// Replace these values with your actual timestamps
// const currentTimestamp = 1698398348;
const startTimestamp = liveProgram.start_utc;
const stopTimestamp = liveProgram.stop_utc;
// Calculate the time duration between start and stop timestamps
const duration = stopTimestamp - startTimestamp;
// Calculate the time elapsed from the start timestamp to the current timestamp
const elapsedTime = currentTimestamp - startTimestamp;
// Calculate the progress as a percentage
const progress = (elapsedTime / duration) * 100;

// progressThingy = document.getElementById('TNTprogress-completed')
// progressThingy.setAttribute("data-progress",progress)

// progressCompleted = channelName.querySelector(".progress-completed")
// progressCompleted.setAttribute("data-progress", progress)
// console.log(channelName.querySelector(".progress-completed"))
// const progressValue = parseFloat(progressCompleted.getAttribute('data-progress'));
//       const widthValue = progressValue / 100;
//       progressCompleted.style.width = `calc(${widthValue} * 235px)`;

  // console.log(programTitle)
  return { title: programTitle + ': ' + programSubTitle , description: programDescription, time:timeRange, progress: progress };

console.log("Currently Live Program:");
console.log("Title:", programTitle);
console.log("Sub-Title:", programSubTitle);
console.log("Description:", programDescription);
console.log("Time:", timeRange);
} else {
// console.log("No live program is currently airing.");
return { title:'No live program is currently airing.' , description: '', time:'', progress: 0 };
   
}


} catch (error) {
console.error(error);
}
}


// fetchData('SkySportsPremiereLeague.uk');
fetchData('TNTSport1.uk','tnt-sport1');
fetchData('TNTSport2.uk','tnt-sport2');
// fetchData('TNTSport3.uk','tnt-sport3');
// fetchData('ViaplaySports1.uk','premiersports1');
// fetchData('ViaplaySports2.uk','premiersports2');
// fetchData('SkySportsPremiereLeague.uk','skysportsepl');
// fetchData('SkySportsMainEvent.uk','skysportsmainevent');
// fetchData('SkySportsMainEvent.uk','skysportsmainevent');
// fetchData('SkySportsFootball.uk','skysportsfootball');
// fetchData('SkySportsNews.uk','skysportsnews');






// const agent = new HttpsProxyAgent(proxyUrl);
// Function to scrape data
// async function scrapeData(channel) {
//   try {
//     const headers = {
//       'User-Agent': getRandomUserAgent(),
//       'Accept': 'text/html, image/avif, image/webp, image/apng, image/svg+xml, */*;q=0.8',
//       'Accept-Language': 'en-US, en;q=0.9',
//       'Accept-Encoding': 'gzip, deflate, br',
//       'Connection': 'keep-alive',
//       'Upgrade-Insecure-Requests': '1',
//       'Sec-Fetch-Dest': 'document',
//       'Sec-Fetch-Mode': 'navigate',
//       'Sec-Fetch-User': '?1',
//       'Sec-Fetch-Site': 'none',
//     };

//     const response = await axios.get(url, {
//       headers,
//       // httpsAgent: agent,
//       timeout: 10000,
//     });

//     if (response.status === 200) {
//       const $ = cheerio.load(response.data);
//       const btSport1Element = $(channel);

//       // Extract data for cell1 component
//       const cell1TitleElement = btSport1Element.find('.timeline-item.cell1 .title');
//       const cell1Title = cell1TitleElement.clone().children().remove().end().text().trim();
//       const cell1Description = cell1TitleElement.find('.sDesc').text().trim();
//       const cell1Time = (btSport1Element.find('.timeline-item.cell1 .time').text().trim() + " " + btSport1Element.find('.timeline-item.cell2 .time').text().trim()).slice(0, -1);
//       const progressTime = btSport1Element.find('.progress span').attr('style').slice(6, -2);
//       console.log(progressTime)

//       // Return the scraped data as an object
//       return { title: cell1Title, description: cell1Description, time: cell1Time, progress: progressTime };
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



app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE" // what matters here is that OPTIONS is present
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization", "Access-Control-Allow-Origin");
  next();
});


// ... (other imports and code
app.get('/tem', async (req, res) => {
  try {
    const promises = [fetchData('TNTSport1.uk','tnt-sport1'), fetchData('TNTSport2.uk','tnt-sport2'), fetchData('TNTSport3.uk','tnt-sport3'), fetchData('SkySportsPremiereLeague.uk','skysportsepl'), fetchData('ViaplaySports1.uk','premiersports1'),fetchData('ViaplaySports2.uk','premiersports2'),fetchData('SkySportsMainEvent.uk','skysportsmainevent'),fetchData('SkySportsFootball.uk','skysportsfootball'), fetchData('SkySportsNews.uk','skysportsnews')]; 
    const [ TNTSports1, TNTSports2, TNTSports3, SkySportsEPL, PremierSports1, PremierSports2, SkySportsFootball, SkySportsMainEvent,SkySportsNews ] = await Promise.all(promises);

    res.render('index', { TNTSports1 , TNTSports2,TNTSports3,SkySportsEPL,SkySportsFootball,
    PremierSports1,PremierSports2,SkySportsFootball,SkySportsMainEvent,SkySportsNews});
  } catch (error) {
    console.error('Failed to scrape data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// ... (other imports and code
app.get('/aidan', async (req, res) => {
  try {
    const promises = [fetchData('TNTSport1.uk','tnt-sport1'), fetchData('TNTSport2.uk','tnt-sport2'), fetchData('TNTSport3.uk','tnt-sport3'), fetchData('SkySportsPremiereLeague.uk','skysportsepl'), fetchData('ViaplaySports1.uk','premiersports1'),fetchData('ViaplaySports2.uk','premiersports2'),fetchData('SkySportsMainEvent.uk','skysportsmainevent'),fetchData('SkySportsFootball.uk','skysportsfootball'), fetchData('SkySportsNews.uk','skysportsnews')]; 
    const [ TNTSports1, TNTSports2, TNTSports3, SkySportsEPL, PremierSports1, PremierSports2, SkySportsFootball, SkySportsMainEvent,SkySportsNews ] = await Promise.all(promises);

    res.render('aidan', { TNTSports1 , TNTSports2,TNTSports3,SkySportsEPL,SkySportsFootball,
    PremierSports1,PremierSports2,SkySportsFootball,SkySportsMainEvent,SkySportsNews});
  } catch (error) {
    console.error('Failed to scrape data:', error);
    res.status(500).send('Internal Server Error');
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



app.get('/api/programmes', async (req, res) => {
  // Set the time zone to UK time (GMT/UTC)
const options = { timeZone: 'Europe/London' };
const currentDate = new Date().toLocaleString('en-GB', options);
// console.log(currentDate)


const day = currentDate.slice(0,2)
const month = currentDate.slice(3,5)
const year = currentDate.slice(6,10)

// Create the formatted date string
const formattedDate = `${year}-${month}-${day}`;
// console.log(formattedDate)
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


// Sample user credentials (replace with your actual credentials)
const validEmail = 'temtesfay1234@gmail.com';
const validPassword = 'tem123';
// var email = 'temtesfay1234@gmail.com';
// var password = 'tem123';

// Route to render the login page
app.get('/', (req, res) => {
  res.render('login', { message: 'Hello Negan' });
});

// Route to handle login form submission
app.post('/login', (req, res) => {
  // const { email, password } = req.body;
  const email = req.body["email"]
  const password = req.body["pswd"]

  if (email === validEmail && password === validPassword) {
    // Successful login, redirect to profile page
    res.redirect('/profile');
  } else {
    // Invalid credentials, render login page with an error message
    res.render('login', { message: 'Invalid email or password. Please try again.' });
  }
});


app.get('/profile', (req, res) => {
  res.render('profile');
});



// Serve static files (e.g., CSS, JS) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

