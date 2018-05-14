import { Parser, Builder } from 'xml2js';
import { find } from 'lodash';

const editor = {

    readSave: (xml, cb) => {
        const parser = new Parser({ trim: true });
        parser.parseString(xml.replace("\ufeff", ''), (err, result) => {
            if (err) { 
                cb(err, null);
            } else {
                editor.saveToState(result);                
                cb(null, result);
            }
        });
    },

    getPlayers: (result) => {
        const { player } = result.SaveGame;
        const players = [];
        players.push(player[0]);

        find(result.SaveGame.locations, (k, v) => {
            const { GameLocation: locations } = k;
            const farm = find(locations, lk => lk.name[0] === 'Farm');
            const buildings = farm.buildings[0].Building;
            
            find(buildings, (bk) => {
                if (bk.buildingType && bk.buildingType[0] && bk.buildingType[0].match(/Cabin$/)) {
                    const { farmhand } = bk.indoors[0];
                    if (farmhand && farmhand[0]) {
                        players.push(farmhand[0]);
                    }
                }
            });
        });
        return players;
    },

    injectPlayers: (newPlayers) => {
        const [ host, farmhand1, farmhand2, farmhand3 ] = newPlayers;
        const savedata = editor.getSaveState();
        const { locations } = savedata.SaveGame;
        savedata.SaveGame.player = host;

        
        if (locations[0].GameLocation[1] & locations[0].GameLocation[1].farmhand) { 
            locations[0].GameLocation[1].farmhand = farmhand1;
        }
        if (locations[0].GameLocation[1] & locations[0].GameLocation[2].farmhand) {
            locations[0].GameLocation[2].farmhand = farmhand2;
        }
        if (locations[0].GameLocation[1] & locations[0].GameLocation[3].farmhand) {
            locations[0].GameLocation[3].farmhand = farmhand3;
        }

        editor.saveToState(savedata);
    },

    getSaveState: () => {
        return this.savestate;
    },

    saveToState: (state) => {
        this.savestate = state;
    },

    getSavefile: () => {
        const builder = new Builder({ renderOpts: { 
            pretty: false, 
            indent: '', 
            newline: ''
        }});
        return builder.buildObject(this.savestate);
    }

}

export default editor;