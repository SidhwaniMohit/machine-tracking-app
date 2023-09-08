const request = require('request-promise');
const express = require('express');
const path = require('path')
    const cors = require('cors')
    const app = express();

app.use(cors())
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

const authToken = 'Bearer eyJraWQiOiJURUpqLThwSWdTRFNJeDNnR19aUjVOT1FQRlJRQ1JQaWE0S0N2YkpqZ3VrIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULmcxLVRTeXV5Zmg0RHFYRk1yNXJZa1BENXIyV0NiX3VvLXVSVE5OVS1KTjQiLCJpc3MiOiJodHRwczovL3NpZ25pbi5qb2huZGVlcmUuY29tL29hdXRoMi9hdXM3OHRubGF5c01yYUZoQzF0NyIsImF1ZCI6ImNvbS5kZWVyZS5pc2cuYXhpb20iLCJpYXQiOjE2OTQwNjQ0MjUsImV4cCI6MTY5NDEwNzYyNSwiY2lkIjoiMG9hYWd6aXd4YnkwdXRYa1U1ZDciLCJ1aWQiOiIwMHVhZjUyMDJsZzNvcVJRTjVkNyIsInNjcCI6WyJhZzIiLCJhZzEiLCJlcTIiLCJlcTEiXSwiYXV0aF90aW1lIjoxNjk0MDY0NDIxLCJzdWIiOiJrb3V0dWswNSIsImlzY3NjIjp0cnVlLCJ0aWVyIjoiU0FOREJPWCIsImNuYW1lIjoiVGVzdEFwcGxpY2F0aW9uMDUiLCJ1c2VyVHlwZSI6IkN1c3RvbWVyIiwiY2FwaWQiOiJmZGNkNDNmYS1mMWMzLTQ2YjQtOGZiMC00NWYyZDA5MjUxNjIifQ.mDxHst2xtpyB4QDv6CCrcdoSkb5ZNB4gwv0LuoDStSB69z_ZACItun8sae27Ace2t563ULqZrMimdeH1p1ziRwTqQHvszukY4cmHl1UjuXRh3luOjBRfzIbykIdw2wCbRC-w-fsnuEEtn8--sY5pHkw2bOSfwb3u6jlciyOnQHSWF7-B3k6KrEgqecNfydWnd7KSwjTO3Mi0VFgYUxnVnzIdwJp4n5gOQxeCuDWv40nTz4SvwaeBRss0zwB80XTaFJLLewLr_BDIpfO_wMvQduPKEwuAXMzWPLNRPHVYfn42uOFsRJiTyQsKVQUoep1GkM0T8ObuFnP5ojL0OXc49Q'

app.get('/machines', async(req, res) => {

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

            machine.lastKnown = locationLast.values.length > 0 ? locationLast.values[0].point : "NA";

			let locationHistory =  await getMachineHistory(machines.values[i].id)
			
			var points = []
			if(locationHistory.values.length > 0){
				for (let i = 0; i < locationHistory.values.length; i++) {
					var point = locationHistory.values[i].point;
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