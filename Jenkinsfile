pipeline {
    agent any
    environment{
        LOCAL_SERVER = '192.168.1.77'
    }
    tools {
        maven 'M3_8_2'
        nodejs 'NodeJS12'    
    }
    stages {
        stage('Build and Analize Backend') {
            steps {
                echo 'Building Backend'
                dir('microservicio-service/'){
                    echo 'Execute Maven and Analizing with SonarServer'
                        sh "mvn clean package \
                            -Djacoco.output=tcpclient \
                            -Djacoco.address=127.0.0.1 \
                            -Djacoco.port=10001"                    
                }
            }
        }

        /*
        stage('Build Frontend') {
            steps {
                echo 'Building Frontend'
                dir('frontend/'){
                    sh 'npm install'
                    sh 'npm run build'
                    sh 'docker stop frontend-one || true'
                    sh "docker build -t frontend-web ."
                    sh 'docker run -d --rm --name frontend-one -p 8010:80 frontend-web'
                }
            }
        }
        */

        /*
        stage('Quality Gate'){
            steps {
                    timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
                }
            }
        }
        */
        
        stage('Database') {
            steps {
                dir('liquibase/'){
                    sh '/opt/liquibase/liquibase --version'
                    sh '/opt/liquibase/liquibase --changeLogFile="changesets/db.changelog-master.xml" update'
                    echo 'Applying Db changes'
                }
            }
        }

        stage('Container Build') {
            steps {
                dir('microservicio-service/'){
                    withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'dockerhub_id', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {
                        sh 'docker login -u $USERNAME -p $PASSWORD'
                        sh 'docker build -t microservicio-service .'
                    }
                }
            }
        }
        /*
        stage('Container Push Nexus') {
            steps {
                withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'dockernexus', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {
                    sh 'docker login ${LOCAL_SERVER}:8083 -u $USERNAME -p $PASSWORD'
                    sh 'docker tag microservicio-service:latest  ${LOCAL_SERVER}:8083/repository/docker-private/microservicio_nexus:dev'
                    sh 'docker push ${LOCAL_SERVER}:8083/repository/docker-private/microservicio_nexus:dev'                    
                }            
            }
        }        
        */
        stage('Container Run') {
            steps {
                //Esto solo es borrar la imagen para ver que se bajse del repo
                //sh 'docker rmi ${LOCAL_SERVER}:8083/repository/docker-private/microservicio_nexus:dev'
                sh 'docker stop microservicio-one || true'
                //Para poner que ambiente, desarrollo, pruebas, prod SPRING_PROFILE_ACTIVE para lo de DB del microservicio
                //sh 'docker run -d --rm --name microservicio-one -e SPRING_PROFILES_ACTIVE=qa -p 8090:8090 ${LOCAL_SERVER}:8083/repository/docker-private/microservicio_nexus:dev'              
                sh 'docker run -d --rm --name microservicio-one -e SPRING_PROFILES_ACTIVE=qa -p 8090:8090 microservicio-service'       
            }
        }

        /*
        stage('Testing') {
            steps {
                dir('cypress/') {
                    sh 'docker run --rm --name Cypress -v /Users/livierortegavelazquez/Documents/GitHub/EcosistemaJenkins/jenkins_home/workspace/Microservicio/Cypress:/e2e -w /e2e -e Cypress cypress/included:3.4.0'
                }
            }
        }*/

        /*
        stage('tar videos') 
        {
            steps 
            {
                dir('cypress/cypress/videos/') {
                    sh 'tar -cvf videos.tar .'
                    archiveArtifacts artifacts: 'videos.tar',
                    allowEmptyArchive: true
                }
            }
        }*/

        stage('Estress') {
            steps {
                dir('Gatling/'){
                    sh 'mvn gatling:test'
                }
            }
            post {
                always {
                    gatlingArchive()
                }
            }
        }
    }

    post {
        always {
            deleteDir()
        }
        success {
            echo 'I succeeeded!'
        }
        unstable {
            echo 'I am unstable :/'
        }
        failure {
            echo 'I failed :('
        }
        changed {
            echo 'Things were different before...'
        }
    }
}