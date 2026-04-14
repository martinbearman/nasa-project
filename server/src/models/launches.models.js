const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {  
                    path: 'rocket', 
                    select: { 
                        name: 1 
                    }},
                { 
                    path: 'payloads', 
                    select: {
                        customers: 1                    
                    }
                },
            ],
        },
    });

    if (response.status !== 200) {
        console.log('Problem downloading launch data');
        throw new Error('Launch data download failed');
    }

    // response.data.docs is an array of launches — not a single launch object
    const launchDocs = response.data.docs;

    for (const launchDoc of launchDocs) {
        const payloads = launchDoc.payloads ?? [];
        const customers = payloads.flatMap((payload) => payload.customers ?? []);

        const launch = {
            flightNumber: launchDoc.flight_number,
            mission: launchDoc.name,
            rocket: launchDoc.rocket?.name ?? 'Unknown',
            launchDate: new Date(launchDoc.date_local),
            upcoming: launchDoc.upcoming,
            success: launchDoc.success ?? false,
            customers,
        };

        console.log(`${launch.flightNumber} ${launch.mission}`);
        await saveLaunch(launch);
    }
}

async function loadLaunchData() {
    console.log('Downloading launch data...');

    async function firstLaunch() {
        return await findLaunch({
            flightNumber: 1,
            rocket: 'Falcon 1',
            mission: 'FalconSat',
        });
    }

    const existingFirstLaunch = await firstLaunch();

    if (existingFirstLaunch) {
        console.log('Launch data already loaded!');
        return;
    }
    await populateLaunches();
}

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter);
}

async function saveLaunch(launch) {
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true,
    });
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase
        .findOne()
        .sort({ flightNumber: -1 });
    return latestLaunch ? latestLaunch.flightNumber : 0;
}

async function existsLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId,
    });
}

async function getAllLaunches(skip, limit) {
    // return Array.from(launches.values());
    return await launchesDatabase
        .find({}, {'_id': 0, '__v': 0})
        .sort({ flightNumber: 1 })
        .skip(skip)
        .limit(limit)
    }

async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target,
    });

    if (!planet) {
        throw new Error('No matching planet found');
    }

    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ["ZTM", "NASA"],
        flightNumber: newFlightNumber,
    });

    await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId,
    }, {
        upcoming: false,
        success: false,
    });

    return aborted.acknowledged === true && aborted.modifiedCount === 1;
}

module.exports = {
    loadLaunchData,
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById,
}