const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const mongoDbUrl = process.env.MONGO_DB_URL;
if (!mongoDbUrl) {
  console.error('MONGO_DB_URL is not defined in the environment variables');
  process.exit(1);
}

mongoose.connect(mongoDbUrl, {
  useNewUrlParser: true, useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
  try {
    const shortUrls = await ShortUrl.find();
    res.render('index', { shortUrls: shortUrls });
  } catch (error) {
    console.error('Error fetching short URLs:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/shortUrls', async (req, res) => {
  try {
    await ShortUrl.create({ full: req.body.fullUrl });
    res.redirect('/');
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/:shortUrl', async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
    if (shortUrl == null) return res.sendStatus(404);

    shortUrl.clicks++;
    shortUrl.save();

    res.redirect(shortUrl.full);
  } catch (error) {
    console.error('Error handling short URL:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});