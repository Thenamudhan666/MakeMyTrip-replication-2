const fs = require('fs');
const http = require('http');
const url = require('url');
const path = require('path');
const querystring = require('querystring');

// Template replacement function
const replace = (temp, movie) => temp
  .replace(/{%ID%}/g, movie.id)
  .replace(/{%PRICE%}/g, movie.price)
  .replace(/{%image%}/g, movie.image)
  .replace(/{%movie_name%}/g, movie.movie_name)
  .replace(/{%DESCRIPTION%}/g, movie.description)
  .replace(/{%rating%}/g, movie.rating)
  .replace(/{%stars%}/g, movie.stars);

// Load templates and data
const tempOverview = fs.readFileSync('internship2/overview.html', 'utf-8');
const tempCard = fs.readFileSync('internship2/card.html', 'utf-8');
const tempViewing = fs.readFileSync('internship2/viewing.html', 'utf-8');
const tempSeating = fs.readFileSync('internship2/seating.html', 'utf-8');
const data = fs.readFileSync('internship2/data.json', 'utf-8');
const movies = JSON.parse(data);

// Create server
const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const cards = movies.map(m => replace(tempCard, m)).join('');
    res.end(tempOverview.replace('{%MOVIE_CARDS%}', cards));

  } else if (pathname === '/viewing') {
    const movie = movies.find(m => m.id == query.id);
    if (!movie) return res.end('<h1>Movie not found</h1>');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(replace(tempViewing, movie));

  } else if (pathname === '/seating') {
    const id = parseInt(query.id);
    const movie = movies.find(m => m.id === id);
    if (!movie) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      return res.end('<h1>Movie not found</h1>');
    }
    let output = tempSeating;
    output = output.replace(/{%PRICE%}/g, movie.price);
    output = output.replace(/{%ID%}/g, movie.id);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(output);
  } else if (pathname === '/signin' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const formData = querystring.parse(body);
      const { email, password } = formData;
      console.log(`Sign in attempt: Email = ${email}, Password = ${password}`);

      // Respond with welcome message
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<h1>Welcome, ${email}!</h1><p><a href='/overview'>Go to Home</a></p>`);
    });
  } else if (pathname.startsWith('/images/')) {
  const fileName = pathname.replace('/images/', '');
  const filePath = path.join(__dirname, 'internship2/images', fileName);
  console.log("Trying to serve image:", filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error("Image not found:", filePath);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Image not found');
    } else {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(data);
    }
  });
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);

  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>Page Not Found</h1>');
  }
});

// Start server
server.listen(4000, '127.0.0.1', () => {
  console.log('Listening on port 4000...');
});