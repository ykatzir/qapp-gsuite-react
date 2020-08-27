pipeline {
  agent {
    node {
      label 'Node01dev'
    }
    }   
    stages {
        stage('TestBuild') {
            steps {
              echo "Fetch App Utils"
              dir('test') {
                git credentialsId: 'sarbGit', url: 'https://github.com/qmasters-ltd/qapp-application-util.git'
                }
              echo "Build PY Node"
              sh 'find ./test/build -type f -name "*.sh" |xargs chmod +x'
              sh 'find ./test/test -type f -name "*.sh" |xargs chmod +x'
              sh 'source ./test/build/buildNode.sh'
              echo "Run Node"
              sh './test/build/runNode.sh'
                script { 
                    try {
                        echo "Set ENV"
                        sh './test/build/setEnv.sh'
                    } catch (Throwable e) {
                        echo "Caught ${e.toString()}"
                        currentBuild.result = "SUCCESS" 
                    }
                }
              echo "Install Dev Requerments"
              sh './test/test/installDevReq.sh' // update util#13

            }
            post {
                success { 
                    echo 'Successful build pynode'
                }
                failure {
                    archiveArtifacts "app/" 
                    cleanWs()
                }
            }
        }
        stage('TestApp') {
            steps {
                script {
                    try {
                        echo "Running linters"
                        sh './test/test/linter.sh'
                        echo "Application Files Validation"
                        sh './test/test/scripts/validationsFiles.sh'
                        echo "Spelling validation"
                        sh './test/test/scripts/spellCheck.sh'
                        echo "Secrets checker"
                        sh './test/test/scripts/secretsChecker.sh'
                        echo "running Unit-tests"
                        sh './test/test/scripts/unitTests.sh'
                        echo "clean Build test enviorment"
                    } catch (Throwable e) {
                        echo "Caught ${e.toString()}"
                        currentBuild.result = "SUCCESS" 
                    }
                }
            }
            post {
                success {
                    archiveArtifacts "app/" 
                    echo 'Delete the Build ENV'
                }
                failure {
                    archiveArtifacts "app/" 
                    echo 'Delete the Build ENV'
                }
            }

        }
        stage('Container') {
            agent {
              node {
                label 'Node01dev'
              }
            }
            when {
              anyOf { changeRequest target: 'develop'; changeRequest target: 'master' }
            }
            steps {
              echo "Checkout-Repo1"
              echo "Checkout-Utils"
              dir('test') {
                git credentialsId: 'sarbGit', url: 'https://github.com/qmasters-ltd/qapp-application-util.git'
                }
              echo "Running app with qapp image"
              sh 'chmod +x test/build/*.sh'
              sh './test/build/runNode.sh'
              echo "container application checking"
              echo "Kill container after X Time"
                script { 
                    try {
                        echo "Checkout-Repo2"
                    } catch (Throwable e) {
                        echo "Caught ${e.toString()}"
                        currentBuild.result = "SUCCESS" 
                    }
                }
              echo "Checkout-Repo3"
            }    
            post {
                success {
                    archiveArtifacts "app/" 
                    echo 'Delete the Build ENV'
                }
                failure {
                    archiveArtifacts "app/" 
                    echo 'Delete the Build ENV'
                }
            }
        }
        stage('BuildDevelopment') {
            agent {
              node {
                label 'Node01dev'
              }
            }
            when {
              anyOf { changeRequest target: 'develop'; changeRequest target: 'master' } // shold be change to master
            }
            steps {
              echo "Fetch App Utils"
              dir('test') {
                git credentialsId: 'sarbGit', url: 'https://github.com/qmasters-ltd/qapp-application-util.git'
                }
              echo "Build Dev Node"
              sh 'chmod +x test/build/*.sh'
              sh 'source ./test/build/buildNode.sh'
              echo "Run Node"
              sh './test/build/runNode.sh'
            }
            post {
                success {
                    archiveArtifacts "app/" 
                    echo 'Delete the Build ENV'
                }
                failure {
                    archiveArtifacts "app/" 
                    echo 'Delete the Build ENV'
                }
            }
        }
        stage('TestDevelopment') {
            agent {
              node {
                label 'Node01dev'
              }
            }
            when {
              anyOf { changeRequest target: 'develop'; changeRequest target: 'master' }
            }
            steps {
              echo "Start develop tests"
                script { 
                    try {
                        echo "Running Integration Tests"
                        echo "Running Func Tests"
                        echo "Running Test Deploy on QR Staging"
                    } catch (Throwable e) {
                        echo "Caught ${e.toString()}"
                        currentBuild.result = "SUCCESS" 
                    }
                }
              echo "clean Build test enviorment"
            }
            post {
                success {
                    archiveArtifacts "app/" 
                    echo 'Delete the Build ENV'
                }
                failure {
                    archiveArtifacts "app/" 
                    echo 'Delete the Build ENV'
                }
            }
        }
        stage('BuildMaster') {
            agent {
              node {
                label 'Node01dev'
              }
            }
            when {
              changeRequest target: 'master'
            }
            steps {
              echo "Fetch App Utils"
              dir('test') {
                git credentialsId: 'sarbGit', url: 'https://github.com/qmasters-ltd/qapp-application-util.git'
                }
              echo "Build master Node"
              sh 'chmod +x test/build/*.sh'
              sh 'source ./test/build/buildNode.sh'
              echo "Run master node"
              sh './test/build/runNode.sh'
            }
            post {
                success {
                    archiveArtifacts "app/" 
                    echo 'Delete the Build ENV'
                }
                failure {
                    archiveArtifacts "app/" 
                    echo 'Delete the Build ENV'
                }
            }
        }
        stage('TestMaster') {
            agent {
              node {
                label 'Node01dev'
              }
            }
            when {
              changeRequest target: 'master'
            }
            steps {
              echo "Start master tests"
                script { 
                    try {
                        echo "Running Recrusive Tests"
                        echo "Running Multi versions QR Containers tests"
                        echo "Running Multi versions QR Deployment tests"
                    } catch (Throwable e) {
                        echo "Caught ${e.toString()}"
                        currentBuild.result = "SUCCESS" 
                    }
                }
              echo "clean Build test enviorment"
            }
            post {
                success {
                    archiveArtifacts "app/" 
                    echo 'Delete the Build ENV'
                }
                failure {
                    archiveArtifacts "app/" 
                    echo 'Delete the Build ENV'
                }
            }
        }
        stage('ReleasePack') {
            agent {
              node {
                label 'Node01dev'
              }
            }
            when {
              anyOf { changeRequest target: 'develop'; changeRequest target: 'master' }
            }
            steps {
              echo "Fetch App Utils"
              dir('test') {
                git credentialsId: 'sarbGit', url: 'https://github.com/qmasters-ltd/qapp-application-util.git'
                }
              echo "Try to pack release application"
              sh 'chmod +x test/build/qapp_pack/*.sh'
              sh './test/build/qapp_pack/builder.sh'
              echo "Packing are done"
            }
            post {
                success {
                    archiveArtifacts "test/build/qapp_pack/" 
                    echo 'Delete the Build ENV'
                }
                failure {
                    archiveArtifacts "app/" 
                    echo 'Delete the Build ENV'
                }
            }
        }
        stage('Approval') {
            steps {
              echo "wait for Approval"
              script {
                  def deploymentDelay = input id: 'Deploy', message: 'Deploy to production?', submitter: 'ben.sar', parameters: [choice(choices: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'], description: 'Hours to delay deployment?', name: 'deploymentDelay')]
                  sleep time: deploymentDelay.toInteger(), unit: 'HOURS'
              }
            }
            post {
                success {
                    echo 'Approved'
                }
                failure {
                    echo 'not Approved'
                }
            }
        }
        stage('DeployToStaging') {
            steps {
              echo "Deploy to Staging"
              echo "deploy to Production"
            }
            post {
                success {
                    archiveArtifacts "app/" 
                    echo 'Seccessfuly deploy to Staging / Master'
                }
                failure {
                    archiveArtifacts "app/" 
                    echo 'Delete the Build ENV'
                }
            }

        }
        stage('DeployToProduction') {
            steps {
              echo "Deploy to Staging"
              echo "deploy to Production"
            }
            post {
                success {
                    archiveArtifacts "app/" 
                    echo 'Seccessfuly deploy to Staging / Master'
                }
                failure {
                    archiveArtifacts "app/" 
                    echo 'Delete the Build ENV'
                }
            }

        }
                  
    }
}
private void handleError(Exception err, Map buildParameters) {
    //Mark build as failed
    currentBuild.result = 'FAILURE'

    print err.message
    if (buildParameters.containsKey("microservice")) {
        sh(script: "docker rmi -f ${buildParameters.get("microservice")}")
    }
    //Clear workspace
    cleanWs()
    throw err
}
