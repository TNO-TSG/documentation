---
layout: doc
title: API
toc: true
left_menu: true
slug: core-container-api
---

The Core Container uses and exposes several APIs for interaction with the Core Container as well as for Connector-to-Connector and Data App-to-Connector communication.  

## Inter Connector API

The Inter Connector API is based around the [Information Model Messages]({{ '/docs/communication-ids-messages/' | relative_url }}) and follows the following basic structure:
- `header`: An `ids:Message` sub-class.
- `payload`: Optional arbitrary payload, might be scoped given the `header` class.

There are three communication protocols possible within IDS: HTTP MIME Multipart, IDSCPv2, IDS REST.

### HTTP MIME Multipart

The HTTP MIME Multipart protocol follows the [RFC1341 7.2](https://www.w3.org/Protocols/rfc1341/7_2_Multipart.html) standard, with either mixed (`multipart/mixed`) or form-data (`multipart/form-data`). This is the default protocol used by the Core Container

The HTTP messages are composed out of a `header` part with a JSON-LD represenstation of the `ids:Message` sub-classes and optional `payload` part.

An example of an HTTP MIME Multipart message containing an `ConnectorUpdateMessage` as `header` together with a self-description as `payload`:
~~~ http
POST /router HTTP/1.1
Host: localhost:8080
Content-Type: multipart/form-data; boundary=VWo5W0Rmj8P8IHyC84CxRYpQNM62IP
Accept: */*

--VWo5W0Rmj8P8IHyC84CxRYpQNM62IP
Content-Disposition: form-data; name="header"
Content-Type: application/ld+json

{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:ConnectorUpdateMessage",
  "@id" : "https://w3id.org/idsa/autogen/connectorUpdateMessage/5d84ce59-0b34-4483-81f5-7126976fa482",
  "ids:modelVersion" : "4.1.0",
  "ids:issued" : {
    "@value" : "2021-11-19T12:55:50.046+01:00",
    "@type" : "http://www.w3.org/2001/XMLSchema#dateTimeStamp"
  },
  "ids:issuerConnector" : {
    "@id" : "urn:ids:test"
  },
  "ids:recipientConnector" : [ {
    "@id" : "urn:ids:broker"
  } ],
  "ids:senderAgent" : {
    "@id" : "urn:ids:test"
  },
  "ids:recipientAgent" : [ {
    "@id" : "urn:ids:broker"
  } ],
  "ids:securityToken" : {
    "@type" : "ids:DynamicAttributeToken",
    "@id" : "https://w3id.org/idsa/autogen/dynamicAttributeToken/1368e56a-5f13-44fb-95d3-c9577c96a134",
    "ids:tokenValue" : "DUMMY",
    "ids:tokenFormat" : {
      "@id" : "https://w3id.org/idsa/code/JWT"
    }
  },
  "ids:affectedConnector" : {
    "@id" : "urn:ids:test"
  }
}
--VWo5W0Rmj8P8IHyC84CxRYpQNM62IP
Content-Disposition: form-data; name="payload"
Content-Type: application/ld+json

{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:TrustedConnector",
  "@id" : "urn:ids:test",
  "ids:maintainer" : {
    "@id" : "urn:ids:test"
  },
  "ids:resourceCatalog" : [ ],
  "ids:description" : [ {
    "@value" : "Test",
    "@type" : "http://www.w3.org/2001/XMLSchema#string"
  } ],
  "ids:curator" : {
    "@id" : "urn:ids:test"
  },
  "ids:inboundModelVersion" : [ "4.1.0", "4.1.1" ],
  "ids:outboundModelVersion" : "4.1.0",
  "ids:hasAgent" : [ ],
  "ids:securityProfile" : {
    "@id" : "https://w3id.org/idsa/code/TRUST_SECURITY_PROFILE"
  },
  "ids:extendedGuarantee" : [ ],
  "ids:hasDefaultEndpoint" : {
    "@type" : "ids:ConnectorEndpoint",
    "@id" : "https://w3id.org/idsa/autogen/connectorEndpoint/bfcb03d5-8724-4c7b-af16-7b4174a6e419",
    "ids:endpointInformation" : [ ],
    "ids:endpointDocumentation" : [ ],
    "ids:accessURL" : {
      "@id" : "https://test"
    }
  },
  "ids:hasEndpoint" : [ {
    "@type" : "ids:ConnectorEndpoint",
    "@id" : "https://w3id.org/idsa/autogen/connectorEndpoint/bfcb03d5-8724-4c7b-af16-7b4174a6e419",
    "ids:endpointInformation" : [ ],
    "ids:endpointDocumentation" : [ ],
    "ids:accessURL" : {
      "@id" : "https://test"
    }
  } ],
  "ids:title" : [ {
    "@value" : "Test",
    "@type" : "http://www.w3.org/2001/XMLSchema#string"
  } ]
}
--VWo5W0Rmj8P8IHyC84CxRYpQNM62IP--
~~~

### IDSCPv2

The IDS Communication Protocol version 2 (IDSCPv2) is a custom TLS-based stateful protocol. It consists of a transport layer protocol responsible for setting up a mutual authenticated, encrypted and integrity protected communication channel, and an application layer protocol that allows for the actual data exchange to be exchanged over the session.

![IDSCP v2 Overview - Click to enlarge]({{"/assets/images/IDSCP2_overview.png" | absolute_url}}){:.image-modal}
<center><strong>IDSCP v2 Overview, courtesy of Fraunhofer AISEC</strong></center>

The application layer uses Protobuf for the serialization of the `header` and `payload` parts. The message definition is as follows:
~~~ protobuf
syntax = "proto3";
message IdsMessage {
  // Arbitrary header string
  string header = 1;
  // The actual, generic message payload
  bytes payload = 2;
}
~~~

The `header` part should be represented in JSON-LD format and the `payload` part can contain an arbitrary byte array.

### IDS REST

> **Disclaimer**: The Core Container does **_not_** support IDS REST at this moment

The IDS REST protocol is intended to be the replacement of the HTTP MIME Multipart protocol, by following more closely the [Linked Data Platform W3C recommendation](https://www.w3.org/TR/ldp/).

The IDS REST protocol deviates from the Multipart and IDSCPv2 protocols with respect to the representation of the `header` part, since it doesn't use the JSON-LD representation for the `header`. Instead, a combination of HTTP method, HTTP URL, and HTTP headers is used to represent the header.

The protocol is not finalized and published yet, as soon as it is it will be linked here. This also is the reason the TSG components do not support IDS REST at this moment.

## Data App API

The current implementations of Data Apps follow the HTTP MIME Multipart protocol for exchanging information with the Core Container. At this moment this is not standardized yet and might be subject to change in the future.

Next to the standard IDS communication, a Data App can also use the Admin API to manipulate the Core Container. For instance, to provide resource descriptions to the Resource Manager module using the `/api/resources` endpoints.

Both the Multipart as the Admin API endpoints can be secured with API keys, as is detailed below in [Security](#security).

## Admin API

The internal API of the Core Container is meant to be used for administration of the Core Container by either users or deployed Data Apps. It follows largely the structure of the modules of the Core Container.

The API is used by the [Web User Interface](#todo) that allows users to interact with the Core Container. As well as, by Data Apps that are able to communicate with API keys with the endpoints of the API. See the [Security](#security) section for more information on the security of the API.

### Artifact Management

The Artifact Management API is used to interact with the built-in Artifact handling of the Core Container.

| Method | Endpoint | Required Role | Description |
| --- | --- | --- |
| **GET**{: style="color: #1391FF"} | `/api/artifacts/consumer/artifact` | `ARTIFACT_CONSUMER`{: .no-break } | Retrieve an artifact from an external connector |
| **POST**{: style="color: #009D77"} | `/api/artifacts/consumer/contractRequest` | `ARTIFACT_CONSUMER`{: .no-break } | Initiate the Contract negotiation process |
| **GET**{: style="color: #1391FF"} | `/api/artifacts/provider` | `ARTIFACT_PROVIDER_READER`{: .no-break } | List provided artifacts |
| **POST**{: style="color: #009D77"} | `/api/artifacts/provider` | `ARTIFACT_PROVIDER_MANAGER`{: .no-break } | Upload a new artifact |
| **PUT**{: style="color: #E97500"} | `/api/artifacts/provider/{artifactId}` | `ARTIFACT_PROVIDER_MANAGER`{: .no-break } | Update an existing artifact |
| **DELETE**{: style="color: #CF3030"} | `/api/artifacts/provider/{artifactId}` | `ARTIFACT_PROVIDER_MANAGER`{: .no-break } | Delete an artifact |

<center><strong>Artifact Management API endpoints</strong></center>

### Policy Enforcement Management

The Policy Enforcement Management API is used to interact with the built-in Policy Enforcement Framework. More specifically, the API is used to interact with the Policy Administration Point to manage agreed upon contracts and contract offers.

| Method | Endpoint | Required Role | Description |
| --- | --- | --- |
| **GET**{: style="color: #1391FF"} | `/api/pap/contracts` | `PEF_READER`{: .no-break } | List agreed upon contracts |
| **POST**{: style="color: #009D77"} | `/api/pap/contracts` | `PEF_MANAGER`{: .no-break } | Insert agreed upon contract |
| **GET**{: style="color: #1391FF"} | `/api/pap/contracts/{contractId}` | `PEF_MANAGER`{: .no-break } | Get agreed upon contract details |
| **DELETE**{: style="color: #CF3030"} | `/api/pap/contracts/{contractId}` | `PEF_MANAGER` | Delete agreed upon contract |
| **GET**{: style="color: #1391FF"} | `/api/pap/offers` | `PEF_READER`{: .no-break } | List contract offers |
| **POST**{: style="color: #009D77"} | `/api/pap/offers` | `PEF_MANAGER`{: .no-break } | Insert contract offer |
| **GET**{: style="color: #1391FF"} | `/api/pap/offers/{offerId}` | `PEF_MANAGER`{: .no-break } | Get contract offer details |
| **DELETE**{: style="color: #CF3030"} | `/api/pap/offers/{offerId}` | `PEF_MANAGER`{: .no-break } | Delete contract offer |

<center><strong>Policy Enforcement Management API endpoints</strong></center>

### Resource Management

The Resource Management API is used to interact with the Resource management of the Core Container, which are used to generate the self-description of the Connector. These endpoints are primarily used by Data Apps that provide resources for the Connector.

| Method | Endpoint | Required Role | Description |
| --- | --- | --- |
| **GET**{: style="color: #1391FF"} | `/api/resources` | `RESOURCE_READER`{: .no-break } | List offered resource catalogs |
| **DELETE**{: style="color: #CF3030"} | `/api/resources/{catalogId}` | `RESOURCE_MANAGER`{: .no-break } | Delete offered resource catalog |
| **GET**{: style="color: #1391FF"} | `/api/resources/{catalogId}` | `RESOURCE_READER`{: .no-break } | List offered resources in a resource catalog |
| **POST**{: style="color: #009D77"} | `/api/resources/{catalogId}` | `RESOURCE_MANAGER`{: .no-break } | Insert a resource into a resource catalog, the resource catalog will be created if it does not exist |
| **POST**{: style="color: #009D77"} | `/api/resources/{catalogId}/batch` | `RESOURCE_MANAGER`{: .no-break } | Insert a batch of resources into a resource catalog, the resource catalog will be created if it does not exist |
| **PUT**{: style="color: #E97500"} | `/api/resources/{catalogId}` | `RESOURCE_MANAGER`{: .no-break } | Update a resource in a resource catalog |
| **DELETE**{: style="color: #CF3030"} | `/api/resources/{catalogId}/{resourceId}` | `RESOURCE_MANAGER`{: .no-break } | Delete a resource in a resource catalog |

<center><strong>Resource Management API endpoints</strong></center>

### Route Management

The Route Management API is used to interact with the Camel Route Manager to administrate Camel routes and view metrics of the routes.

| Method | Endpoint | Required Role | Description |
| --- | --- | --- |
| **GET**{: style="color: #1391FF"} | `/api/routes` | `ROUTE_READER`{: .no-break } | List Apache Camel routes |
| **POST**{: style="color: #009D77"} | `/api/routes` | `ROUTE_MANAGER`{: .no-break } | Insert a new Camel route |
| **GET**{: style="color: #1391FF"} | `/api/routes/{routeId}` | `ROUTE_READER`{: .no-break } | Get details of a Camel route, including metrics |
| **DELETE**{: style="color: #CF3030"} | `/api/routes/{routeId}` | `ROUTE_MANAGER`{: .no-break } | Delete a Camel route

<center><strong>Route Management API endpoints</strong></center>

### Authentication Management

The Authentication Management API is used to interact with the Authentication Manager to administrate users and API keys that have access to the Admin API.

| Method | Endpoint | Required Role | Description |
| --- | --- | --- |
| **GET**{: style="color: #1391FF"} | `/api/auth/users` | `ADMIN`{: .no-break } | List administrative users |
| **POST**{: style="color: #009D77"} | `/api/auth/users` | `ADMIN`{: .no-break } | Insert administrative user |
| **PUT**{: style="color: #E97500"} | `/api/auth/users/{userId}` | `ADMIN`{: .no-break } | Update existing administrative user |
| **DELETE**{: style="color: #CF3030"} | `/api/auth/users/{userId}` | `ADMIN`{: .no-break } | Delete administrative user |
| **GET**{: style="color: #1391FF"} | `/api/auth/apikeys` | `ADMIN`{: .no-break } | List API keys |
| **POST**{: style="color: #009D77"} | `/api/auth/apikeys` | `ADMIN`{: .no-break } | Insert API key |
| **PUT**{: style="color: #E97500"} | `/api/auth/apikeys/{apiKeyId}` | `ADMIN`{: .no-break } | Update existing API key |
| **DELETE**{: style="color: #CF3030"} | `/api/auth/apikeys/{apiKeyId}` | `ADMIN`{: .no-break } | Delete API key |

<center><strong>Authentication Management API endpoints</strong></center>

### Self Description

The Self Description API is used to request metadata from other connectors or from the Broker.

| Method | Endpoint | Required Role | Description |
| --- | --- | --- |
| **GET**{: style="color: #1391FF"} | `/api/description/` | `DESCRIPTION_READER`{: .no-break } | Send a DescriptionRequestMessage to another connector |
| **POST**{: style="color: #009D77"} | `/api/description/query` | `DESCRIPTION_READER`{: .no-break } | Send a QueryMessage to a broker. *Note*: Not implemented at this moment |

<center><strong>Self Description API endpoints</strong></center>

### Workflow Management

The Workflow Management API is used to interact with the Workflow Manager.

| Method | Endpoint | Required Role | Description |
| --- | --- | --- |
| **GET**{: style="color: #1391FF"} | `/api/workflow` | `WORKFLOW_READER`{: .no-break } | List workflows |
| **POST**{: style="color: #009D77"} | `/api/workflow` | `WORKFLOW_MANAGER`{: .no-break } | Insert and start a new workflow |
| **POST**{: style="color: #009D77"} | `/api/workflow/group` | `WORKFLOW_MANAGER`{: .no-break } | Insert and start a group of workflows |
| **GET**{: style="color: #1391FF"} | `/api/workflow/{networkId}` | `WORKFLOW_READER`{: .no-break } | Get details and status of a workflow |
| **POST**{: style="color: #009D77"} | `/api/workflow/invoke/{workflowId}/{stepName}/{inputIndex}` | `WORKFLOW_MANAGER`{: .no-break } | Invoke a manual input step of a workflow |
| **DELETE**{: style="color: #CF3030"} | `/api/workflow/{networkId}` | `WORKFLOW_MANAGER`{: .no-break } | Delete a workflow |
| **GET**{: style="color: #1391FF"} | `/api/workflow/{networkId}/results` | `WORKFLOW_READER`{: .no-break } | Get the intermediate results of a workflow. Requires the `workflow.saveIntermediateResults` property to be `true` |

<center><strong>Workflow Management API endpoints</strong></center>

## Security

Access to the public endpoints of the connector are handled via the IDS protcols, but access to the internal endpoints (both Admin API and Data App API) can be secured via an token-based approach. At this moment, the security feature is disabled by default (`security.enabled` property), which allows any request to be handled without authentication. When this feature is enabled, there is an option to either authenticate with user credentials or with API keys. 

For user-based authentication, a user must request a token from the Core Container at the `/auth/signin` endpoint with its credentials (userid and password). When successfully authenticated, the user receives a JSON Web Token (JWT) that it must use in further requests to the Admin API as Bearer Authentication HTTP header. Tokens of users are valid for 1 hour.

For API keys, the configured API key can be used directly in the Bearer Authentication HTTP header and is primarily intended for Data Apps or applications interacting with the Core Container. API keys are valid until they are deleted via the Admin API.

Each user and API key can be assigned to roles to only allow access to specific API endpoints. The list of valid roles is:

| Role | Description |
| --- | --- |
| `ADMIN` | Administrator role for the primary administrator that has full access and inherits all of the other roles |
| `DATA_APP` | Data App role that can be given to Data Apps for managing the resources that they offer |
| `READER` | Reader role that is allowed to read all resources in the core container but not modify them |
| `ARTIFACT_PROVIDER_MANAGER` | Artifact Provider Manager role that is allowed to administrate provided artifact |
| `ARTIFACT_PROVIDER_READER` | Artifact Provider Reader role that is allowed to list provided artifacts |
| `ARTIFACT_CONSUMER` | Artifact Consumer role that is allowed to request artifacts from other connectors in the network |
| `ORCHESTRATION_MANAGER` | Orchestration Manager role that is allowed to orchestrate containers |
| `ORCHESTRATION_READER` | Orchestration Reader role that is allowed to list orchestrated containers |
| `PEF_MANAGER` | Policy Enforcement Manager role that is allowed to initiate new contracts and contract negotiations |
| `PEF_READER` | Policy Enforcement Reader role that is allowed to list agreed upon contracts and contract offers |
| `RESOURCE_MANAGER` | Resource Manager role that is allowed to modify the resources provided by the core container and data apps |
| `RESOURCE_READER` | Resource Reader role that is allowed to list resources provided by the core container and data apps |
| `ROUTE_MANAGER` | Route Manager role that is allowed to modify Camel routes offered by the Core Container |
| `ROUTE_READER` | Route Reader role that is allowed to list Camel routes offered by the Core Container |
| `DESCRIPTION_READER` | Description Reader role that is allowed to send Description Request messages to other connectors in the network |
| `WORKFLOW_MANAGER` | Workflow Manager role that is allowed to initiate new workflows |
| `WORKFLOW_READER` | Workflow Reader role that is allowed to list workflows and show the results and status of the workflow |

<center><strong>Security roles overview</strong></center>

Especially for API keys, it is wise to limit the scope of the key to just the API endpoints a Data App will use, since API keys do not have an expiration date which increases the impact of leaked API keys.


<style>
.doc-content table th:nth-of-type(1) {
    width: 10%;
}
.doc-content table th:nth-of-type(2) {
    width: 35%;
}
.doc-content table th:nth-of-type(3) {
    width: 25%;
}
.doc-content table th:nth-of-type(4) {
    width: 30%;
}
</style>