 pipeline {
     agent { label 'dev-runner' }
       stages {
         stage('Build') {
             steps {
                 script {
                     sh 'docker build -t miniapp:latest .'
                 }
             }
         }

         stage('Run') {
             steps {
                 script {
                     sh 'docker rm -f miniapp || true'
                     sh 'docker run -d --network=shared-network --name miniapp -p 5173:5173 miniapp:latest'
                 }
             }
         }
     }
 }