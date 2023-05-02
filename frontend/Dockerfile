FROM maven:3.6.0-jdk-11-slim AS build

COPY ./src /home/cli/src
COPY ./pom.xml /home/cli

RUN mvn -f /home/cli/pom.xml clean package

FROM openjdk:11-jre-slim

WORKDIR /cli

COPY --from=build /home/cli/target/frontend-1.0-SNAPSHOT-jar-with-dependencies.jar /usr/local/lib/frontend.jar

CMD ["java", "-jar", "/usr/local/lib/frontend.jar"]