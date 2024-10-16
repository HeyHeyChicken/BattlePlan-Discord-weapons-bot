# Utiliser l'image officielle Node.js
FROM node:20

# Créer un répertoire de l'application
WORKDIR /usr/src/app

# Cloner le dépôt
RUN git clone https://github.com/HeyHeyChicken/BattlePlan-Discord-weapons-bot.git

# Installer les dépendances
WORKDIR /usr/src/app/BattlePlan-Discord-weapons-bot
RUN npm install

# Commande pour démarrer l'application
CMD ["node", "src/index.js"]