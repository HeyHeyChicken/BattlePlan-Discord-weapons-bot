//#region Imports

const SQL_LITE = require("sqlite3").verbose();
const AXIOS = require("axios"); // Cette librairie me permet de requêter l'API REST d'EBP - EVA Battle Plan.

//#endregion

/**
 * Cette classe a pour but de télécharger les screenshots des armes dans toutes les langues.
 */
class Database {
  constructor(apiURL) {
    this._apiURL = apiURL;
    this.db = new SQL_LITE.Database("./database.db");

    this.db.serialize(() => {
      this.db.run(`CREATE TABLE IF NOT EXISTS weapons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            date TEXT
        )`);
    });
  }

  _getWeaponByName(weaponName, callback) {
    this.db.all(
      `SELECT name, date FROM weapons where name = ? limit 1`,
      [weaponName],
      function (err, rows) {
        if (err) {
          console.error(err);
          callback(undefined);
        } else {
          callback(rows && rows.length == 1 ? rows[0] : undefined);
        }
      }
    );
  }

  _insertWeapon(weaponName, weaponDate, callback) {
    this.db.run(
      `INSERT INTO weapons (name, date) VALUES (?, ?)`,
      [weaponName, weaponDate],
      function (err) {
        if (err) {
          console.error(err);
        }
        callback();
      }
    );
  }

  _updateWeaponDate(weaponName, weaponDate, callback) {
    this.db.run(
      `UPDATE weapons SET date = ? WHERE name = ?`,
      [weaponDate, weaponName],
      function (err) {
        if (err) {
          console.error(err);
        }
        callback();
      }
    );
  }

  fetchNewWeapons(callback) {
    const NEW_WEAPONS = [];
    let done = 0;
    AXIOS.get(this._apiURL + "weapons").then(async (response) => {
      const WEAPONS = response.data;
      for (let weapon of WEAPONS) {
        this._getWeaponByName(weapon.name, (w1) => {
          if (!w1) {
            this._insertWeapon(weapon.name, weapon.date, () => {
              this._getWeaponByName(weapon.name, (w2) => {
                NEW_WEAPONS.push(w2);
                done++;
                if (WEAPONS.length == done) {
                  callback(WEAPONS, NEW_WEAPONS);
                }
              });
            });
          } else if (w1.date != weapon.date) {
            this._updateWeaponDate(weapon.name, weapon.date, () => {
              NEW_WEAPONS.push(weapon);
              done++;
              if (WEAPONS.length == done) {
                callback(WEAPONS, NEW_WEAPONS);
              }
            });
          } else {
            done++;
            if (WEAPONS.length == done) {
              callback(WEAPONS, NEW_WEAPONS);
            }
          }
        });
      }
    });
  }
}

module.exports = Database;
