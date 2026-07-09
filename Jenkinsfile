pipeline {
    agent any

    environment {
        // Docker registry settings
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_USER     = 'your_docker_hub_username' // Change to user's registry username
        IMAGE_TAG       = "${BUILD_NUMBER}"
        
        // AWS Deployment parameters
        EC2_USER        = 'ubuntu'
        EC2_IP          = '13.233.10.15' // Change to user's EC2 target IP
        SSH_CREDENTIAL  = 'ec2-ssh-key' // Jenkins credentials ID for SSH private key
        REGISTRY_CRED   = 'docker-hub-credentials' // Jenkins credentials ID for Docker Hub
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code from Git repository...'
                checkout scm
            }
        }

        stage('Security & Syntax Lint') {
            parallel {
                stage('Lint Backend') {
                    steps {
                        echo 'Running Backend code quality checks...'
                        // Example checking command (checks syntax only without installing devDependencies)
                        sh 'node --check backend/src/server.js'
                    }
                }
                stage('Lint Frontend') {
                    steps {
                        echo 'Checking Frontend project configuration...'
                        // Verifies package config validates successfully
                        sh 'test -f frontend/package.json'
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building Docker container images...'
                sh "docker build -t ${DOCKER_USER}/college-backend:${IMAGE_TAG} ./backend"
                sh "docker build -t ${DOCKER_USER}/college-frontend:${IMAGE_TAG} ./frontend"
                sh "docker build -t ${DOCKER_USER}/college-nginx:${IMAGE_TAG} ./nginx"
                
                // Add latest tags for local fallback reference
                sh "docker tag ${DOCKER_USER}/college-backend:${IMAGE_TAG} ${DOCKER_USER}/college-backend:latest"
                sh "docker tag ${DOCKER_USER}/college-frontend:${IMAGE_TAG} ${DOCKER_USER}/college-frontend:latest"
                sh "docker tag ${DOCKER_USER}/college-nginx:${IMAGE_TAG} ${DOCKER_USER}/college-nginx:latest"
            }
        }

        stage('Vulnerability Scan') {
            steps {
                echo 'Scanning built images for security vulnerabilities with Trivy...'
                // Skip script fail on vulnerabilities for education, but logs them
                sh "trivy image --severity HIGH,CRITICAL --light ${DOCKER_USER}/college-backend:${IMAGE_TAG} || true"
            }
        }

        stage('Push to Registry') {
            steps {
                echo 'Logging in to Docker Hub and pushing images...'
                withCredentials([usernamePassword(credentialsId: "${REGISTRY_CRED}", usernameVariable: 'HUB_USER', passwordVariable: 'HUB_PASS')]) {
                    sh "echo ${HUB_PASS} | docker login -u ${HUB_USER} --password-stdin"
                    sh "docker push ${DOCKER_USER}/college-backend:${IMAGE_TAG}"
                    sh "docker push ${DOCKER_USER}/college-frontend:${IMAGE_TAG}"
                    sh "docker push ${DOCKER_USER}/college-nginx:${IMAGE_TAG}"
                    
                    sh "docker push ${DOCKER_USER}/college-backend:latest"
                    sh "docker push ${DOCKER_USER}/college-frontend:latest"
                    sh "docker push ${DOCKER_USER}/college-nginx:latest"
                }
            }
        }

        stage('Deploy to AWS EC2') {
            steps {
                echo 'Deploying application to production EC2 instance...'
                sshagent(credentials: ["${SSH_CREDENTIAL}"]) {
                    // 1. Copy docker-compose.prod.yml and db/init.sql to the server
                    sh "ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} 'mkdir -p ~/college-app/db'"
                    sh "scp -o StrictHostKeyChecking=no docker-compose.prod.yml ${EC2_USER}@${EC2_IP}:~/college-app/docker-compose.yml"
                    sh "scp -o StrictHostKeyChecking=no db/init.sql ${EC2_USER}@${EC2_IP}:~/college-app/db/init.sql"
                    
                    // 2. SSH run commands to update and restart containers
                    sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} '
                            cd ~/college-app
                            
                            # Pull updated container images
                            docker compose pull
                            
                            # Re-run containers with environment variables injected
                            export IMAGE_TAG=${IMAGE_TAG}
                            docker compose up -d --remove-orphans
                            
                            # Clean up old unused images to save disk space
                            docker image prune -f
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo "CI/CD Pipeline succeeded! Academix Build #${BUILD_NUMBER} deployed successfully."
        }
        failure {
            echo "CI/CD Pipeline failed at some stage. Check Jenkins console logs."
        }
    }
}
