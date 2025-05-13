# Step 1: Build the React + Vite application
FROM node:20 AS build

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of your app's source code to the container
COPY . .

# Build the app (this will create a production build in the dist/ folder)
RUN npm run build

# Step 2: Serve the built application using a lightweight web server (nginx)
FROM nginx:alpine AS production

# Copy the build output from the previous step to the Nginx folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
