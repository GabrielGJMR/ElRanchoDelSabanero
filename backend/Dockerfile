# syntax=docker/dockerfile:1
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline
COPY src src
RUN ./mvnw -B -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S rancho && adduser -S rancho -G rancho
WORKDIR /app
COPY --from=build /app/target/backend-*.jar app.jar
RUN mkdir -p /data/uploads && chown -R rancho:rancho /data/uploads
USER rancho
ENV UPLOADS_DIR=/data/uploads
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
