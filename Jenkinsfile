pipeline {
    agent { label 'linux' }

    stages {
        stage('Clone') {
            steps {
                git 'https://github.com/siddhantgorte/blog_application.git'
            }
        }

        stage('Install') {
            steps {
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
    }
}