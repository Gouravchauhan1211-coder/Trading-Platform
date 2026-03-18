FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN apk add --no-cache maven
RUN mvn clean install -N -DskipTests
COPY common/pom.xml ./common/
COPY risk-service/pom.xml ./risk-service/
COPY common/src ./common/src
COPY risk-service/src ./risk-service/src
WORKDIR /app/common
RUN mvn clean install -DskipTests
WORKDIR /app/risk-service
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/risk-service/target/*.jar app.jar
EXPOSE 8086
ENTRYPOINT ["java", "-jar", "app.jar"]
