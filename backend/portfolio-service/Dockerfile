FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN apk add --no-cache maven
RUN mvn clean install -N -DskipTests
COPY common/pom.xml ./common/
COPY portfolio-service/pom.xml ./portfolio-service/
COPY common/src ./common/src
COPY portfolio-service/src ./portfolio-service/src
WORKDIR /app/common
RUN mvn clean install -DskipTests
WORKDIR /app/portfolio-service
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/portfolio-service/target/*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar"]
