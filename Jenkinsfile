pipeline {
    agent any
    environment{
        LOCAL_SERVER = '192.168.1.90'
    }
    tools {
        maven 'M3_8_2'
    }
    stages {
        stage('Build and Analize') {
            steps {
                dir('microservicio-service/'){
                    echo 'Execute Maven and Analizing with SonarServer'
                    withSonarQubeEnv('SonarServer') {
                        sh "mvn clean package \
                            -Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml \
                            -Djacoco.output=tcpclient \
                            -Djacoco.address=127.0.0.1 \
                            -Djacoco.port=10001"
                    }
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

        stage('Container Push Nexus') {
            steps {
                withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'dockernexus', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {
                    sh 'docker login ${LOCAL_SERVER}:8083 -u $USERNAME -p $PASSWORD'
                    sh 'docker tag microservicio-service:latest  ${LOCAL_SERVER}:8083/repository/docker-private/microservicio_nexus:dev'
                    sh 'docker push ${LOCAL_SERVER}:8083/repository/docker-private/microservicio_nexus:dev'                    
                }            
            }
        }
        
        /*
        stage('Quality Gate'){
            steps {
                    timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
                }
            }
        }
        */

        stage('Container Run') {
            steps {
                sh 'docker rmi ${LOCAL_SERVER}:8083/repository/docker-private/microservicio_nexus:dev'
                sh 'docker stop microservicio-one || true'
                sh 'docker run -d --rm --name microservicio-one -p 8090:8090 ${LOCAL_SERVER}:8083/repository/docker-private/microservicio_nexus:dev'
            }
        }
    }
}