/* SynBioHub Federator
 * Web of Registries
 *
 * Configuration file manager
 *
 * Written by Zach Zundel
 * 16-06-2017
 */

import *  as fs from 'fs'

// Default file locations
const configFilename = './data/config.json';
const configLocalFilename = './data/config.local.json';

// Abstract schema of configuration files
class ConfigSchema {
    [key: string]: Object | String | Number;
}

// Represents 'merged' config class
class Config {
    private config: ConfigSchema;
    private configLocal: ConfigSchema;

    public constructor() {
        let configString = fs.readFileSync(configFilename, 'utf8');
        let configLocalString = fs.readFileSync(configLocalFilename, { encoding: 'utf8', flag: 'a+' });

        this.config = JSON.parse(configString);
        this.configLocal = configLocalString === "" ? {} : JSON.parse(configLocalString);
    }

    // Get a value from the configuration object
    public get(key: string): Object | String | Number {
        let preset = this.config[key];
        let local = this.configLocal[key];

        // Prefer to return local, but return preset if no local value
        if(local === undefined) {
            return preset;
        }

        return local;
    }

    // Set a key -- changing the local config
    public set(key: string, value: Object | String | Number): void {
        // Do nothing if there's no change.
        if(this.configLocal[key] === value) {
            return
        }

        this.configLocal[key] = value;

        this.save();
    }

    // Persist changes to filesystem
    private save(): void {
        let configLocalString = JSON.stringify(this.configLocal, null, 4);

        fs.writeFileSync(configLocalFilename, configLocalString, { encoding: 'utf8', flag: 'w' })
    }
}

export {
    Config
};