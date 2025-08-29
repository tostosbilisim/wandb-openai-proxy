# Stage 1: Build the application
FROM denoland/deno:alpine AS build

WORKDIR /app

# Cache dependencies
COPY deno.json .
# It's often better to cache dependencies for main.ts and any other entry points
RUN deno cache main.ts --config deno.json

# Copy source code and compile
COPY src/ ./src/
COPY main.ts .
COPY config.ts .
# Ensure permissions are set for the output file if needed
RUN deno compile --allow-net --allow-env --config deno.json --output server main.ts

# Stage 2: Create the final, small image
# Use a minimal base image without a pre-configured entrypoint
FROM gcr.io/distroless/static-debian11

WORKDIR /app

# Copy the compiled executable from the build stage
COPY --from=build /app/server .

# Expose the port the app runs on
EXPOSE 8000

# Set the entrypoint to be your compiled application
ENTRYPOINT ["./server"]