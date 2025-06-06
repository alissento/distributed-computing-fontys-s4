# Step 1: Use a Gradle base image with JDK 21 to build the project
FROM gradle:8.13.0-jdk21 AS build

WORKDIR /opt/app

# Copy Gradle wrapper and project files into the container
COPY . /opt/app

RUN chmod +x /opt/app/gradlew

# Run Gradle to build the project
RUN ./gradlew assemble

# Step 2: Use a lightweight image for running the application
FROM eclipse-temurin:24-jre-alpine

WORKDIR /opt/app

# Copy the built JAR file from the build stage
COPY --from=build /opt/app/build/libs/DCS4-Backend-0.0.1-SNAPSHOT.jar .

# Expose port 8080
EXPOSE 8080

# Run the application
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar DCS4-Backend-0.0.1-SNAPSHOT.jar"]
