FROM node:20

WORKDIR /app

# Copia package.json primero para aprovechar cache
COPY package.json package-lock.json* ./

# Instala dependencias
RUN npm install --legacy-peer-deps

# Copia el resto del proyecto
COPY . .

ENV CHOKIDAR_USEPOLLING=true

EXPOSE 3000

# Levanta React escuchando en todas las interfaces
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
