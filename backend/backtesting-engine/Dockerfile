FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN apk add --no-cache maven
RUN mvn clean install -N -DskipTests
COPY common/pom.xml ./common/
COPY backtesting-engine/pom.xml ./backtesting-engine/
COPY common/src ./common/src
COPY backtesting-engine/src ./backtesting-engine/src
WORKDIR /app/common
RUN mvn clean install -DskipTests
WORKDIR /app/backtesting-engine
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/backtesting-engine/target/*.jar app.jar
EXPOSE 8087
ENTRYPOINT ["java", "-jar", "app.jar"]
