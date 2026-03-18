FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN apk add --no-cache maven
RUN mvn clean install -N -DskipTests
COPY common/pom.xml ./common/
COPY market-data-service/pom.xml ./market-data-service/
COPY common/src ./common/src
COPY market-data-service/src ./market-data-service/src
WORKDIR /app/common
RUN mvn clean install -DskipTests
WORKDIR /app/market-data-service
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/market-data-service/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
