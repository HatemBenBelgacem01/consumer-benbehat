FROM eclipse-temurin:25-jdk-noble

WORKDIR /usr/src/app

COPY src src
COPY .mvn .mvn
COPY pom.xml mvnw ./

# Line-Endings fixen (für Windows-Nutzer) und ausführbar machen
RUN sed -i 's/\r$//' mvnw
RUN chmod +x mvnw

# App bauen (Tests überspringen)
RUN ./mvnw -Dmaven.test.skip=true package

EXPOSE 8083

CMD ["java", "-jar", "/usr/src/app/target/consumer-benbehat-0.0.1-SNAPSHOT.jar"]