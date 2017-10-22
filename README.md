# Bus Scraper v1

## A Command Line Tool to gather the positions of Bus Stops for the Wellington Metlink bus service

### How to Use

* Clone the repo
* `npm install`
* Make sure you have a `/coords` directory
* `npm start` and watch the magic happen

### What does it do?

* Once you hit `npm start`, the scraper tool will first scrape all of the bus service numbers (such a `1` for "Island Bay - Wellington") from https://www.metlink.org.nz/#timetables

* Next, the tool will start recursing through this array of bus numbers, starting with the first item on the list:
* It starts by scraping `inbound` bus stop numbers for the bus service from https://www.metlink.org.nz/timetables/bus/BUS_SERVICE_NUMBER/inbound
* The tool will then recurse through the collected array of stop numbers, making a request to https://www.metlink.org.nz/api/v1/StopDepartures/BUS_STOP_NUMBER for each stop.
* The tool pushes an object to an ongoing array with some of the response data. The object created will look like
``` js
  {
    "stopNumber":"6755",
    "lat":-41.3199053,
    "lng":174.7690357
  }
```
  * (The tool will only timeout 1/10th of a second after each request, but when a request limit is hit, the tool will timeout for 3s before resuming.)

* Once all of the bus stops have been requested for the inbound route, the tool will write a file to your `/coords` directory, named `bus-BUS_SERVICE_NUMBER-IN.txt` (eg. `bus-1-IN.txt`) with a stringified JSON array, that is structured as so:

``` js
  {
    busNumber: "1",
    services: [
      {
        "stopNumber":"6755",
        "lat":-41.3199053,
        "lng":174.7690357
      },
      {},
      ...
    ],
    isInbound: true
  }
```

* After the inbound stops have been written to a file, the tool will repeat the same process for the `outbound` stops of the same service number. Once this outbound file has been written, the tool will move on to the next bus service from the first scraped array (ie, bus service `2` inbound, then outbound, etc)

* Should a file already exist (if you restart the app, or otherwise), the tool will skip over the request step for the file. (if you alreayd have a `/coords/bus-1-IN.txt`, the app will not request the information of these bus stops)

### And that's how it works :)

## Checkout the `data` branch to see all the existing files I have created
