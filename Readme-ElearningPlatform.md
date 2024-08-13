# Elearning Application

## 🔭 Features

It is an Elearning Management System which can facilitate you to enroll and learn courses, add those to your wishlist, and also manage the entire application.  
It has 3 modes of operation: 
1. ADMIN 
2. USER 
3. PROFESSOR

## About Project Development 🥅

### Technology Used
**Frontend:** 
- Angular 12
- HTML5
- CSS3
- TypeScript
- jQuery
- Bootstrap
- JavaScript
- Font Awesome
- Google Fonts
- Material UI

**API and Libraries:** 
- YouTube Player API
- Fileserver JS
- OWL Carousel
- Material Design icon

**Backend:** 
- Spring Boot
- Java
- Hibernate
- Spring JWT

**Database:** 
- MySQL

**Environment Requirements:**
- Angular CLI: 12.0.3
- Node.js: 14.15.0
- npm: 9.2.0
- Java: 14 or 17
- Docker: latest
- Maven: latest
- MySQL: 8
- Nginx: latest

## About Project Deployment 

### Installation

**npm**

sudo apt install npm -y

**maven**

sudo apt install maven -y

**angular**

sudo npm install -g @angular/cli@12.0.3

**nvm** 

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"

[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

**nodejs using nvm**

nvm install 14.15.0

**nodejs without nvm**

sudo apt-get update

sudo apt-get install -y build-essential curl

curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -

sudo apt-get install -y nodejs=14.15.0-1nodesource1


**docker**

sudo apt install docker.io -y

## Cloning Repositories:

git clone https://github.com/Quantum-soft-test/ElearningFrontendFinal.git

git clone https://github.com/Quantum-soft-test/ElearningFinal.git

**Create Network for containers connection(by default bridge network will be created)**

docker network create connection

## Backend Database:
```
docker run -p 3306:3306 --name mysqldb --net connection -e MYSQL_ROOT_PASSWORD=root  -e MYSQL_DATABASE=elearningsystem mysql:8
```
## Backend Server:

Update application configuration as per req but must update database host, password, username

```bash
nano projectrootdirectory/src/main/resources/application.properties
```

Use Maven to Package or build application. This will create Target folder in which you can find .jar file.
```bash
mvn clean package
```
Create Dockerfile for backend server.
```bash
#Base Image
FROM openjdk:17
#Copying Data or renaming files.
ADD target/ELearningManagement-0.0.1-SNAPSHOT.jar  springboot-mysql-docker.jar
#Entrypoint to run jar file
ENTRYPOINT ["java","-jar","springboot-mysql-docker.jar"]
```
Run Container using your required port, network, database, container names.
```
docker run -itd -p 8080:8080 --net connection --name springbootapp -e MYSQL_HOST=mysqldb -e MYSQL_USER=root -e MYSQL_PASSWORD=root  -e MYSQL_PORT=3306 springboot-app
```
Check if database connection with backend is successfull or not. Check Database schema created or not. Visit application using publicIP:8080.

## Frontend
Update apiURL, add backend IP and ports as you had configured.
```
nano src/environments/environment.ts or environment.prod.ts
```
Install dependancies
```
npm install 
```
Build using angular which will create dist folder which will contain required runtime application files.
```
ng build 
```

Create Dockerfile
```yaml
#Base Image
FROM nginx:alpine

# Copy the build output from the first stage
COPY dist/ElearningManagement /usr/share/nginx/html

# Copy the default Nginx configuration
COPY default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
```

default.conf

```bash
server {

    listen 80;
    #update listen port, server_name, IP as per your requirements.
    server_name http://3.81.234.25;

    root /usr/share/nginx/html/;

    index index.html index.html;

    location /api {
    #update port, server_name, IP as per your requirements. Here backend IP with its port is used.
        proxy_pass http://3.81.234.25:8080/api;

    }


    location / {

        try_files $uri $uri/ /index.html;

    }

}

```

Start Angular frontend Application. 

```
# ports are mapped between host and container. on port 4200 website will be accessible and 80 is of service inside container which is nginx.
sudo docker run -itd -p 4200:80 --net connection --name angularapp angular-app
```


## Multibuild Docker containerization (option-2):

Follwing Dockerfile will install dependancies, builds, updates env.ts file in first stage and copy data to next container we define.

```yaml
# Stage 1: Build the Angular application
FROM node:14 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
## following steps can minimize the manual work of building application. To do take all files inside build container and copy only dist in application container. Or If we use jenkins then build can be automated outside the container
#RUN npm install -g @angular/cli@12.0.3
#RUN ng build 
COPY . .
ARG API_URL
ENV API_URL=http://3.81.234.25:8080/api
ENV API_URL=$API_URL
RUN echo "export const environment = { production: true, apiUrl: '$API_URL' };" > src/environments/environment.ts

# Stage 2: Serve the Angular application with Nginx
FROM nginx:alpine
COPY --from=build app/dist/ElearningManagement /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]

```


## Docker-compose (option-3)

We can automate most of the manual task using docker-compose.

```yaml
version: "3"
services:
  mysqldb:
    container_name: mysqldb
    image: mysql:8
    ports:
      - "3306:3306"
    environment:
      MYSQL_DATABASE: elearningsystem
      MYSQL_ROOT_PASSWORD: root
      MYSQL_PASSWORD: root
    volumes:
      - mysqldb-data:/var/lib/mysql
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h localhost -uroot -proot"]
      interval: 30s
      timeout: 10s
      retries: 10
    networks:
      - connection

  springboot-app:
    container_name: springboot-app
    build:
      context: /home/ubuntu/backend
      dockerfile: backend-dockerfile
    image: springboot-app:v1
    ports:
      - "8080:8080"
    environment:
      MYSQL_HOST: mysqldb
      MYSQL_USER: root
      MYSQL_PASSWORD: root
      MYSQL_PORT: 3306
    depends_on:
      mysqldb:
        condition: service_healthy
    networks:
      - connection

  angular-app:
    container_name: angular-app
    build:
      context: /home/ubuntu/frontend
      dockerfile: frontend-dockerfile
    image: angular-app:v1
    ports:
      - "4200:80"
    depends_on:
      - springboot-app
    networks:
      - connection

volumes:
  mysqldb-data:

networks:
  connection:
    driver: bridge
```




## Jenkins

**Jenkins Installation (Java required)**

sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update
sudo apt-get install jenkins -y


**To change default port of jenkins follow next steps**

```
sudo nano /etc/default/jenkins
```
Update http port
```
# port for HTTP connector (default 8080; disable with -1)
#HTTP_PORT=8080
HTTP_PORT=9090
```

```
sudo nano /lib/systemd/system/jenkins.service
```

Update following contains as per requirement. 

```
#Environment="JENKINS_PORT=8080"
Environment="JENKINS_PORT=9090"
```


## Jenkins setup

Install required plugins other than suggested like docker related, nodejs plugin.

**Manage jenkins tools**

Add Java and maven path which will required for application to build.

Java path for openjdk11 is : 'JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64'

Maven automatically install : 3.8.9

Docker: latest

nodejs: 14.15.0 && Global npm package to install is '@angular/cli@12.0.3s'


**Jenkins Global Credentials**

Create Credential for github login (If required)

ID: dockerhub (Use Username password method OR Secret text)


**Enable Git Webhook**

Go to Github and working repository ==> Settings ==> Webhooks ==> (jenkins payload url: http://54.145.73.15:9090/github-webhook/)


## Deployment on Jenkins

**Create Pipeline using Pipeline and code**

frontend jenkins pipeline

```groovy
pipeline {
    agent any
    
    tools {
        nodejs 'nodejs' // The name you specified in the NodeJS installation
    }

    triggers {
        // Enable GitHub webhook trigger
        githubPush()
    }
        
        
    stages {

        stage('clean workspace') {
            steps {
                echo 'Cleaning workspace'
                cleanWs()
            }
        }        
        
        
        stage('checkout') {
            steps {
                checkout([$class: 'GitSCM', 
                          branches: [[name: '*/master']], 
                          doGenerateSubmoduleConfigurations: false, 
                          extensions: [], 
                          submoduleCfg: [], 
                          userRemoteConfigs: [[url: 'https://github.com/loki2111/elearning-frontend.git']]
                ])
            }
        }

        stage('Checkout-without githook') {
            steps {
                echo 'Pulling code'
                git branch: 'master', url: 'https://github.com/loki2111/elearning-frontend.git'
            }
        }
        stage('Install dependancies') {
            steps {
                echo "Installing dependancies using npm"
                sh 'npm install'
            }
        }
        stage('Build Angular Application') {
            steps {
                script {
                    echo "building application"
                    sh 'ng build --prod'
                }
            }
        }
        stage('Docker Build & tag Image') {
            steps {
                script {
                    echo "Builing container"
                    sh 'docker build -t angular-app:latest -f frontend-dockerfile .'
                }
            }
        }
        stage('Docker Run Angular frontend') {
            steps {
                script {
                        echo "Removing existing container if exists"
                        sh 'docker rm -f angularapp || true' // Remove existing container if it exists
                        echo "Starting Angular frontend container"
                        sh 'docker run -itd -p 4200:80 --net connection --name angularapp angular-app'
                }
            }
        }   
    }
}
```

backend jenkins pipeline

```groovy
pipeline {
    agent any

    tools {
        maven 'maven3' //name which is mentioned in tools configuration
        jdk 'jdk11' //name which is mentioned in tools configuration
    }

    triggers {
        // Enable GitHub webhook trigger
        githubPush()
    }
        
        
    stages {

        stage('clean workspace') {
            steps {
                cleanWs()
            }
        }        
        
        
        stage('checkout') {
            steps {
                checkout([$class: 'GitSCM', 
                          branches: [[name: '*/master']], 
                          doGenerateSubmoduleConfigurations: false, 
                          extensions: [], 
                          submoduleCfg: [], 
                          userRemoteConfigs: [[url: 'https://github.com/loki2111/elearning-backend.git']]
                ])
            }
        }

        stage('Package using Maven build') {
            steps {
                echo "Building Jar files"
                sh 'mvn clean package'
            }
        }
        
        stage('Docker Build & tag Image') {
            steps {
                script {
                    echo "Builing container"
                    sh 'docker build -t springboot-app:latest -f backend-dockerfile .'
                    }
                }
            }

        stage('Manage Docker Network') {
            steps {
                script {
                    // Create Docker network if it doesn't exist
                    sh 'docker network inspect connection || docker network create connection'
                }
            }
        }

        stage('Start MySql Database') {
            steps {
                script {
                    //echo "Starting Database container"
                    //sh 'docker network create connection'
                    //sh 'docker run -d -p 3306:3306 --name mysqldb --net connection -e MYSQL_ROOT_PASSWORD=root  -e MYSQL_DATABASE=elearningsystem mysql:8'
                   
                    // Check if MySQL container exists
                    def mysqlContainerExists = sh(returnStdout: true, script: 'docker ps -a --filter "name=mysqldb" --format "{{.Names}}"').trim()

                    if (!mysqlContainerExists) {
                        echo "Starting Database container"
                        sh 'docker run -d -p 3306:3306 --name mysqldb --net connection -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=elearningsystem mysql:8'
                    } else {
                        echo "MySQL container 'mysqldb' already exists. Skipping creation."
                    }
                }
            }
        }

        stage('Start Spring Boot Application') {
            steps {
                script {
                    // Stop and remove existing Spring Boot container if it exists
                    sh 'docker rm -f springbootapp || true'
                    
                    echo "Starting Spring Boot application container"
                    sh 'docker run -d -p 8080:8080 --net connection --name springbootapp -e MYSQL_HOST=mysqldb -e MYSQL_USER=root -e MYSQL_PASSWORD=root -e MYSQL_PORT=3306 springboot-app'
                }
            }
        }
    }
}
```