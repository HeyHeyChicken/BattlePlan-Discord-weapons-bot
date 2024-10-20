<div align="center">

<img src="https://raw.githubusercontent.com/HeyHeyChicken/BattlePlan-Discord-weapons-bot/refs/heads/main/.github/logo.png" alt="EBP's Discord weapons bot" width="300">
<br><br>

**EBP's Discord weapons bot** is an open-source bot that will automatically update the characteristics of EVA weapons on your Discord server.<br>

[![Discord](https://discord.evabattleplan.com/)](https://discord.evabattleplan.com/)

<img width="410px" src="https://raw.githubusercontent.com/HeyHeyChicken/BattlePlan-Discord-weapons-bot/refs/heads/main/.github/screenshot.jpg">
</div>

## 👋 Introduction

**EBP's Discord weapons bot** is an open-source bot that will automatically update the characteristics of EVA weapons on your Discord server.

## 🖥️ Add this bot to your server

1. Click here : [Install EBP's Discord server bot](https://discord.com/oauth2/authorize?client_id=1295696799839031318&permissions=0&integration_type=0&scope=bot).
2. Click on the "Authorize" button.
3. Create a channel and add one of these tags in it's topic:

- <img width="20px" src="https://evabattleplan.com/wp-content/uploads/en.png"> #EBP_WEAPONS_BOT(en)
- <img width="20px" src="https://evabattleplan.com/wp-content/uploads/fr.png"> #EBP_WEAPONS_BOT(fr)
- <img width="20px" src="https://evabattleplan.com/wp-content/uploads/es.png"> #EBP_WEAPONS_BOT(es)

4. Click on the cog of this channel.
5. In the "Permission" tab, in the "Advanced permissions" section, remove all permissions and add this specific permissions to "@everyone" users :
   - See the channel
   - Add reactions
   - View old messages
6. In the "Permission" tab, in the "Advanced permissions" section, add theses specific permissions to the "EBP - EVA Battle Plan" bot :
   - See the channel
   - Send messages
   - Embed links
   - Attach files
   - Manage messages
   - View old messages
7. Use this command to refresh weapons for the first time: `!ebp_refresh`.

## 🔧 Prerequisites

[<img src="https://raw.githubusercontent.com/HeyHeyChicken/BattlePlan-Discord-weapons-bot/refs/heads/main/.github/nodeJSLogo.png" width="18" /> Node.js](https://nodejs.org/)<br/>
[<img src="https://raw.githubusercontent.com/HeyHeyChicken/BattlePlan-Discord-weapons-bot/refs/heads/main/.github/npmLogo.png" width="18" /> npm](https://npmjs.com/)<br/>
[<img src="https://raw.githubusercontent.com/HeyHeyChicken/BattlePlan-Discord-weapons-bot/refs/heads/main/.github/gitLogo.png" width="18" /> Git](https://git-scm.com/)<br/>

## ⬇️ Installation

1. Clone it directly from GitHub.

```
git clone https://github.com/HeyHeyChicken/BattlePlan-Discord-weapons-bot.git
```

2. Install packages

```
cd BattlePlan-Discord-weapons-bot
```

```
npm install
```

## 🚀 Usage

1. Launch this command.

```
cd src
```

```
node index.js
```

2. If you start the project for the first time, it will ask you to set the "discord_bot_token" in the "/settings.json" file.

<br>
<br>

Created by [Antoine Duval (HeyHeyChicken)](//antoine.cuffel.fr) with ❤ and ☕ (chocolate) in [Mesnil-Panneville](//en.wikipedia.org/wiki/Mesnil-Panneville).
