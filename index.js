// https://discord.com/oauth2/authorize?client_id=1295696799839031318&permissions=0&integration_type=0&scope=bot

//#region Imports

const puppeteer = require("puppeteer"); // Cette librairie me permet de télécharger les screenshots des armes.
const { Client, GatewayIntentBits } = require("discord.js"); // Cette librairie me permet de communiquer avec l'API de Discord.
const axios = require("axios"); // Cette librairie me permet de requêter l'API REST d'EBP - EVA Battle Plan.
const fs = require("fs"); // Cette librairie me permet de travailler avec des fichiers locaux.
const path = require("path"); // Cette  librairie me permet de créer des chemins d'accès liés à l'OS.

//#endregion

//#region Variables

const API_URL = "https://evabattleplan.com/en/api-discord/?route="; // URL de l'API RES d'EBP - EVA Battle Plan.
const WEAPONS_CHANNEL_NAMES = [
  ["eapons", "en"],
  ["rmes", "fr"],
  ["rmas", "es"],
]; // Le bot ne travaillera que sur les channels qui contiennent l'élément 0. L'élément 1 représente la langue devinée du channel.

//#endregion

// On récupère les réglages du projet.
const SETTINGS_PATH = path.join(__dirname, "settings.json");
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
const SETTINGS = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
if (!SETTINGS.discord_bot_token) {
  console.error(
    'Vous devez définir la valeur de "discord_bot_token" dans le fichier "settings.json".'
  );
  return;
}

// On s'assure qu'il existe un dossier pour stocker les captures d'écran de chaque armes.
const SCREENSHOTS_FOLDER = path.join(__dirname, "screenshots");
fs.mkdirSync(SCREENSHOTS_FOLDER, { recursive: true });

const CLIENT = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

/**
 * Cette fonction permet de récupérer les captures d'écran des pages d'armes.
 * @param {*} weapons Liste des armes et des URLs associées par langue.
 */
async function download_screenshots(weapons) {
  console.log("Downloading screenshots...");
  const SCREEN_WIDTH = 1920 * 0.9;
  const SCREEN_HEIGHT = 1080 * 0.9;
  const BROWSER = await puppeteer.launch({
    headless: "shell", // Met à true pour ne pas afficher le navigateur
    defaultViewport: null, // Nécessaire pour définir la taille
  });
  const page = await BROWSER.newPage();
  await page.setViewport({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
  for (let i = 0; i < weapons.length; i++) {
    await page.goto(weapons[i][1], { waitUntil: "networkidle2" });

    // Prends une capture d'écran
    await page.screenshot({
      path: weapons[i][0],
      fullPage: false,
    });
  }
  await BROWSER.close();
  console.log("Screenshots downloaded.");
}

/**
 * Fonction principale.
 */
async function loop() {
  let WEAPONS = (await axios.get(API_URL + "weapons")).data;
  let WEAPON_URLS = (await axios.get(API_URL + "weapons_urls")).data;

  // On prépare la liste des URLs à scanner pour créer les screenshots de chaque armes, pour chaque langues.
  const SCREENSHOT_URLS = [];
  for (const NAME of WEAPONS_CHANNEL_NAMES) {
    for (let weaponIndex = 0; weaponIndex < WEAPONS.length; weaponIndex++) {
      SCREENSHOT_URLS.push([
        path.join(
          SCREENSHOTS_FOLDER,
          (NAME[1] + "_" + WEAPONS[weaponIndex].name).toUpperCase() + ".png"
        ),
        WEAPON_URLS[NAME[1]] +
          "?w=" +
          WEAPONS[weaponIndex].name.toLowerCase().replaceAll("-", " ") +
          "&discord_bot",
      ]);
    }
  }

  await download_screenshots(SCREENSHOT_URLS); // On télécharge les screenshots.

  // On boucle sur les serveurs Discord utilisant le bot.
  const SERVERS = Array.from(CLIENT.guilds.cache);
  for (const SERVER of SERVERS) {
    console.log(`Serveur: ${SERVER[1].name}`);

    // On récupère les channels qui ont un nom présent dans "WEAPONS_CHANNEL_NAMES".
    const WEAPONS_CHANNELS = Array.from(
      SERVER[1].channels.cache.filter(
        (channel) =>
          channel.name &&
          WEAPONS_CHANNEL_NAMES.some((keyword) =>
            channel.name.toLowerCase().includes(keyword[0].toLowerCase())
          )
      )
    );

    for (const CHANNEL of WEAPONS_CHANNELS) {
      const LANGUAGE = WEAPONS_CHANNEL_NAMES.find((x) =>
        CHANNEL[1].name.toLowerCase().includes(x[0].toLowerCase())
      )[1]; // On récupère la langue du channel.

      console.log(`    Channel: ${CHANNEL[1].name}`);

      let oldMessages = [];
      try {
        oldMessages = Array.from(
          await CHANNEL[1].messages.fetch({ limit: 100 })
        ); // On récupère les anciens messages envoyés sur le channel.
      } catch (e) {
        console.error("        Impossible d'accéder aux messages.");
      }

      // On filtre les anciens messages pour ne garder que les messages envoyés par le BOT.
      const OLD_BOT_MESSAGES = Array.from(oldMessages)
        .map((x) => x[1])
        .filter(
          (x) =>
            x.author.bot == true &&
            x.author.username == CLIENT.user.username &&
            x.author.discriminator == CLIENT.user.discriminator
        );
      let nbMessageSend = 0; // Cette variable représente le nombre de messages envoyés sur le channel.

      for (const WEAPON of WEAPONS) {
        const TITLE = "**" + WEAPON.name.toUpperCase() + "**";
        const DATE = new Date(WEAPON.date);
        const DATE_STRING =
          ("0" + DATE.getDate()).slice(-2) +
          "/" +
          ("0" + DATE.getMonth()).slice(-2) +
          "/" +
          DATE.getFullYear() +
          " " +
          ("0" + DATE.getHours()).slice(-2) +
          ":" +
          ("0" + DATE.getMinutes()).slice(-2);
        let allowAddNewWeapon = true;

        const OLD_BOT_MESSAGE = OLD_BOT_MESSAGES.find((x) =>
          x.content.startsWith(TITLE)
        ); // On cherche un ancien message en rapport avec cette arme.
        if (OLD_BOT_MESSAGE) {
          OLD_DATE_STRING = OLD_BOT_MESSAGE.content
            .split("(*")
            .at(-1)
            .slice(0, -2);
          // On verrifie que les données de l'arme sont à jour sur ce channel.
          if (DATE_STRING != OLD_DATE_STRING) {
            await OLD_BOT_MESSAGE.delete();
          } else {
            allowAddNewWeapon = false;
          }
        }
        if (allowAddNewWeapon) {
          // On envoie un message contenant les dernières infos de l'arme.
          const MESSAGE = TITLE + "\n(*" + DATE_STRING + "*)";
          try {
            await CHANNEL[1].send({
              content: MESSAGE,
              files: [
                path.join(
                  SCREENSHOTS_FOLDER,
                  (LANGUAGE + "_" + WEAPON.name).toUpperCase() + ".png"
                ),
              ],
            });
            nbMessageSend++;
          } catch (e) {
            console.error("        Impossible d'envoyer un message.");
          }
        }
      }

      // On envoie le message final.
      if (nbMessageSend > 0) {
        OLD_BOT_MESSAGES.filter((x) => x.content.startsWith("https")).forEach(
          (message) => {
            message.delete();
          }
        );
        CHANNEL[1].send({
          content: WEAPON_URLS[LANGUAGE],
        });
      }
    }
  }
}

CLIENT.once("ready", async () => {
  console.log(`Node.JS est connecté avec le bot : ${CLIENT.user.username}.`);

  setInterval(() => {
    loop();
  }, 1000 * 60 * 60 * 24); // Le script s'executera toutes les 24h.
  loop();
});

CLIENT.login(SETTINGS.discord_bot_token);
