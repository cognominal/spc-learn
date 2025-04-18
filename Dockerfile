# Use official Node.js image as the base
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy the rest of the app
COPY . .

# Build the app
RUN pnpm run build

# Expose the port your app runs on (default for SvelteKit preview is 3000)
EXPOSE 3000

# Start the app
CMD ["pnpm", "run", "preview", "--", "--port", "3000", "--host", "0.0.0.0"]
