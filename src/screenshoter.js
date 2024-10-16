//#region Imports

const puppeteer = require("puppeteer"); // Cette librairie me permet de télécharger les screenshots des armes.
const fs = require("fs"); // Cette librairie me permet de travailler avec des fichiers locaux.
const path = require("path"); // Cette  librairie me permet de créer des chemins d'accès liés à l'OS.

//#endregion

/**
 * Cette classe a pour but de télécharger les screenshots des armes dans toutes les langues.
 */
class Screenshoter {
  constructor() {
    // On s'assure qu'il existe un dossier pour stocker les captures d'écran de chaque armes.
    this.screenshotsFolder = path.join(__dirname, "screenshots");
    fs.mkdirSync(this.screenshotsFolder, { recursive: true });
  }

  prepare_urls(weapons, weaponsUrls, weaponsChannelNames) {
    // On prépare la liste des URLs à scanner pour créer les screenshots de chaque armes, pour chaque langues.
    const SCREENSHOT_URLS = [];
    for (const NAME of weaponsChannelNames) {
      for (let weapon of weapons) {
        SCREENSHOT_URLS.push([
          path.join(
            this.screenshotsFolder,
            (NAME[1] + "_" + weapon.name).toUpperCase() + ".png"
          ),
          weaponsUrls[NAME[1]] +
            "?w=" +
            weapon.name.toLowerCase().replaceAll("-", " ") +
            "&discord_bot",
        ]);
      }
    }
    return SCREENSHOT_URLS;
  }

  /**
   * Cette fonction permet de récupérer les captures d'écran des pages d'armes.
   * @param {*} urls Liste des armes et des URLs associées par langue.
   */
  async download_screenshots(urls) {
    console.log("    Downloading screenshots...");

    const SCREEN_WIDTH = 1920 * 0.9;
    const SCREEN_HEIGHT = 1080 * 0.9;
    const BROWSER = await puppeteer.launch({
      headless: "shell", // Pour ne pas afficher le navigateur.
      defaultViewport: null, // Nécessaire pour définir la taille.
    });
    const PAGE = await BROWSER.newPage();

    await PAGE.setViewport({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
    for (let i = 0; i < urls.length; i++) {
      await PAGE.goto(urls[i][1], { waitUntil: "networkidle2" });

      // Prends une capture d'écran
      await PAGE.screenshot({
        path: urls[i][0],
        fullPage: false,
      });
    }
    await BROWSER.close();

    console.log("    Screenshots downloaded.");
  }
}

module.exports = Screenshoter;
