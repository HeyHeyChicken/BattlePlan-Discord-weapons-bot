# Utiliser l'image officielle Node.js
FROM node:20

# Installer Git
RUN apt-get update && apt-get install -y git

# Créer un répertoire de l'application
WORKDIR /usr/src/app

# Cloner le dépôt
RUN git clone https://github.com/HeyHeyChicken/BattlePlan-Discord-weapons-bot.git
WORKDIR /usr/src/app/BattlePlan-Discord-weapons-bot
RUN git pull

# Installer les dépendances
RUN npm install

# Commande pour démarrer l'application
CMD ["node", "index.js"]
