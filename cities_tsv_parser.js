const fs = require("fs");
const path = require("path");
const process = require('process');


const cache_provider = require("./simple_memory_cache");

const readFile = async (file_path, encoding) => {
    try{
        const file_content = await fs.promises.readFile(file_path, encoding);

        return file_content;
    }catch(err){
        console.log(err);
    }
};

const getCities = async () => {
    const cache = new cache_provider.MemoryCache(readFile);

    const file_content = await cache.getData(path.resolve(process.cwd(), "data", "cities_canada-usa.tsv"), "utf8");
    let separator = /\r\n/;

    // Heroku changes \r\n to \n
    if(file_content.indexOf("\r\n") == -1) separator = /\n/;

    const cities = file_content.split(separator).map((city, idx) => {
        if(idx == 0) return;

        const [geonameid, name, asciiname, alternatenames, latitude, longitude, feature_class, feature_code, country_code, cc2,
            admin1_code, admin2_code, admin3_code, admin4_code, population, elevation, dem, timezone, modification_date] = city.split('\t');

        if(population > 5000 && (country_code == "US" || country_code == "CA"))
            return {geonameid, name, asciiname, latitude, longitude, country_code, admin1_code, population, modification_date, score: 0};

        return;
    });
    
    return cities;
};

exports.getCities = getCities;