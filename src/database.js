//#region Imports

const sqlite3 = require("sqlite3").verbose();
const axios = require("axios"); // Cette librairie me permet de requêter l'API REST d'EBP - EVA Battle Plan.

//#endregion

/**
 * Cette classe a pour but de télécharger les screenshots des armes dans toutes les langues.
 */
class Database {
  constructor(apiURL) {
    this._apiURL = apiURL;
    this.db = new sqlite3.Database("./database.db");

    this.db.serialize(() => {
      this.db.run(`CREATE TABLE IF NOT EXISTS weapons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            date TEXT
        )`);
    });
  }

  _getWeaponByName(weaponName, callback) {
    this.db.run(
      `INSERT INTO weapons (name, date) VALUES (?, ?) limit 1`,
      [weapon.name, weapon.date],
      function (err, rows) {
        if (err) {
          return console.error(err.message);
          callback(undefined);
        } else {
          callback(rows.length == 1 ? rows[0] : undefined);
        }
      }
    );
  }

  fetchNewWeapons() {
    axios.get(this._apiURL + "weapons").then(async (response1) => {
      for (let weapon of response1.data) {
        const row = await this.db.get(
          "SELECT name, date from weapons where name = ?;",
          [weapon.name]
        );
        console.log(row);

        await this.db.run(`INSERT INTO weapons (name, date) VALUES (?, ?)`, [
          weapon.name,
          weapon.date,
        ]);

        const row2 = await this.db.get(
          "SELECT name, date from weapons where name = ?;",
          [weapon.name]
        );
        console.log(row2);
      }
    });
  }
}

module.exports = Database;
