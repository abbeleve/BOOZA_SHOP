# rms_front/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем проект (для production)
# RUN npm run build

# Открываем порт Vite
EXPOSE 5173

# Запускаем dev-сервер с хостом 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]