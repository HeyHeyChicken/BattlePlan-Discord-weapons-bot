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

    this.db.serialize(() => {
      this.db.run(`CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            language TEXT,
            url TEXT
        )`);
    });
  }

  //#region Weapons

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

  _selectWeapon(weaponName, callback) {
    this.db.all(
      `SELECT * FROM weapons where name = ? limit 1`,
      [weaponName],
      function (err, rows) {
        if (err) {
          console.error(err);
          if (callback) {
            callback(undefined);
          }
        } else {
          if (callback) {
            callback(rows && rows.length == 1 ? rows[0] : undefined);
          }
        }
      }
    );
  }

  _setWeapon(weaponName, weaponDate, callback) {
    this._selectWeapon(weaponName, (old) => {
      if (old) {
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
      } else {
        this._insertWeapon(weaponName, weaponDate, callback);
      }
    });
  }

  fetchNewWeapons(callback) {
    let done = 0;
    AXIOS.get(this._apiURL + "weapons").then(async (response) => {
      const WEAPONS = response.data;
      for (let weapon of WEAPONS) {
        this._setWeapon(weapon.name, weapon.date, () => {
          this._selectWeapon(weapon.name, (w) => {
            done++;
            if (WEAPONS.length == done) {
              callback(WEAPONS);
            }
          });
        });
      }
    });
  }

  //#endregion

  //#region Images

  async _insertImage(weaponName, language, url, callback) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO images (name, language, url) VALUES (?, ?, ?)`,
        [weaponName, language, url],
        function (err) {
          if (err) {
            console.error(err);
            reject(err);
          }
          resolve();
        }
      );
    });
  }

  async selectImage(weaponName, language) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM images WHERE name = ? AND language = ? LIMIT 1`,
        [weaponName, language],
        (err, rows) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(rows && rows.length === 1 ? rows[0] : undefined);
          }
        }
      );
    });
  }

  async setImage(weaponName, language, url) {
    const OLD = await this.selectImage(weaponName, language);
    if (OLD) {
      return new Promise((resolve, reject) => {
        this.db.run(
          `UPDATE images SET url = ? WHERE name = ? AND language = ?`,
          [url, weaponName, language],
          function (err) {
            if (err) {
              console.error(err);
              reject(err);
            }
            resolve();
          }
        );
      });
    } else {
      return this._insertImage(weaponName, language, url);
    }
  }

  //#endregion
}

module.exports = Database;
