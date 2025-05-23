# Generated by https://smithery.ai. See: https://smithery.ai/docs/config#dockerfile
# Use the official Node.js image as a base image
FROM node:16-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json tsconfig.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY src ./src

# Build the application
RUN npm run build

# Use a smaller image for the final build
FROM node:16-alpine AS release

# Set the working directory
WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /app/build ./build

# Copy package.json and package-lock.json to the working directory
COPY package.json ./

# Install production dependencies
RUN npm install --omit=dev

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "build/index.js"]