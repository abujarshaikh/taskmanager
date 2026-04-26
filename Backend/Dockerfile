# Stage 1 — build
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN MAVEN_OPTS="-Xmx512m" ./mvnw dependency:resolve -q
COPY src/ src/
RUN MAVEN_OPTS="-Xmx512m" ./mvnw clean package -DskipTests -q

# Stage 2 — run
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/taskmanager-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Xmx400m", "-Xms200m", "-jar", "app.jar"]
