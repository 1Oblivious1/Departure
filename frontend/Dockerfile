# Этап для установки зависимостей
FROM node:20 AS build

# Указываем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json для установки зависимостей
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все остальные файлы проекта
COPY . .

# Выполняем сборку фронтенда (если необходимо)
RUN npm run build

# Экспонируем порты
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]
