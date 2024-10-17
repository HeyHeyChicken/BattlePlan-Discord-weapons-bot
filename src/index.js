//#region Imports

const { Client, GatewayIntentBits } = require("discord.js"); // Cette librairie me permet de communiquer avec l'API de Discord.
const axios = require("axios"); // Cette librairie me permet de requêter l'API REST d'EBP - EVA Battle Plan.
const path = require("path"); // Cette  librairie me permet de créer des chemins d'accès liés à l'OS.
const HTTP = require("http");
const FS = require("fs");

const Screenshoter = require("./screenshoter");
const Settings = require("./settings");
const Database = require("./database");

//#endregion

//#region Variables

const DEV_MODE = true;
let weapons; // Ici sera stockée la liste des armes provenant de l'API.
let weaponsUrls; // Ici sera stockée la liste des URL de la page "Armes".
const API_URL = "https://evabattleplan.com/en/api-discord/?route="; // URL de l'API RES d'EBP - EVA Battle Plan.
const WEAPONS_CHANNEL_NAMES = [
  ["eapons", "en"],
  ["rmes", "fr"],
  ["rmas", "es"],
]; // Le bot ne travaillera que sur les channels qui contiennent l'élément 0. L'élément 1 représente la langue devinée du channel.
const SCREENSHOTER = new Screenshoter();
const SETTINGS = new Settings();
//const DATABASE = new Database(API_URL);
const WEB_PORT = DEV_MODE ? 3001 : 3000;

//#endregion

//#region Web server

const SERVER = HTTP.createServer((req, res) => {
  if (req.url === "/") {
    const SVG_PATH = path.join(__dirname, "assets/online.svg");

    FS.readFile(SVG_PATH, (err, data) => {
      if (err) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("EBP - EVA Battle Plan's Discord bot is <b>online</b>.");
        return;
      }
      res.writeHead(200, {
        "Content-Type": "image/svg+xml",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      });
      res.end(data);
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

SERVER.listen(WEB_PORT, () => {
  console.log("Serveur HTTP en écoute sur le port " + WEB_PORT + ".");
});

//#endregion

const CLIENT = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Si un utilisateur créé un message
CLIENT.on("messageCreate", async (message) => {
  // On ignore les messages du bot.
  if (message.author.bot) return;

  // On vérifie que l'utilisateur a les permissions d'administrateur.
  if (
    ((!DEV_MODE && message.content == "!ebp_refresh") ||
      (DEV_MODE && message.content == "!dev_ebp_refresh")) &&
    message.member.permissions.has("ADMINISTRATOR")
  ) {
    const SERVERS = Array.from(CLIENT.guilds.cache);
    const SERVER = Array.from(SERVERS)
      .map((x) => x[1])
      .find((x) => x.id == message.guildId);

    const CHANNEL = Array.from(
      SERVER.channels.cache.filter((channel) => channel.id == message.channelId)
    ).map((x) => x[1]);
    if (SERVER && CHANNEL.length == 1) {
      console.log(
        '"' +
          message.author.globalName +
          '" asked for a manual refresh for the: "' +
          SERVER.name +
          '" server.'
      );
      console.log("    Getting old messages...");
      const OLD_MESSAGES = await getOldMessages(CHANNEL[0]);
      console.log("    Got old messages (" + OLD_MESSAGES.length + ")");
      for (let message of OLD_MESSAGES) {
        try {
          await message.delete();
          console.log("deleted");
        } catch (e) {
          console.error("        Impossible de supprimer le messages.", e);
        }
      }
      console.log("refreshing");
      refresh(SERVER);
    }
  }
});

/**
 * Cette fonction retourne les anciens messages d'un salon.
 * @param {*} channel Salon à analyser.
 * @param {*} limit Nombre de messages maximim à récupérer.
 * @returns Liste des anciens messages du salon.
 */
async function getOldMessages(channel, limit = 100) {
  let oldMessages = [];
  try {
    oldMessages = Array.from(await channel.messages.fetch({ limit: limit })); // On récupère les anciens messages envoyés sur le channel.
  } catch (e) {
    console.error("        Impossible d'accéder aux messages.", e);
  }
  return Array.from(oldMessages).map((x) => x[1]);
}

/**
 * Cette fonction rafraichit les informations des armes dans un serveur.
 * @param {*} server Serveur à rafraichir.
 */
async function refresh(server) {
  console.log(`    Serveur: ${server.name}`);
  // On récupère les channels qui ont un nom présent dans "WEAPONS_CHANNEL_NAMES".
  const WEAPONS_CHANNELS = Array.from(
    server.channels.cache.filter(
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

    console.log(`        Channel: ${CHANNEL[1].name}`);

    let OLD_MESSAGES = await getOldMessages(CHANNEL[1]);

    // On filtre les anciens messages pour ne garder que les messages envoyés par le BOT.
    const OLD_BOT_MESSAGES = OLD_MESSAGES.filter(
      (x) =>
        x.author.bot == true &&
        x.author.username == CLIENT.user.username &&
        x.author.discriminator == CLIENT.user.discriminator
    );
    let nbMessageSend = 0; // Cette variable représente le nombre de messages envoyés sur le channel.

    for (const WEAPON of weapons) {
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
          try {
            await OLD_BOT_MESSAGE.delete();
          } catch (e) {
            console.error("        Impossible de supprimer le messages.", e);
          }
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
                SCREENSHOTER.screenshotsFolder,
                (LANGUAGE + "_" + WEAPON.name).toUpperCase() + ".png"
              ),
            ],
          });
          nbMessageSend++;
        } catch (e) {
          console.error("        Impossible d'envoyer un message.", e);
        }
      }
    }

    // On envoie le message final.
    if (nbMessageSend > 0) {
      OLD_BOT_MESSAGES.filter((x) => x.content.startsWith("https")).forEach(
        (message) => {
          try {
            message.delete();
          } catch (e) {
            console.error("        Impossible de supprimer le messages.", e);
          }
        }
      );
      CHANNEL[1].send({
        content: weaponsUrls[LANGUAGE],
      });
    }
  }
}

/**
 * Fonction principale.
 */
async function loop() {
  console.log("Loop start...");
  //DATABASE.fetchNewWeapons();
  //if (!DEV_MODE) {
  await SCREENSHOTER.download_screenshots(
    SCREENSHOTER.prepare_urls(weapons, weaponsUrls, WEAPONS_CHANNEL_NAMES)
  ); // On télécharge les screenshots.
  //}

  // On boucle sur les serveurs Discord utilisant le bot.
  const SERVERS = Array.from(CLIENT.guilds.cache).map((server) => server[1]);
  console.log("There are " + SERVERS.length + " servers using this bot.");
  for (const SERVER of SERVERS) {
    if (!DEV_MODE || (DEV_MODE && SERVER.name == "EBP - EVA Battle Plan")) {
      refresh(SERVER);
    }
  }
  console.log("Loop end.");
}

CLIENT.once("ready", async () => {
  console.log(`Node.JS est connecté avec le bot : ${CLIENT.user.username}.`);

  axios.get(API_URL + "weapons").then((response1) => {
    weapons = response1.data;
    axios.get(API_URL + "weapons_urls").then((response2) => {
      weaponsUrls = response2.data;

      setInterval(() => {
        loop();
      }, 1000 * 60 * 60 * 24); // Le script s'executera toutes les 24h.
      loop();
    });
  });
});

CLIENT.login(SETTINGS.settings.discord_bot_token);
