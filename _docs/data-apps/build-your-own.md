---
layout: doc
title: Build your own Data App
toc: true
left_menu: true
slug: data-apps-build
---

This document explains how to build your own Kotlin Data App and how to deploy it next to your TNO Security Gateway. TNO offers a Kotlin library to easily build your own Data Apps in Kotlin using Spring Boot. The Kotlin library defines everything you need. You only need to add the IDS message listeners for the particular message types that you want to handle in your Data App. 

This guide assumes that you have some basic Kotlin experience. However, if you are well acquanted with Java you should be able to follow along. 

## Overview
> Figures & design

Fusce mollis est ipsum, eget condimentum magna ultricies nec. Vivamus non metus eros. Integer magna eros, ultricies a augue in, accumsan interdum est. Nam mi risus, malesuada eu mi id, semper pellentesque leo. Suspendisse sit amet metus vel lorem elementum condimentum at in nisl. Praesent gravida nunc sed orci sagittis, eu molestie nulla pellentesque. Integer tortor sem, pulvinar et aliquet nec, luctus nec purus. Phasellus ac mauris ac lorem sagittis tempus ac eu diam. Phasellus non eleifend augue. Nunc vulputate maximus mauris, ut posuere ante eleifend id. Suspendisse aliquet ipsum non lorem gravida, sed hendrerit mauris malesuada. Vestibulum sed elit id mi varius convallis. Nullam vulputate hendrerit dictum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.

## Prerequisites
- Basic Kotlin experience (or experienced in Java)
- Basic familiarity with the Spring Boot framework
- Basic familiarity with Helm/Kubernetes, if you intend to use the recommended deployment method


## Importing the Base Data App Dependecy
The Base Data App is offered by the TNO IDS Maven repository as a Java dependecy that handles most of the IDS communication with the TNO Security Gateway for you. The TNO IDS Maven repository can be found at https://ci.ids.smart-connected.nl/nexus/repository/tno-ids/, the name of the Base Data App dependecy is 'base-data-app', the groupId is 'nl.tno.ids' and the most recent version is '4.1.1-SNAPSHOT'. The current version of the Base Data App supports the IDS Information Model version 4. 

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
| &nbsp;&nbsp;&nbsp;.httpsForwardEndpoint | URL* | - | URL of the Security Gateway HTTPS endpoint for IDS multipart requests sent from the Data App, this is where outgoing messages will be forwarded to |
| &nbsp;&nbsp;&nbsp;.idscpForwardEndpoint | URL | - | Same as .httpsForwardEndpoint but for IDSCP messages |
| &nbsp;&nbsp;&nbsp;.resourcesEndpoint | URL | - | Core conrainer resources endpoint - where the Data App can publish resources to |
| **IdsConfig** |
| &nbsp;&nbsp;&nbsp;.connectorId | URI* | - | Connector IDS Identifier |
| &nbsp;&nbsp;&nbsp;.participantId | URI* | - | Participant IDS Identifier |
| &nbsp;&nbsp;&nbsp;.modelVersion | String | `4.1.0` | Version of the IDS information model that this Data App supports |
| &nbsp;&nbsp;&nbsp;.appId | Int | `data-app` | Data app identifier |

## Publishing resources to the Security Gateway
The Base Data App contains a resource publisher that can be used to publish exposed resources, such as API endpoints, to the Security Gateway. These resources can then be found by other participants in the Data Space as it will be included in the self description of the Security Gateway. The Resource Publisher is exposed via the Spring comonent `ResourcePublisher` and contains the following methods to (un)publish resources:
- `publishResourceToCoreContainer(resource: Resource)`: Publish the IDS resource to the Security Gateway
- `publishResourcesToCoreContainer(resources: List<Resource>)`: Publish a list of IDS resources to the Security Gateway
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

## Packaging to Docker Images
Nulla faucibus luctus eros, sed iaculis erat vestibulum non. Morbi varius dictum erat sed varius. Aenean in dui nisi. Nunc feugiat a mauris non porttitor. Donec iaculis felis a ante fermentum fermentum. Cras tortor lacus, consequat ac mauris quis, sagittis aliquet est. Donec fermentum nec metus et iaculis. Mauris cursus molestie urna, id accumsan ipsum. Praesent urna justo, luctus vitae interdum at, aliquet non tellus.

## Non-Kotlin Data Apps
Currently, TNO only provides tools to easily make Data Apps in Kotlin. If you want to make a Data App in another programming language of your choice, then you will have to take care of the following:
- Implement the [IDS information model](https://international-data-spaces-association.github.io/InformationModel/docs/index.html#), in particular, the different kinds of messages that your Data App needs to support. 
- Define a Rest Controller that listens for messages from the Core Container. 

