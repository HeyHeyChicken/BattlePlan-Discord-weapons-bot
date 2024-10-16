# Utiliser l'image officielle Node.js
FROM node:20

# Installe les dépendances nécessaires pour Puppeteer
RUN apt-get update && apt-get install -y \
    git \
    wget \
    gnupg2 \
    libnss3 \
    libgconf-2-4 \
    libxss1 \
    libasound2 \
    libcups2 \
    libx11-xcb1 \
    libxcomposite1 \
    libxrandr2 \
    libgbm-dev \
    libatk1.0-0 \
    libcairo2 \
    libgtk-3-0 \
    libx11-6 \
    libxext6 \
    libxrender1 \
    libxi6 \
    libxtst6 \
    libpulse0 \
    libjpeg62-turbo \
    libpng16-16 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Créer un répertoire de l'application
WORKDIR /usr/src/app

# Cloner le dépôt
RUN git clone https://github.com/HeyHeyChicken/BattlePlan-Discord-weapons-bot.git

# Installer les dépendances
WORKDIR /usr/src/app/BattlePlan-Discord-weapons-bot
RUN npm install

# Partager le fichier settings.json
COPY settings.json /usr/src/app/BattlePlan-Discord-weapons-bot/settings.json

# Expose le port si nécessaire (par exemple, 3000)
EXPOSE 3000

# Commande pour démarrer l'application
WORKDIR /usr/src/app/BattlePlan-Discord-weapons-bot/src
CMD ["node", "index.js"]