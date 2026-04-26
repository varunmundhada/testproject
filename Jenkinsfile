pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }

        stage('Verify Tooling') {
            steps {
                echo 'Verifying required tools are available on Jenkins agent...'
                bat 'node -v'
                bat 'npm -v'
                bat 'java -version'
                bat 'where mvn >nul 2>nul || (echo Maven (mvn) not found in PATH. Install Maven on the agent or configure Jenkins Global Tool and update Jenkinsfile.& exit /b 1)'
                bat 'mvn -v'
            }
        }

        stage('Build Node App') {
            steps {
                echo 'Installing Node dependencies...'
                bat 'npm install'
            }
        }

        stage('Start Web App') {
            steps {
                echo 'Starting web app on port 3000...'
                bat 'start /B node server.js > app.log 2>&1'
                sleep(time: 5, unit: 'SECONDS')
                bat 'timeout /t 3 && curl -f http://localhost:3000 || exit 1'
            }
        }

        stage('Run Selenium Tests') {
            steps {
                echo 'Running Selenium tests...'
                dir('selenium-tests') {
                    bat 'mvn clean test -DskipTests=false'
                }
            }
        }

        stage('Publish Test Results') {
            steps {
                echo 'Publishing test results...'
                junit 'selenium-tests/target/surefire-reports/*.xml'
            }
        }
    }

    post {
        always {
            script {
                node {
                    echo 'Cleaning up...'
                    bat 'taskkill /F /IM node.exe /T 2>nul || exit 0'
                    bat 'taskkill /F /IM chromedriver.exe /T 2>nul || exit 0'
                }
            }
        }

        success {
            echo '✓ All tests passed!'
        }

        failure {
            echo '✗ Tests failed!'
            script {
                node {
                    archiveArtifacts artifacts: 'app.log,selenium-tests/target/surefire-reports/**', allowEmptyArchive: true
                }
            }
        }
    }
}
