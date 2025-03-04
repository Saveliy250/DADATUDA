pipeline {
    agent {
        docker {
            image 'docker:latest' // Or a specific version if needed
            label 'dind' // Requires a Jenkins agent with Docker installed and configured.
            args '-v /var/run/docker.sock:/var/run/docker.sock' // Allows Docker commands to run on the host's Docker daemon. VERY IMPORTANT for Docker-in-Docker!
        }
    }
    stages {
        stage('Build') {
            steps {
                script {
                    echo "Building Docker image..."
                    sh 'docker build -t miniapp:latest .'
                }
            }
        }
        stage('Run') {
            steps {
                script {
                    echo "Running Docker container..."
                    sh 'docker rm -f miniapp || true'
                    sh 'docker run -d --name miniapp -p 5173:5173 miniapp:latest'
                }
            }
        }
    }
}