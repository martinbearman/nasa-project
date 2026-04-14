require('dotenv').config();

const http = require('http');
const app = require('./app');
const { loadPlanetsData } = require('./models/planets.models.js');
const { seedDefaultLaunch } = require('./models/launches.models.js');
const { mongoConnect } = require('./services/mongo.js');
const { loadLaunchData } = require('./models/launches.models.js');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await seedDefaultLaunch();
  await loadLaunchData();

  server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}

startServer();