###########################################
# STAGE 1 — Build the Spring Boot App
###########################################
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom.xml and download dependencies first (cache layer)
COPY pom.xml .
RUN mvn -e -B dependency:resolve dependency:resolve-plugins

# Copy source code
COPY src ./src

# Build the application (skip tests if needed)
RUN mvn -e -B clean package -DskipTests

###########################################
# STAGE 2 — Create a lightweight JRE runtime image
###########################################
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the final jar from the build stage
COPY --from=build /app/target/cakedaddy-1.0.0.jar app.jar

# Expose Spring Boot port
EXPOSE 8080

# Start the Spring Boot application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

