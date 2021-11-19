---
layout: doc
title: Configuration
toc: true
left_menu: true
slug: core-container-configuration
---

The configuration of the Core Container follows [Spring Configuration Properties](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties) to setup all of the initial parameters. The Core Container project contains type-safe properties that can be autowired into components.

Not just the specific Core Container properties can be configured in this way, but also more generic Spring or Camel configuration can be provided. For instance, when you'd want to alter the logging settings.

## Overview

The configuration properties are usually set by providing an `application.yaml` in the current working directory of the Java process, when using the Helm charts for deployment the locations of the configuration are pre-configured and everything under the `ids` key will be placed in the `application.yaml` file. Apart from setting the configuration properties by providing a file, Spring also allows you to provide environment variables to set configuration properties. For instance, the environment variable `KEYSTORE_PEM_CERT` will overwrite the `keystore.pem.cert` property. Environment variables will override properties set in the `application.yaml` configuration.

Spring uses [relaxed binding](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties.relaxed-binding) to allow for non-exact matches, the most used relaxed rules are: kebab case vs. camel case, case-insensitive, dot vs. underscore delimiters. So all of the following notations will match the same property: `broker.autoRegister`, `broker.auto-register`, `BROKER_AUTOREGISTER`, `broker.auto_register`. 

## Spring Configuration properties

The table below show all of the configuration properties that are defined by the Core Container. At the bottom of this page a minimal example is shown of the YAML structure following this.

| Configuration Key | Type (* required) | Default | Description |
|---|---|---|---|---|
| **artifacts** |
| &nbsp;&nbsp;&nbsp;.enabled | Boolean | `true` | Whether automatic artifact handling should be enabled |
| &nbsp;&nbsp;&nbsp;.location | String | `/resources` | File location where artifacts will be stored |
| **broker** |
| &nbsp;&nbsp;&nbsp;.id | URI* | - | Broker IDS Identifier |
| &nbsp;&nbsp;&nbsp;.address | URL* | - | Broker Access URL |
| &nbsp;&nbsp;&nbsp;.autoRegister | Boolean | `true` | Automatic registration at the Broker |
| &nbsp;&nbsp;&nbsp;.profile | `MINIMAL`, `FULL` | `MINIMAL` | Self-Description Profile to share with the Broker |
| &nbsp;&nbsp;&nbsp;.reRegisterInterval | Float | `1` | Interval (in hours) for automatic re-registration |
| &nbsp;&nbsp;&nbsp;.brokerInitialDelay | Long | `10000` | Initial delay (in milliseconds) for initial Broker registration |
| &nbsp;&nbsp;&nbsp;.registrationMaxRetries | Int | `30` | Maximum of retries for initial Broker registration |
| &nbsp;&nbsp;&nbsp;.registrationBackoffPeriod | Long | `10000` | Backoff period (in milliseconds) for initial Broker registration |
| &nbsp;&nbsp;&nbsp;.brokerHealthCheckInterval | Long | `3600000` | Broker health check interval (in milliseconds) |
| **info** |
| &nbsp;&nbsp;&nbsp;.idsid | URI* | - | Connector IDS identifier |
| &nbsp;&nbsp;&nbsp;.titles | String[]* | - | Connector titles |
| &nbsp;&nbsp;&nbsp;.descriptions | String[]* | - | Connector descriptions |
| &nbsp;&nbsp;&nbsp;.accessUrl | URL[]* | - | Connector Access URL for external connectors |
| &nbsp;&nbsp;&nbsp;.curator | URI* | - | Curator of the contents of this connector, an IDS participant identifier |
| &nbsp;&nbsp;&nbsp;.maintainer | URI* | - | Technical administrator of this connector, an IDS participant identifier |
| **daps** |
| &nbsp;&nbsp;&nbsp;.url | String* | - | URL of the DAPS |
| &nbsp;&nbsp;&nbsp;.publicKey | String | - | Pre-configured public key of the DAPS |
| &nbsp;&nbsp;&nbsp;.requiredSecurityProfile | `BASE`, `TRUST`, `TRUST_PLUS` | `BASE` | Minimal required security profile |
| httpMode | `MULTIPART_FORM_DATA`, `MULTIPART_MIXED`, `REST` | `MULTIPART_MIXED` | IDS HTTP mode |
| **keystore** |
| &nbsp;&nbsp;&nbsp;.type | `PEM` | `PEM` | Type of supplied keystore |
| &nbsp;&nbsp;&nbsp;.pem.cert | String* | - | IDS Certificate PEM-based certificate Base64 encoded |
| &nbsp;&nbsp;&nbsp;.pem.key | String* | - | IDS Certificate PKCS#8-based key Base64 encoded |
| **resourceDatabase** |
| &nbsp;&nbsp;&nbsp;.hostname | String* | - | MongoDB hostname |
| &nbsp;&nbsp;&nbsp;.port | Integer | `27017` | MongoDB port |
| &nbsp;&nbsp;&nbsp;.username | String | - | MongoDB username |
| &nbsp;&nbsp;&nbsp;.password | String | - | MongoDB password |
| &nbsp;&nbsp;&nbsp;.authenticationDatabase | String | - | Authentication Database that contains the user to use |
| &nbsp;&nbsp;&nbsp;.database | String* | - | MongoDB database containing the relevant collection |
| &nbsp;&nbsp;&nbsp;.collection | String | - | MongoDB collection |
| &nbsp;&nbsp;&nbsp;.isSslEnabled | Boolean | `false` | Connect to MongoDB via SSL |
| &nbsp;&nbsp;&nbsp;.isWatchable | Boolean | `false` | Configuration on whether the MongoDB is watchable, i.e. is a replica set |
| namespaces | Map<String, String> | - | Additionally supported namespaces in IDS Infomodel classes (in the properties field) |
| **remoteAttestation** |
| &nbsp;&nbsp;&nbsp;**.ttp** |
| &nbsp;&nbsp;&nbsp;.hostname | String* | - | Hostname of the Trusted Third Party |
| &nbsp;&nbsp;&nbsp;.port | Integer | `443` | Port of the Trusted Third Party |
| &nbsp;&nbsp;&nbsp;**.tpm** |
| &nbsp;&nbsp;&nbsp;.simulator | Boolean | `false` | Deploy a simulator instead of using a physical TPM |
| &nbsp;&nbsp;&nbsp;.host | String | - | TPM Server host |
| &nbsp;&nbsp;&nbsp;.port | Integer | - | TPM Server port |
| **routes** |
| &nbsp;&nbsp;&nbsp;**.ingress** |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**.http[]** |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.id | String | - | Identifier of the route (locally unique) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.preProcessing | String[] | - | Pre processing steps to be executed |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.postProcessing | String[] | - | Post processing steps to be executed |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.port | Integer | `8080` | Exposed port for incoming traffic |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.endpoint | String | `` | Endpoint prefix for incoming traffic |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.parameters | String | `` | Additional Camel HTTP parameters |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.dataApp | String* | - | Data App Endpoint |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.clearing | Boolean | `false` | Clearing House flag for automatic clearing of message |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.dapsVerify | Boolean | `true` | DAPS Verification flag for automatic verification of incoming requests |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**.idscp[]** |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.id | String | - | Identifier of the route (locally unique) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.preProcessing | String[] | - | Pre processing steps to be executed |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.postProcessing | String[] | - | Post processing steps to be executed |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.port | Integer | `9292` | Exposed port for incoming traffic |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.attestation | Integer | `1` | Remote Attestation level |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.endpoint | String | `` | Endpoint prefix for incoming traffic |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.maxIdleTime | Long | `30000` | Maximum idle (in milliseconds) time for the websocket connection |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.dataApp | String* | - | Data App Endpoint |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.clearing | Boolean | `false` | Clearing House flag for automatic clearing of message |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.dapsVerify | Boolean | `true` | DAPS Verification flag for automatic verification of incoming requests |
| &nbsp;&nbsp;&nbsp;**.egress** |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**.http[]** |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.id | String | - | Identifier of the route (locally unique) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.preProcessing | String[] | - | Pre processing steps to be executed |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.postProcessing | String[] | - | Post processing steps to be executed |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.listenPort | Integer | `8080` | Exposed port for internal traffic |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.endpoint | String | `https_out` | Endpoint prefix for internal traffic |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.allowHTTP | Boolean | `true` | Allow plain HTTP requests |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.clearing | Boolean | `false` | Clearing House flag for automatic clearing of message |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.dapsInject | Boolean | `true` | DAPS Injection flag for automatic injection of Dynamic Attribute Tokens to outgoing requests |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.forwardHeader | String | `Forward-To` | Header used for indicating the intended recipient of the request |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**.idscp[]** |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.id | String | - | Identifier of the route (locally unique) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.preProcessing | String[] | - | Pre processing steps to be executed |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.postProcessing | String[] | - | Post processing steps to be executed |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.listenPort | Integer | `8080` | Exposed port for internal traffic |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.endpoint | String | `idscp_out` | Endpoint prefix for internal traffic |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.attestation | Integer | `1` | Remote Attestation level |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.clearing | Boolean | `false` | Clearing House flag for automatic clearing of message |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.dapsInject | Boolean | `true` | DAPS Injection flag for automatic injection of Dynamic Attribute Tokens to outgoing requests |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.forwardPort | String | `9292` | Port used for the external connector |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.forwardHeader | String | `Forward-To` | Header used for indicating the intended recipient of the request |
| **truststore** |
| &nbsp;&nbsp;&nbsp;.type | PEM, SYSTEM, ACCEPT_ALL | `PEM` | Type of supplied truststore |
| &nbsp;&nbsp;&nbsp;.pem |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.chain | String* | - | Concatenated PEM CA certificates to be loaded in the Truststore |
| **orchestrationManagerConfig** |
| &nbsp;&nbsp;&nbsp;.enableKubernetes | Boolean | `false` | Enable Kubernetes Orchestration Manager |
| &nbsp;&nbsp;&nbsp;.masterUrl | String | - | Kubernetes cluster master URL |
| &nbsp;&nbsp;&nbsp;.clientCertificate | String | - | Client certificate file |
| &nbsp;&nbsp;&nbsp;.clientKey | String | - | Client key file |
| &nbsp;&nbsp;&nbsp;.certificateAuthorityData | String | - | Certificate Authority data |
| &nbsp;&nbsp;&nbsp;.pullSecretName | String | - | Global pull-secret, used when no explicit pull-secret is given for a container |
| &nbsp;&nbsp;&nbsp;.pullPolicy | String | `IfNotPresent` | Kubernetes Image Pull Policy |
| &nbsp;&nbsp;&nbsp;.namespace | String | - | Kubernetes Namespace to use for resources, defaults to the current namespace (if in a Pod) or to "default" |
| &nbsp;&nbsp;&nbsp;.timeout | Long | `900` | Timeout (in seconds) for Kubernetes Completable Futures |
| **pef** |
| &nbsp;&nbsp;&nbsp;**.negotiation** |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.enabled | Boolean | `true` | Enable automatic Policy Negotiation |
| &nbsp;&nbsp;&nbsp;**.pdp** |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.enabled | Boolean | `true` | Boolean on whether Policy Decision is enabled |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.defaultPolicy | `DENY_UNLESS`, `ALLOW_UNLESS` | `DENY_UNLESS` | Default Policy in case no matching policy can be found |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.allowEmptyContract | Boolean | `false` | Allow incoming messages without transfer contract |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.allowUnmappableMessage | Boolean | `false` | Allow incoming message that are not supported for automatic mapping to a Policy Decision Request context |
| **security** |
| &nbsp;&nbsp;&nbsp;.enabled | Boolean | `false` | Enable Spring Security |
| &nbsp;&nbsp;&nbsp;**.users[]** |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.id | String* | - | User ID |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.password | String* | - | Password in BCrypt format |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.roles | String[] | - | User Role list |
| &nbsp;&nbsp;&nbsp;**.apiKeys[]** |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.id | String* | - | API key ID |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.key | String* | - | API key |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.roles | String[] | - | User Role list |
| **workflow** |
| &nbsp;&nbsp;&nbsp;.incrementalIds | Boolean | `false` | Use incremental identifiers rather than random UUIDs |
| &nbsp;&nbsp;&nbsp;.useOrchestration | Boolean | `false` | Boolean that indicates whether or not Data App Orchestration should be used by the workflow manager |
| &nbsp;&nbsp;&nbsp;.internalHostname | String | - | The internal hostname of this core container that can be reached by Data Apps |
| &nbsp;&nbsp;&nbsp;.saveIntermediateResults | Boolean | `false` | Debug flag for following intermediate results |

<center><strong>Configuration properties</strong></center>

## Additional properties

Additional Spring or Camel properties can be provided next to the Core Container properties. This can be used to configure the logging properties of the Core Container.

For example, the following snippet can be added to the `application.yaml` to set the global logging level to `INFO` and the Core Container logging to debug:
~~~ yaml
logging:
  level:
    root: INFO
    nl.tno.ids: DEBUG
~~~

## Example
~~~ yaml
broker:
  address: https://broker
  autoRegister: false
  id: urn:ids:broker

daps:
  url: https://daps.aisec.fraunhofer.de/v2

info:
  accessUrl:
    - http://localhost:8080
  curator: urn:ids:localhost
  descriptions:
    - IDSA Plugfest Localhost Connector
  idsid: http://plugfest2021.08.localhost.demo
  maintainer: urn:ids:localhost
  titles:
    - IDSA Plugfest Localhost Connector

keystore:
  type: PEM
  pem:
    # Truncated certificate and key
    cert: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0t...
    key: LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0t...

orchestrationManagerConfig:
  enableKubernetes: true
  pullSecretName: 'pull-secret'

routes:
  egress:
    http:
      - clearing: false
        dapsInject: true
        id: HttpsOut

truststore:
  type: ACCEPT_ALL

workflow:
  incrementalIds: true
  internalHostname: 'host.docker.internal'
  type: IDS
  useOrchestration: true
~~~