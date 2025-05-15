@Library('maven-lib@1.0.4') _
pipeline {

    agent {
        label 'dev-runner'
    }
    stages {
    stage('Docker Deploy && Deploy to ArgoCD') {
                        when {
                            anyOf {
                                branch 'develop'
                                branch 'master'
                            }
                        }
                        steps {
                            script {
                                def result = makeDockerImageInfo('tg-miniapp', 'dada', '1.0.0')
                                echo result
                                def image = result.getName()+':'+result.getTag()
                                echo image
                                withCredentials([usernamePassword(credentialsId: 'docker-nexus-admin-psws', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_LOGIN')]) {
                                    sh """
                                docker build -t ${image} .
                                echo "\${DOCKER_LOGIN}" | docker login nexus.dada-tuda.ru -u \${DOCKER_USERNAME} --password-stdin
                                docker push ${image}
                                docker rmi ${image} || true
                               """
                                }
                                deployToArgo('ssh://git@bitbucket.dada-tuda.ru:7999/dada/dada-argo.git', 'services/tg-miniapp/charts/app/values.yaml', result.getTag(), 'develop')
                            }
                        }
                    }
        stage('UpDev') {
            when {
                expression {
                    return  env.BRANCH_NAME == 'develop'
                }
            }
             steps {
                script {
                   	sh 'docker build -t miniapp:latest .'
                  	sh 'docker rm -f miniapp || true'
                    sh 'docker run -d --network=shared-network --name miniapp -p 5173:5173 miniapp:latest'
                }
            }
        }
        stage('UpProd') {
            when {
                expression {
                    return env.BRANCH_NAME.startsWith('release/')
                }
            }
            agent {
                label 'PROD-1'
            }
            steps {
                script {
                   	sh 'docker build -t miniapp:latest .'
                  	sh 'docker rm -f miniapp || true'
                    sh 'docker run -d --network=shared-network --name miniapp -p 5173:5173 miniapp:latest'
                }
            }
        }
    }
}

