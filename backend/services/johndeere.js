const request = require('request-promise');
const express = require('express');
const path = require('path')
const cors = require('cors')
const app = express();

app.use(cors())
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

const authToken = 'Bearer eyJraWQiOiJURUpqLThwSWdTRFNJeDNnR19aUjVOT1FQRlJRQ1JQaWE0S0N2YkpqZ3VrIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULnZEMlBJYVk2TUtaNE1xYUlyZXJSTGktUExIbHRnUzlqbHQ0UHdwM0hoS2siLCJpc3MiOiJodHRwczovL3NpZ25pbi5qb2huZGVlcmUuY29tL29hdXRoMi9hdXM3OHRubGF5c01yYUZoQzF0NyIsImF1ZCI6ImNvbS5kZWVyZS5pc2cuYXhpb20iLCJpYXQiOjE2OTQxNTA3ODAsImV4cCI6MTY5NDE5Mzk4MCwiY2lkIjoiMG9hYWd6aXd4YnkwdXRYa1U1ZDciLCJ1aWQiOiIwMHVhZjUyMDJsZzNvcVJRTjVkNyIsInNjcCI6WyJhZzIiLCJhZzEiLCJlcTIiLCJlcTEiXSwiYXV0aF90aW1lIjoxNjk0MTE4OTAxLCJzdWIiOiJrb3V0dWswNSIsImlzY3NjIjp0cnVlLCJ0aWVyIjoiU0FOREJPWCIsImNuYW1lIjoiVGVzdEFwcGxpY2F0aW9uMDUiLCJ1c2VyVHlwZSI6IkN1c3RvbWVyIiwiY2FwaWQiOiJmZGNkNDNmYS1mMWMzLTQ2YjQtOGZiMC00NWYyZDA5MjUxNjIifQ.YezA2eI_AQpYY6__mVcXZZljoqyIWeJr-CXeyejsK2HhYnHPd9GOp0UlY-Mxq8qChWvq8nA7ihxomrCLHHv4rQxChTkRlTAffUwbC2LgGlhIv0o_QPzZPg2dH6dt7mnyIxP9C6sRZIDawp-DNmWxAhTYV7ZQhvbrBgUb4MJK5geb--HdJBgEL1h-dKAiT_Pf_t0cpiDFKh7gK6Z8D37KE1386MxZ4IYkdW6ot4IpYmSI1083DEkHmNvssSnCTmE07EdUxG9qO_Bal-L9tFD_SGOpIJH7C7EmM36HWn9tUqGSPZ_s1esAalcgZTfP0TxIV_JPgm9QDDoQaKSkC4tKgA';
app.get('/machines', async (req, res) => {

    let Machine = class {
        constructor(id, vin, name, make, type, model, lastKnown, locationHistory) {
            this.id = id;
            this.vin = vin;
            this.name = name;
            this.make = make;
            this.type = type;
            this.model = model;
            this.lastKnown = lastKnown;
            this.locationHistory = locationHistory
        }
    };

    let machines = await getMachines()

    var machinesArray = [];

    for (let i = 0; i < machines.values.length; i++) {

        var machine = new Machine()
        machine.id = machines.values[i].id
        machine.name = machines.values[i].name
        machine.vin = machines.values[i].vin
        machine.make = machines.values[i].equipmentMake.name
        machine.type = machines.values[i].equipmentType.name
        machine.model = machines.values[i].equipmentModel.name

        var locationLast = await getMachineLastLocation(machines.values[i].id)
        machine.lastKnown = locationLast !== undefined && locationLast.values.length > 0 ? transformPoint(locationLast.values[0].point) : { lat: 42.562917, lng: -95.536972 };
        let locationHistory = await getMachineHistory(machines.values[i].id)
        // Sort the location history array based on timestamps
        locationHistory = locationHistory.values.sort(compareTimestamps);

        var points = []
        if (locationHistory.length > 0) {
            for (let i = 0; i < locationHistory.length; i++) {
                var point = transformPoint(locationHistory[i].point);
                points.push(point)
            }
        }
        machine.locationHistory = points
        machinesArray.push(machine);
        console.log(i)
    }

    console.log("executed")
    res.send(machinesArray)
});

async function getMachines() {

    var optionsTemp = getOptions('https://sandboxapi.deere.com/platform/organizations/157679/machines')
    let result0 = await req(optionsTemp);
    //console.log(result0.resp.body);
    return result0.resp.body;

}

async function getMachineHistory(id) {

    var optionsTemp = getOptions('https://sandboxapi.deere.com/platform/machines/' + id + '/locationHistory')
    let result0 = await req(optionsTemp);
    //console.log(result0.resp.body);
    return result0.resp.body;

}

async function getMachineLastLocation(id) {

    var optionsTemp = getOptions('https://sandboxapi.deere.com/platform/machines/' + id + '/locationHistory?lastKnown=true')
    let result0 = await req(optionsTemp);
    //console.log(result0.resp.body);
    return result0.resp.body;
}

function req(url) {
    return new Promise(function (resolve, reject) {
        request.get(url, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    resp: resp,
                    body: body
                });
            }
        })
    })
};

function getOptions(url) {
    const options = {
        method: 'GET',
        uri: url,
        json: true,
        headers: {
            'Authorization': authToken,
            'Accept': 'application/vnd.deere.axiom.v3+json'
        }
    }
    return options;
}

app.listen(4000, () => console.log('Example app listening on port 4000!'));

function transformPoint(point){
    return {
        "lat": point.lat,
        "lng": point.lon
    }
}

function compareTimestamps(a, b) {
    const timestampA = new Date(a.eventTimestamp);
    const timestampB = new Date(b.eventTimestamp);
    // Compare timestamps
    if (timestampA < timestampB) return -1;
    if (timestampA > timestampB) return 1;
    return 0;
}