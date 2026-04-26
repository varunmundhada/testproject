# Selenium Tests for Student Feedback App

This folder contains UI automation tests written in Java with Selenium + JUnit 5.

## Prerequisites

- Java 17+
- Maven 3.8+
- Google Chrome installed
- Student Feedback app running at `http://localhost:3000`

## Run in Eclipse

1. Open Eclipse
2. File -> Import -> Maven -> Existing Maven Projects
3. Select this folder: `selenium-tests`
4. Wait for dependencies to download
5. Ensure the web app is running (`npm start` in project root)
6. Right click `StudentFeedbackSeleniumTest` -> Run As -> JUnit Test

## Run from terminal

```bash
cd selenium-tests
mvn test
```

Headless mode:

```bash
cd selenium-tests
mvn test -Dheadless=true
```

Custom app URL:

```bash
cd selenium-tests
mvn test -Dapp.url=http://localhost:3000
```
