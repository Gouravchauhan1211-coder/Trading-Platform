FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN apk add --no-cache maven
RUN mvn clean install -N -DskipTests
COPY common/pom.xml ./common/
COPY user-service/pom.xml ./user-service/
COPY common/src ./common/src
COPY user-service/src ./user-service/src
WORKDIR /app/common
RUN mvn clean install -DskipTests
WORKDIR /app/user-service
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/user-service/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
