function parseAirport(stringData) {
    // Header of the file
    // 0: "Airport ID", 1: "Name", 2: "City", 3: "Country",
    // 4: "IATA", 5: "ICAO", 6: "Latitude", 7: "Longitude",
    // 8: "Altitude", 9: "Timezone", 10: "DST", 11: "Tz database time zone",
    // 12: "Type", 13: "Source"
    return d3.csvParseRows(stringData, function (d) {
        return {
            "Airport ID": d[0],
            "Country": d[3]
        }
    });
}

function parseRoute(stringData) {
    // Header of the file
    // 0: "Airline", 1: "Airline ID", 2: "Source airport",
    // 3: "Source airport ID", 4: "Destination airport",
    // 5: "Destination airport ID", 6: "Codeshare", 7: "Stops", 8: "Equipment"
    return d3.csvParseRows(stringData, function (d) {
        return {
            "Source airport ID": d[3],
            "Destination airport ID": d[5]
        }
    });
}

function cleanData(airportData, routeData, countriesData) {
    var airportCountByCountry = [];
    airportData.forEach(function (d) {
        var found = airportCountByCountry.find(function (airport) {
            return d["Country"] === airport["Country"];
        });
        if (found)
            found["Count"]++;
        else{
            var continent = countriesData.find(function(country){
                return country["Country"] === d["Country"];
            });
            if(continent){
                airportCountByCountry.push({
                    "Country": d["Country"],
                    "Continent": continent["Continent"],
                    "Count": 1
                });
            }
        }
    });

    function findCountryByAirport(givenAirportID) {
        var foundAirport = airportData.find(function (d) {
            return givenAirportID === d["Airport ID"];
        });
        if (foundAirport){
            var countriesDataFound = countriesData.find(function(d){
                return d["Country"] === foundAirport["Country"];
            });
            if(countriesDataFound)
                return foundAirport["Country"];
            else
                return false;
        }
        else
            return false;
    }

    var flightsFromToCountries = [];
    routeData.forEach(function (route) {
        var sourceCountry = findCountryByAirport(route["Source airport ID"]);
        var destinationCountry = findCountryByAirport(route["Destination airport ID"]);
        if (sourceCountry && destinationCountry) {
            var found = flightsFromToCountries.find(function (d) {
                return d["Source airport country"] === sourceCountry &&
                    d["Destination airport country"] === destinationCountry;
            });
            if (found) {
                found["Count"]++;
            }
            else {
                flightsFromToCountries.push({
                    "Source airport country": sourceCountry,
                    "Destination airport country": destinationCountry,
                    "Count": 1
                });
            }
        }
    });

    return [airportCountByCountry, flightsFromToCountries];
}

var path = document.location.pathname;
var directory = path.substring(path.indexOf('/'), path.lastIndexOf('/'));

d3.queue()
    .defer(d3.text, directory + "/data/airports.dat")
    .defer(d3.text, directory + "/data/routes.dat")
    .defer(d3.csv, directory + "/data/countries.csv")
    .awaitAll(function (error, data) {
        var airportData = parseAirport(data[0]);
        var routeData = parseRoute(data[1]);
        var cleanedData = cleanData(airportData, routeData, data[2]);
        debugger;
    });