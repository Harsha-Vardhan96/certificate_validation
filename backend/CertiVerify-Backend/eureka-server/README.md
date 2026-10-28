# CertiVerify - Eureka Server

This microservice acts as the **Service Registry** for the CertiVerify Global backend architecture, powered by Spring Cloud Netflix Eureka.

## What it does
The Eureka Server is essentially a "phonebook" for our microservices. It keeps track of all active instances of our services, their hostnames, and IP addresses. 

## Why service discovery is needed
In a microservice architecture, services need to communicate with each other (e.g., API Gateway routing to Auth Service, or Verification Service calling Application Service). Hardcoding IPs and ports is not scalable because service instances dynamically start, stop, and scale. With Eureka, services can simply refer to each other by their logical names (e.g., `auth-service`), and Eureka handles locating the actual running instance.

## Port
The Eureka Server runs on port **8761**.

## Service Registration
All other microservices in the CertiVerify architecture (API Gateway, Auth, Application, Certificate, Verification) will be configured as **Eureka Clients**. Upon startup, they will automatically register themselves with this server using the URL `http://localhost:8761/eureka/`.

## Running the Server
You can start this server using Maven:
```bash
mvn clean spring-boot:run
```
Once started, you can view the Eureka Dashboard by navigating to `http://localhost:8761` in your browser.
