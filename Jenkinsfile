pipeline {

    	agent {
        	label 'dev-runner'
    	}

        stage('UpDev') {
            when {
                expression {
                    return env.BRANCH_NAME.startsWith('release/') || env.BRANCH_NAME == 'develop'
                }
            }
            steps {
                 script {
                     sh 'docker rm -f miniapp || true'
                     sh 'docker run -d --network=shared-network --name miniapp -p 5173:5173 miniapp:latest'
                 }
            }
        }
        stage('UpProd') {
            when {
                expression {
                    return env.BRANCH_NAME.startsWith('release/') || env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'staging' 
                }
            }
            agent {
                label 'PROD-1'
            }
            steps {
                 script {
                     sh 'docker rm -f miniapp || true'
                     sh 'docker run -d --network=shared-network --name miniapp -p 5173:5173 miniapp:latest'
                 }
            }
        }
        
    }
}

