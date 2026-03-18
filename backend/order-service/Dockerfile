FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN apk add --no-cache maven
RUN mvn clean install -N -DskipTests
COPY common/pom.xml ./common/
COPY order-service/pom.xml ./order-service/
COPY common/src ./common/src
COPY order-service/src ./order-service/src
WORKDIR /app/common
RUN mvn clean install -DskipTests
WORKDIR /app/order-service
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/order-service/target/order-service-1.0.0-SNAPSHOT.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]
