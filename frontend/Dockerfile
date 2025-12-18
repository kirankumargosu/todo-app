# -------- Build stage --------
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY . .

EXPOSE 3000
CMD ["npm", "start"]