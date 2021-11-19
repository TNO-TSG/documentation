---
layout: doc
title: Core Container
toc: true
left_menu: true
slug: core-container
---

The Core Container is the heart of the connector and provides the means for secure and sovereign data sharing. Its primary focus is to ensure the identification, authentication, and authorization mechanisms are in place. It also acts as router, by leveraging Apache Camel, to route messages to other components (e.g. Data Apps) and act as gateway for exchanging data with other components in a data space.

## Overview
> TODO: Add figure

The Core Container is built around the [Spring Boot framework](https://spring.io/projects/spring-boot) and [Apache Camel](https://camel.apache.org/). And is devided in sub-modules that each provide a part of the functionality of the core container.

The Core Container is written in [Kotlin](https://kotlinlang.org/), which combines Java-based object-oriented programming and functional programming, which runs on a Java Virtual Machine (JVM). The build process is configured using [Gradle](https://gradle.org/) and the build artifact is designed to be a [Docker](https://www.docker.com/) image. For the creation of a Docker image, the [JIB Gradle plugin](https://github.com/GoogleContainerTools/jib/tree/master/jib-gradle-plugin) is used that allows the building of a Docker image without requiring a Docker daemon to be present. This fact makes that the build process can be integrated into continous integration (CI) pipelines is quite straight-forward.

## Sub-module overview

The Core Container repository is composed of several sub-modules responsible for parts of the core container:
- `camel-daps-processor`: Apache Camel processors for handling DAPS interactions
- `camel-multipart-processor`: Apache Camel processors for handling HTTP Mime Multipart requests/response
- `ids-artifact-manager`: Embedded Artifact handler
- `ids-configuration`: Spring Configuration & Beans used by the other modules
- `ids-main`: Main application class & configuration/beans that require one of the other modules
- `ids-orchestration-manager`: Orchestrator for managing containers next to the Core Container
- `ids-pef`: Embedded Policy Enforcement Framework
- `ids-resource-manager`: Resource metadata manager
- `ids-route-manager`: Apache Camel dynamic route manager
- `ids-security`: Security module that secures internal endpoints of the Core Container
- `ids-selfdescription`: IDS Information Model Self-Description handling and publishing (to Broker)
- `ids-token-manager`: Dynamic Attribute Provisioning Service (DAPS) interaction provider
- `ids-workflow-manager`: Embedded Workflow manager

### camel-daps-processor

This module contains Apache Camel processors to intercept ingress and egress routes.

The Camel Processors are used in all the Camel routes that are generated, primarily in the [`ids-resource-manager` module](../ids-resource-manager).

#### DAPS Token Injector

The `DapsTokenInjector` class is a Camel Processor and Spring Component that can be automatically detected and used in a Spring Context.

The DAPS Token Injector will ensure that processed egress messages always contain an IDS Dynamic Attribute Token (DAT) received from the Dynamic Attribute Provisioning Service (DAPS). Acquiring tokens is handled by [`ids-token-manager` module](../ids-token-manager)

#### DAPS Token Verifier

The `DapsTokenVerifier` class is a Camel Processor and Spring Component that can be automatically detected and used in a Spring Context.

The DAPS Token Verifier will ensure that processed ingress messages always contain a valid IDS Dynamic Attribute Token (DAT) from a trusted DAPS. Verification of claims made in tokens can be configured by means of the `ids.daps.verification` property:
- **IDSA** (_default_): Verification conforming to the DAPS v2 specification (see [IDS-G - Components - Identity Provider - DAPS](https://github.com/International-Data-Spaces-Association/IDS-G/tree/main/Components/IdentityProvider/DAPS)). Will verify the `ids.daps.requiredSecurityProfile` property to validate the required security profile is met.
- **NONE**: Disable verification of claims in the token, only ensures the token is signed by a trusted DAPS

### camel-multipart-processor

This module contains Apache Camel processors to process ingress and egress HTTP Mime Multipart messages.

The Camel Processors are used in all the Camel routes that are generated, primarily in the `ids-resource-manager` module.

#### Multipart Input Processor

The `MultiPartInputProcessor` class is a Camel Processor and Spring Component that can be automatically detected and used in a Spring Context. 

The Multipart Input Processor will transform an incoming HTTP Mime Multipart request towards a header based approach used in Apache Camel. The multipart formatted request will contain the following parts: 
- `header`: Required `de.fraunhofer.iais.eis.Message` (in JSON-LD representation) metadata of the request following the IDS Information Model.
- `payload` (_optional_): Arbitrary payload of the request.

The `header` part will be stored in the `IDS-Header` header in the Camel Exchange, the `payload` part will be stored in the body of the Camel Exchange.

#### Multipart Output Processor

The `MultiPartOutputProcessor` class is a Camel Processor and Spring Component that can be automatically detected and used in a Spring Context.

The Multipart Output Processor will inverse the Multipart Input Processor and will construct a HTTP Mime Multipart message with `header` and `payload` parts. For this it will use the `IDS-Header` header and the exchange payload. There are no verifications enabled for the output processor, so the header and payload will be transparently passed through and only the formatting will be changed.

### ids-artifact-manager

The IDS Artifact Manager module is a self-contained module to support simple data exchanges without additional Data Apps.

#### Spring REST Controllers
The Artifact Manager contains 2 internal API controllers for administration of artifacts and for requesting artifacts.

##### Consumer

The Consumer controller offers the possibility to request artifacts from other IDS connectors.
Also, the consumer controller is capable of starting the Contract Negotiation process, based on a predefined ContractOffer (e.g. stored next to the artifact metadata in the Broker)

##### Provider

The Provider controller offers the possibility to manage artifacts published by the connector, by means of CRUD requests.

Next to the actual artifact, an ContractOffer can be provided to limit the access rights to the artifact. This ContractOffer will be scoped to reflect the uploaded artifact, by setting the `target` property of all rules in the ContractOffer to the identifier of the artifact.

#### Artifact exchange process

The sequence diagram below shows the generic process for the interaction of users with the Artifact Manager. Containing the processes to upload a new artifact, perform the contract negotiation, and downloading the artifact.
<div class="mermaid">
sequenceDiagram
    actor C as Consumer
    participant CC as Consumer Connector
    participant PC as Provider Connector
    actor P as Provider
    P->>PC: /api/artifacts/provider<br />With optional ContractOffer
    activate P
    activate PC
    PC->>PC: Store artifact
    PC-->>P: 
    deactivate P
    deactivate PC
    
    C->>CC: /api/artifacts/consumer/contractRequest
    activate C
    activate CC
    CC->>PC: ContractRequestMessage
    activate PC
    alt Contract Request accepted
    PC-->>CC: ContractAgreementMessage
    CC-->>C: ContractAgreement
    else Contract Request denied
    PC-->>CC: ContractRejectionMessage
    CC-->>C: ContractRejection
    end
    C->>CC: /api/artifacts/consumer/artifact
    CC->>PC: ArtifactRequestMessage
    PC-->>CC: ArtifactResponseMessage
    deactivate PC
    CC-->>C: Artifact
    deactivate C
    deactivate CC
</div>

### ids-configuration

Helper module that contains generic configuration of the core container and common Spring Beans used throughout the repository.

The module contains the following packages:
- `events`: Spring `ApplicationEvent` support, to indicate modifications that impact the Self Description of the Connector.
- `http`: HttpClient provider, contains the Truststore configuration so that servers that use their IDS certificate for TLS encryption are trusted.
- `infomodel`: Helper functions and message converters for IDS Information Model related classes.
- `keystore`: Parser for PEM-based certificates and private keys
- `model`: Main Configuration model used for Spring Configuration Properties that are loaded via `application.yaml`, `application.properties`, or environment variables 
- `multipart`: MultiPartMessage (de)serialization support.
- `reloading`: Hot-reloading of Spring properties and classes support. (_Note: does not fully work_)
- `serialization`: Provides SerializationHelper as Spring Beans
- `validation`: Adds additional validation constraints that can be used by model classes

### ids-main

This module collects all of the submodules and provides the main class for execution.

This module also contains some configuration and beans that require other modules to work:
- `endpoint`: Apache Camel processor that adds Camel HTTP components parameters to forward addresses
- `errorhandling`: Apache Camel processor that will be used when an exception is thrown in one of the exchange routes.
- `healthcheck`: Health check endpoint for orchestration (e.g. Kubernetes) purposes
- `idscp`: IDSCPv2 configuration, used to configure `de.fhg.aisec.ids:camel-idscp2`
- `sslcontextparameters`: `SSLContextParameters` provider for usage in apache Camel routes, based on the Truststore configuration

#### Google Container Tools Jib Docker builds

This module contains the configuration for the Docker image build process by using the [Jib](https://github.com/GoogleContainerTools/jib) library. This is located in the `build.gradle.kts` file.

For local builds, the `jibDockerBuild` task can be used to build the image using Docker on the same machine (e.g. `./gradlew jibDockerBuild` (in the root of the repository)). For other builds the `jib` task can be used, that automatically uploads the Docker image to the registry (requires `REGISTRY_USERNAME` & `REGISTRY_PASSWORD` environment variables, or being logged in to the registry via the Docker CLI).

### ids-orchestration-manager

This module contains the Orchestration Manager for orchestrating containers alongside the core container (e.g. Data Apps).

Currently supported container environments:
- Kubernetes

This module is actively used by the `ids-workflow-manager` module to start, stop, and manage containers for workflows.

### ids-pef

This module contains the embedded Policy Enforcement Framework.

The Policy Enforcement Framework follows the XACML architecture:

<img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/XACML_Architecture_%26_Flow.png" width="600">

#### Policy Administration Point

The Policy Administration Point (PAP) offers a management API for CRUD operations for ContractOffers and ContractAgreements in the administration of policies.

The ContractOffers are used in the negotiation process to be able to automatically negotiate ContractAgreements.
The ContractAgreements are retrieved by the PDP at the moment a decision has to be made whether or not to allow requests. 

#### Policy Enforcement Point

The Policy Enforcement Point (PEP) makes sure that policies are enforced for all of the messages that flow through the PEP. The PEP is an Apache Camel processor that can be included in Camel routes, which makes that the messages in that route will be enforced. 

#### Policy Decision Point

The Policy Decision Point (PDP) makes the actual decision whether or not to allow a request, based on the context of the request. This includes the policy itself (from the PAP), environmental properties (from the PEP), additional attributes (from the PIP).

#### Policy Information Point

The Policy Information Point (PIP) provides additional information that might be required for taking a decision. At this moment, just the times a contract/resource are used is stored in the PIP.

#### Negotiation

The Negotiation Processor will actively intercept messages related to the negotiation process (`ContractRequestMessage`, `ContractOfferMessage`, `ContractAgreementMessage`, and `ContractRejectionMessage`) and handle the automated negotation process.

> Note: Currently automated negotiation only supports `ContractRequest`s that are similar or of narrower scope than the related `ContractOffer`

### ids-resource-manager

This IDS Resource Manager module provides the capability to manage the IDS metadata of resources the connector offers in the network.

The `ResourceManagerService` is used by the `ids-selfdescription` module as source of the `resourceCatalog` property in the Connectors self-description that will be published at the broker.

Data Apps are able to use the endpoints provided by the `ResourceController` to manage the resources that the Data App offers.

### ids-route-manager

The IDS Route Manager module manages all of the dynamic Camel routes in the core container.

The routes originate either from the Spring Configuration properties (`ids.routes`), or from the `ids-workflow-manager` module.

The `CamelRoutesGenerator` generates XML-based Apache Camel routes from `Route` objects from the configuration model (`ids-configuration` module).

The `CamelRouteManager` has support for both the XML represented routes as the Java-DSL represented routes (in the form of an `RouteBuilder` object)

### ids-security

The IDS Security module is responsible for the security of non-IDS communication. Which includes:
- the management API
- the Data App &#8594; Core Container API

Authentication for these resources is done by either API key authentication or by User credential authentication. For User credential authentication, a token is requested at the `/auth/signin` which can be used for requests to the API.

#### Security Roles

Access to resources of the API is role-based, the following roles are currently supported:

- **ADMIN**: Administrator role for the primary administrator that has full access and inherits all of the other roles
- **DATA_APP**: Data App role that can be given to Data Apps for managing the resources that they offer
- **READER**: Reader role that is allowed to read all resources in the core container but not modify them
- **ARTIFACT_PROVIDER_MANAGER**: Artifact Provider Manager role that is allowed to administrate provided artifact
- **ARTIFACT_PROVIDER_READER**: Artifact Provider Reader role that is allowed to list provided artifacts
- **ARTIFACT_CONSUMER**: Artifact Consumer role that is allowed to request artifacts from other connectors in the network
- **ORCHESTRATION_MANAGER**: Orchestration Manager role that is allowed to orchestrate containers
- **ORCHESTRATION_READER**: Orchestration Reader role that is allowed to list orchestrated containers
- **PEF_MANAGER**: Policy Enforcement Manager role that is allowed to initiate new contracts and contract negotiations
- **PEF_READER**: Policy Enforcement Reader role that is allowed to list agreed upon contracts and contract offers
- **RESOURCE_MANAGER**: Resource Manager role that is allowed to modify the resources provided by the core container and data apps
- **RESOURCE_READER**: Resource Reader role that is allowed to list resources provided by the core container and data apps
- **ROUTE_MANAGER**: Route Manager role that is allowed to modify Camel routes offered by the Core Container
- **ROUTE_READER**: Route Reader role that is allowed to list Camel routes offered by the Core Container
- **DESCRIPTION_READER**: Description Reader role that is allowed to send Description Request messages to other connectors in the network
- **WORKFLOW_MANAGER**: Workflow Manager role that is allowed to initiate new workflows
- **WORKFLOW_READER**: Workflow Reader role that is allowed to list workflows and show the results and status of the workflow

#### Controller Configuration

Spring controllers can limit the access to endpoints by providing the `@Secured` annotation, which requires a list of roles that have access to the endpoints.
This can be done both on class-level (indicating that for each of the methods these roles are required) or on method-level, these options are combined so you'd either need access on class-level or on method-level.

The `SecurityRoles` class provides constant values that can be used in the annotations:
~~~ kotlin
@RestController
@Secured(SecurityRoles.ARTIFACT_PROVIDER_MANAGER)
class Controller
~~~
~~~kotlin
@GetMapping
@Secured(SecurityRoles.ARTIFACT_PROVIDER_READER)
fun get()
~~~

### ids-selfdescription

The IDS Self Description module is responsible for constructing the self description of the connector and interact with the Broker to publish the self description.

#### Self Description Generator

The `SelfDescriptionGenerator` component constructs the self description metadata. The sources used for this are:
- _Spring Configuration properties_: The information in the `ids.info.*` properties is used to construct the generic information about the connector and who is owner of the connector.
- _Resource Manager Service_: The complete resource catalog exposed by the connector is managed by the `ids-resource-manager` module

When receiving the `SelfDescriptionReloadEvent`, the `SelfDescriptionGenerator` will generate the up-to-date self description. After the self description is generated, the `SelfDescriptionChangeEvent` is triggered. 

#### Broker Registration Service

The `BrokerRegistrationService` will publish the connector's metadata at the configured broker. For this to work, the `ids.broker.autoRegister` property should be `true`.
> _Note: Manual registration of the connector is not yet supported_

The `BrokerRegistrationService` will try the initial Broker registration in a retryable fashion (configurable via `ids.broker.registrationMaxRetries` & `ids.broker.registrationBackoffPeriod`).

To make sure the self description is updated and the Broker knows the connector is still available, the `BrokerRegistrationService` will periodically publish its self description (configurable via `broker.brokerHealthCheckInterval`).

#### Description Processor

The `DescriptionProcessor` provides the functionality of handling incoming `DescriptionRequestMessage`s. By either providing the full self description, or a specific portion if the `requestedElement` property is filled in the request message. The processor is used in the Camel routes for the self description.

#### Description Controller

The `DescriptionController` provides an API to send a `DescriptionRequest` to another connector. Primary used in combination with the `ArtifactConsumerController` from the `ids-artifact-manager` module, for retrieving `ContractOffer`s provided with resources in the self description. 

### ids-token-manager

The IDS Token Manager module is responsible for the interaction with Dynamic Attribute Provisioning Service (DAPS) instances.

The primary exposed functionality is:
- Requesting a Dynamic Attribute Token (DAT) from the DAPS for this connector
- Verifying a Dynamic Attribute Token (DAT) from an incoming message. _Note: only the signature of the token will be validated. The validity of the claims is verified in the `camel-daps-processor` module_

Based on the configuration, the relevant `ClientAssertionGenerator` and `TokenManagerService` implementations will be loaded.

### ids-workflow-manager

The IDS Workflow Manager module provides the functionality to manager workflows, both internal workflows (without communication with other connectors) as external workflows (with communication with other connectors) are supported.

## Build process

The following steps can be executed to build the Core Container and automatically create a Docker image for it.

To build execute (automatically pushes the image to the repository):
~~~ bash
./gradlew clean assemble ciTest jib
~~~

> The default image name structure that is used is:
> ~~~
> `registry.ids.smart-connected.nl/core-container:{GIT_BRANCH_NAME}`
> `registry.ids.smart-connected.nl/core-container:{GIT_BRANCH_NAME}-{BUILT_TIME}`
> ~~~

To build the image for local usage (requires a Docker daemon to be reachable):
~~~ bash
./gradlew clean assemble ciTest jibDockerBuild
~~~

To execute the integration and local tests (requires a Docker daemon to be reachable):
~~~ bash
./gradlew clean assemble test
~~~

> _NOTE: The Spotless plugin is used to automatically set the copyright headers and formatting of files_
> In case of errors during Spotless Check tasks, run the following task to automatically fix the errors:
> `./gradlew spotlessApply`
