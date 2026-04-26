pipeline {
    agent any

    environment {
        NODE_HOME = tool 'NodeJS'
        PATH = "${NODE_HOME}/bin:${PATH}"
        JAVA_HOME = tool 'JDK17'
        PATH = "${JAVA_HOME}/bin:${PATH}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }
        

        stage('Build Node App') {
            steps {
                echo 'Installing Node dependencies...'
                sh 'npm install'
            }
        }

        stage('Start Web App') {
            steps {
                echo 'Starting web app on port 3000...'
                sh 'npm start > app.log 2>&1 &'
                sleep(time: 5, unit: 'SECONDS')
                sh 'curl -f http://localhost:3000 || exit 1'
            }
        }

        stage('Run Selenium Tests') {
            steps {
                echo 'Running Selenium tests...'
                dir('selenium-tests') {
                    sh 'mvn clean test'
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
            echo 'Cleaning up...'
            sh 'pkill -f "node server.js" || true'
            sh 'pkill -f "chromedriver" || true'
        }

        success {
            echo '✓ All tests passed!'
        }

        failure {
            echo '✗ Tests failed!'
            archiveArtifacts artifacts: 'app.log,selenium-tests/target/surefire-reports/**', allowEmptyArchive: true
        }
    }
}
