# Используем официальный образ Node.js как базовый
FROM node

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь исходный код приложения
COPY . .

# Открываем порт 5173
EXPOSE 5173

# Запускаем приложение
CMD ["npm", "run", "dev"]
