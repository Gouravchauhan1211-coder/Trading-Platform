FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN apk add --no-cache maven
RUN mvn clean install -N -DskipTests
COPY common/pom.xml ./common/
COPY realtime-gateway/pom.xml ./realtime-gateway/
COPY common/src ./common/src
COPY realtime-gateway/src ./realtime-gateway/src
WORKDIR /app/common
RUN mvn clean install -DskipTests
WORKDIR /app/realtime-gateway
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/realtime-gateway/target/*.jar app.jar
EXPOSE 8088
ENTRYPOINT ["java", "-jar", "app.jar"]
