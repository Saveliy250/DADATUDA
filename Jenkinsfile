@Library('maven-lib@1.0.4') _
pipeline {

    agent any
    stages {
        stage('Docker Deploy && Deploy to ArgoCD') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    def result = makeDockerImageInfo('tg-miniapp', 'dada', '1.0.0')
                    echo result
                    def image = result.getName() + ':' + result.getTag()
                    echo image
                    withCredentials([usernamePassword(credentialsId: 'docker-nexus-admin-psws', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_LOGIN')]) {
                        sh """
                                docker build -f Dockerfile.dev -t ${image} .
                                echo "\${DOCKER_LOGIN}" | docker login nexus.dada-tuda.ru -u \${DOCKER_USERNAME} --password-stdin
                                docker push ${image}
                                docker rmi ${image} || true
                               """
                    }
                    deployToArgo('ssh://git@bitbucket.dada-tuda.ru:7999/dada/dada-argo.git', 'services/tg-miniapp/values-dev.yaml', result.getTag(), 'develop')
                }
            }
        }
        stage('Docker Deploy && Deploy to ArgoCD PROD') {
            when {
                branch 'master'
            }
            steps {
                script {
                    def result = makeDockerImageInfo('tg-miniapp-server', 'dada', '1.0.0')
                    echo result
                    def image = result.getName() + ':' + result.getTag()
                    echo image
                    withCredentials([usernamePassword(credentialsId: 'docker-nexus-admin-psws', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_LOGIN')]) {
                        sh """
                                docker build -f Dockerfile.prod -t ${image} .
                                echo "\${DOCKER_LOGIN}" | docker login nexus.dada-tuda.ru -u \${DOCKER_USERNAME} --password-stdin
                                docker push ${image}
                                docker rmi ${image} || true
                               """
                    }
                    deployToArgo('ssh://git@bitbucket.dada-tuda.ru:7999/dada/dada-argo.git', 'services/tg-miniapp/values-prod.yaml', result.getTag(), 'develop')
                }
            }
        }
    }
}

