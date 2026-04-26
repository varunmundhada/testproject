package com.example;

import io.github.bonigarcia.wdm.WebDriverManager;
import java.time.Duration;
import java.time.Instant;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

class StudentFeedbackSeleniumTest {

    private static WebDriver driver;
    private static WebDriverWait wait;
    private static String appUrl;

    @BeforeAll
    static void setUp() {
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        if (Boolean.parseBoolean(System.getProperty("headless", "false"))) {
            options.addArguments("--headless=new");
            options.addArguments("--window-size=1920,1080");
        }

        driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(4));
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        appUrl = System.getProperty("app.url", "http://localhost:3000");
    }

    @AfterAll
    static void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    void shouldSubmitFeedbackSuccessfully() {
        driver.get(appUrl);

        String unique = String.valueOf(Instant.now().toEpochMilli());
        String studentName = "Test Student " + unique;
        String email = "student" + unique + "@example.com";
        String course = "DevOps";
        String feedbackText = "This subject is practical and useful for real projects.";

        driver.findElement(By.id("studentName")).sendKeys(studentName);
        driver.findElement(By.id("email")).sendKeys(email);
        driver.findElement(By.id("course")).sendKeys(course);

        Select ratingSelect = new Select(driver.findElement(By.id("rating")));
        ratingSelect.selectByValue("5");

        driver.findElement(By.id("feedbackText")).sendKeys(feedbackText);
        driver.findElement(By.cssSelector("button[type='submit']")).click();

        WebElement message = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.id("formMessage"))
        );

        Assertions.assertTrue(
                message.getText().toLowerCase().contains("successfully"),
                "Expected success confirmation message after form submission"
        );

        WebElement feedbackList = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.id("feedbackList"))
        );

        String listText = feedbackList.getText();
        Assertions.assertTrue(listText.contains(studentName), "New feedback should appear in the list");
        Assertions.assertTrue(listText.contains(course), "Submitted course should appear in the list");
    }

    @Test
    void shouldShowValidationErrorForInvalidForm() {
        driver.get(appUrl);

        driver.findElement(By.id("studentName")).sendKeys("A");
        driver.findElement(By.id("email")).sendKeys("not-an-email");
        driver.findElement(By.id("course")).sendKeys("D");
        driver.findElement(By.id("feedbackText")).sendKeys("short");
        driver.findElement(By.cssSelector("button[type='submit']")).click();

        WebElement message = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.id("formMessage"))
        );

        Assertions.assertFalse(
                message.getText().isBlank(),
                "Expected validation error message for invalid form data"
        );
    }
}
