//#region Imports

const puppeteer = require("puppeteer"); // Cette librairie me permet de télécharger les screenshots des armes.
const fs = require("fs"); // Cette librairie me permet de travailler avec des fichiers locaux.
const path = require("path"); // Cette  librairie me permet de créer des chemins d'accès liés à l'OS.

//#endregion

/**
 * Cette classe a pour but de télécharger les screenshots des armes dans toutes les langues.
 */
class Settings {
  constructor() {
    // On récupère les réglages du projet.
    const SETTINGS_PATH = path.join(__dirname, "..", "settings.json");
    if (!fs.existsSync(SETTINGS_PATH)) {
      fs.writeFileSync(
        SETTINGS_PATH,
        JSON.stringify(
          {
            discord_bot_token: "",
          },
          null,
          2
        )
      );
    }
    this.settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
    if (
      !this.settings.discord_bot_token ||
      this.settings.discord_bot_token.length == 0
    ) {
      throw new Error(
        'Vous devez définir la valeur de "discord_bot_token" dans le fichier "settings.json".'
      );
    }
  }
}

module.exports = Settings;
