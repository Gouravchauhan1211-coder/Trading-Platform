FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN apk add --no-cache maven
RUN mvn clean install -N -DskipTests
COPY common/pom.xml ./common/
COPY strategy-engine/pom.xml ./strategy-engine/
COPY common/src ./common/src
COPY strategy-engine/src ./strategy-engine/src
WORKDIR /app/common
RUN mvn clean install -DskipTests
WORKDIR /app/strategy-engine
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/strategy-engine/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
