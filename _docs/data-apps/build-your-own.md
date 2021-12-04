---
layout: doc
title: Build your own Data App
toc: true
left_menu: true
slug: data-apps-build
---

This document explains how to build your own Kotlin Data App and how to deploy it next to your TNO Core Container. TNO offers a Kotlin 'Base Data Appp' library to easily build your own Data Apps in Kotlin using Spring Boot. The Kotlin library defines everything you need. You only need to add the IDS message listeners for the particular message types that you want to handle in your Data App. 

This guide assumes that you have some basic Kotlin experience. However, if you are well acquanted with Java you should be able to follow along. 

## Prerequisites
- Basic Kotlin experience (or experienced in Java)
- Basic familiarity with the [Spring Boot framework](https://spring.io/projects/spring-boot)
- Basic familiarity with Helm/Kubernetes, if you intend to use the recommended deployment method

## Overview

The 'Base Data App' library provided by TNO contains Spring components that you can use to quickly bootstrap your logic into an IDS based dataspace. The Base Data App provides the following functionality:
- A Spring REST controller that listens for IDS messages from the TNO Core Container
- A Message dispatcher that dispatches incoming messages to an available message listener 
- A resource publisher that can be used to publish available resources, such as API endpoints, to the TNO Core Container
- Helper functions to send IDS HTTP Multipart or IDSCP messages 

The structure and interaction of the components of the Base Data App with the TNO Core Container is depicted in the diagram below:
![TNO Data App Architecture](/assets/images/drawio/data-app-architecture.drawio.svg)

## Importing the Base Data App Dependecy
The Base Data App is offered by the TNO IDS Maven repository as a Kotlin dependecy. The TNO IDS Maven repository can be found at https://ci.ids.smart-connected.nl/nexus/repository/tno-ids/, the name of the Base Data App dependecy is 'base-data-app', the groupId is 'nl.tno.ids' and the most recent version is '4.1.1-SNAPSHOT'. The current version of the Base Data App supports the IDS Information Model version 4. 

If you are using Gradle you can import the Base Data App dependecy into your project by putting the following code in your (Kotlin) build.gradle: 

    dependencies {
        implementation("nl.tno.ids:base-data-app:4.1.1-SNAPSHOT")
        ...
    }

## Setting up the Application
Building a Data App using the TNO Base Data App dependecy requires your application to use the [Spring Boot framework](https://spring.io/projects/spring-boot). You can setup a new Spring Boot application or use one of the existing Data Apps as a base. It is important that you annotate your Application class with the necesary annotations:

    @SpringBootApplication(scanBasePackages = ["nl.tno.ids"])
    @ConfigurationPropertiesScan("nl.tno.ids")
    class Application

    fun main(args: Array<String>) {
        runApplication<Application>(*args)
    }

The `scanBasePackages = ["nl.tno.ids"]` parameter of the `@SpringBootApplication` makes sure that Spring loads the necessary Spring components from the Base Data App dependecy. In particular, this makes sure that the Rest Controller that listens for HTTP Multipart requests from the Core container is available. The `@ConfigurationPropertiesScan("nl.tno.ids")` tells Spring to load and bind the required Base Data App configurations. The Base Data App expects an `application.yaml` or `application.properties` yaml file with the following properties:

| Configuration Key | Type (* required) | Default | Description |
|---|---|---|---|---|
| **core-container** |
| &nbsp;&nbsp;&nbsp;.httpsForwardEndpoint | URL* | - | URL of the Core Container HTTPS endpoint for IDS multipart requests sent from the Data App, this is where outgoing messages will be forwarded to |
| &nbsp;&nbsp;&nbsp;.idscpForwardEndpoint | URL | - | Same as .httpsForwardEndpoint but for IDSCP messages |
| &nbsp;&nbsp;&nbsp;.resourcesEndpoint | URL | - | Core conrainer resources endpoint - where the Data App can publish resources to |
| **IdsConfig** |
| &nbsp;&nbsp;&nbsp;.connectorId | URI* | - | Connector IDS Identifier |
| &nbsp;&nbsp;&nbsp;.participantId | URI* | - | Participant IDS Identifier |
| &nbsp;&nbsp;&nbsp;.modelVersion | String | `4.1.0` | Version of the IDS information model that this Data App supports |
| &nbsp;&nbsp;&nbsp;.appId | Int | `data-app` | Data app identifier |


## Creating IDS message handlers
The TNO Base Data App contains a Spring REST Controller that receives IDS messages from remote connectors. You can implement your own message listeners to handle the desired IDS message types of your own. Once you have implemented a message handler of a certain type, all messages of that type will be forwarded to that message handler by the REST controller. Message handlers can be created by writing a class that inherits from nl.tno.ids.base.MessageHandler. The MessageHandler interface has a handle function that should be overridden:

    // Inherit from MessageHandler to register message handlers of a specific IDS message.
    // Spring will register the Message Handler using Dependency Injection
    @Component
    class QueryMessageHandler(private val config: IdsConfig) : MessageHandler<QueryMessage> {
        override fun handle(header: QueryMessage, payload: String?): ResponseEntity<*> {        
            // Put your application logic based on the message here.
            return ResponseEntity.ok()
        }
    }

It is important to annotate the class with @Component, so that the custom message handler class can be registered by Spring.


## Sending messages to remote Connectors
The Base Data App contains a `HttpHelper` Spring component that contains methods for either sending IDS HTTP multipart messages or IDSCP messages. You can use Spring to inject these components into your own classes and use them to send IDS messages to remote containers. For a list of message types you can send, check out [this page]({% link _docs/communication/ids-messages.md %}).

### Sending IDS multipart messages
The `HttpHelper` Spring component contains two overloaded methods to send IDS HTTP multipart messages:

`fun toHTTP(receiver: String, header: Message, payload: Described?)`: Sends an IDS HTTP multipart message to the access url of the intended receiver, with the given IDS Message Header and described payload.

`fun toHTTP(receiver: String, header: Message, payload: String?, contentType: ContentType = ContentType.APPLICATION_JSON)`: Sends an IDS HTTP multipart message to the access url of the intended receiver, with the given IDS Message Header and payload String using the given content type.

Both methods return a HTTP status code along with the response.


### Sending IDSCP messages
The `HttpHelper` Spring component contains two overloaded methods to send IDSCP messages:

`fun toIDSCP(receiver: String, header: Message, payload: Described?)`: Sends an IDSCP message to the access url of the intended receiver, with the given IDS Message Header and described payload.

`fun toIDSCP(receiver: String, header: Message, payload: String?)`: Sends an IDSCP message to the access url of the intended receiver, with the given IDS Message Header and payload String

Both methods return a HTTP status code along with the response.


## Publishing resources to the Core Container
The Base Data App contains a resource publisher that can be used to publish exposed resources, such as API endpoints, to the Core Container. These resources can then be found by other participants in the Data Space as it will be included in the self description of the Core Container. The Resource Publisher is exposed via the Spring comonent `ResourcePublisher` and contains the following methods to (un)publish resources:
- `publishResourceToCoreContainer(resource: Resource)`: Publish the IDS resource to the Core Container
- `publishResourcesToCoreContainer(resources: List<Resource>)`: Publish a list of IDS resources to the Core Container
- `unpublishResourceToCoreContainer(resourceId: String)`: Unpublish a resource with a given resource Id

The Resource Publisher requires that the `core-container.resourcesEndpoint` configuration property is properly set. 

## Additional properties

Additional Spring or Camel properties can be provided next to the Core Container properties. This can be used to configure the logging properties of the Core Container.

For example, the following snippet can be added to the `application.yaml` to set the global logging level to `INFO` and the Core Container logging to debug:
~~~ yaml
logging:
  level:
    root: INFO
    nl.tno.ids: DEBUG
~~~

## Deployment
The recommended deployment method by TNO is to deploy your Data App alongside the TNO Core Container using Kubernetes and Helm. Your Data App first needs to be packacged into a docker image. TNO recommends to use [Google Jib](https://github.com/GoogleContainerTools/jib) to automatically build the image in your build script. 

Once your image is ready you can deploy your Data App alongside the TNO Core Container by adding it to the `containers` key of your TNO Core Container Helm script:

    containers:
        - type: data-app
        image: image:tag
        name: data-app-name
        # .services is optional: if no services are defined here, the underlying Helm template will automatically expose a ClusterIP service on port 8080.
        services:        
        - port: 8080
          name: http
          # .nodePort is optional, if not given, ClusterIP is assumed.
          nodePort: 12345
        # config -- Data App Configuration. Will be inserted as the application.yaml of the Data App and therefore needs an equal structure
        config:
            testconfig:
               key: value

Deploying your Data App using another deployment strategy is currently not supported by TNO.


## Non-Kotlin Data Apps
Currently, TNO only provides tools to  make Data Apps in Kotlin. If you want to make a Data App in another programming language of your choice, then you will have to take care of the following:
- Implement the [IDS information model](https://international-data-spaces-association.github.io/InformationModel/docs/index.html#), in particular, the different kinds of messages that your Data App needs to support. 
- Define a Rest Controller that listens for messages from the Core Container. 
- Publish the available resources to the Core Container

