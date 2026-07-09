# Complete Jenkins CI/CD Pipeline Setup Guide

This guide describes how to configure Jenkins to run the declarative `Jenkinsfile` in this repository, build docker images, push them to Docker Hub, and deploy them automatically to AWS EC2.

---

## 1. Run Jenkins Locally in Docker

If you do not have a dedicated Jenkins server, you can run a Docker container for testing:

```bash
docker run -d \
  --name college-jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --group-add $(stat -c '%g' /var/run/docker.sock 2>/dev/null || echo 0) \
  jenkins/jenkins:lts-jdk17
```
> [!NOTE]
> Mounting `/var/run/docker.sock` allows the Jenkins container to command the host Docker engine to build and tag images without running Docker-in-Docker (DinD).

1. Open `http://localhost:8080` in your web browser.
2. Retrieve the initial administrator password:
   ```bash
   docker exec college-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Proceed with **Install Suggested Plugins**.
4. Create your admin user profile.

---

## 2. Install Required Plugins

Go to **Manage Jenkins** -> **Plugins** -> **Available Plugins** and search for and install:
1. **SSH Agent Plugin** (allows securely forwarding SSH keys to EC2).
2. **Docker Pipeline** (enables docker commands natively in stages).

Click **Install without restart** (or check restart once plugins are downloaded).

---

## 3. Configure Credentials in Jenkins

Go to **Manage Jenkins** -> **Credentials** -> **System** -> **Global credentials (unrestricted)**:

### Credential 1: Docker Hub Registry Credentials
* **Kind**: Username with password
* **ID**: `docker-hub-credentials` *(Must match the ID in the Jenkinsfile environment)*
* **Username**: *Your Docker Hub Username*
* **Password**: *Your Docker Hub Personal Access Token (PAT)*
* **Description**: Credentials to push to Docker Hub.

### Credential 2: AWS EC2 SSH Access Key
* **Kind**: SSH Username with private key
* **ID**: `ec2-ssh-key` *(Must match the ID in the Jenkinsfile environment)*
* **Username**: `ubuntu`
* **Private Key**: Select **Enter directly** -> click **Add** -> Paste the entire contents of your AWS private `.pem` key file (including `-----BEGIN RSA PRIVATE KEY-----` / `-----END RSA PRIVATE KEY-----`).
* **Description**: Key to deploy on EC2.

---

## 4. Update the Jenkinsfile Environment Variables

Open the root `Jenkinsfile` in your IDE and update the `environment` variables block:
```groovy
    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_USER     = 'YOUR_DOCKER_HUB_USERNAME' // Replace with your username
        IMAGE_TAG       = "${BUILD_NUMBER}"
        
        EC2_USER        = 'ubuntu'
        EC2_IP          = 'YOUR_AWS_EC2_PUBLIC_IP'  // Replace with EC2 public IPv4 address
        SSH_CREDENTIAL  = 'ec2-ssh-key'
        REGISTRY_CRED   = 'docker-hub-credentials'
    }
```
Commit and push these changes to your GitHub branch:
```bash
git add Jenkinsfile
git commit -m "chore: configure deployment targets in Jenkinsfile"
git push origin main
```

---

## 5. Create the Jenkins Pipeline Job

1. Go to Jenkins Home and click **New Item**.
2. Name it `Academix-Pipeline` and select **Pipeline**. Click **OK**.
3. Under the **Build Triggers** section, check **GitHub hook trigger for GITScm polling** (enables automatic builds on commits).
4. Under the **Pipeline** section:
   * **Definition**: Select **Pipeline script from SCM**.
   * **SCM**: Select **Git**.
   * **Repository URL**: Paste `https://github.com/akshadpimple2004-sketch/college-app.git`
   * **Branch Specifier**: Change `*/master` to `*/main`.
   * **Script Path**: Verify it says `Jenkinsfile`.
5. Click **Save**.

---

## 6. Run Your Build

Click **Build Now** in the sidebar. Jenkins will pull the code, compile and build the images, run Trivy security scanning, upload the images to Docker Hub, SSH into the EC2 instance, copy `docker-compose.prod.yml`, and spin up the production stack!

Verify the stages render green in the Jenkins Stage View UI dashboard.
