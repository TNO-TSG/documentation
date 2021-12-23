---
layout: doc
title: Message Flows
toc: true
left_menu: true
slug: communication-message-flows
---

The message flows of the TSG components follow the IDS standard with the use of the IDS Information Model and message patterns described in the standard. This page shows a couple of examples of the most used message flows that cover the majority of interactions done by the TSG components.

## Overview

The message flows selected in this documentation are the following:
* **Self Description interaction**: For retrieving the self description of a known connector without the usage of the IDS Metadata Broker.
* **Broker interaction**: For interacting with the IDS Metadata Broker, both publishing self-descriptions and querying the Metadata Broker.
* **Artifact interaction**: For interacting with the built-in artifact handling of the Core Container.
* **Data App interaction**: For interaction between two connectors with Data Apps configured for handling messages.
* **Policy Negotiation**: For interaction with the Policy Negotiation process in the Core Container.
* **DAPS interaction**: For retrieval of Dynamic Attribute Tokens (DATs) that are required for communication between two IDS Connectors.

These message flows are made specific for the TSG components, but follow the IDS standard that describes how two IDS Connectors exchange information between each other. The described flows are rather generic, especially the Data App interaction, that allow a lot of configurability and specialization to fit a wide variety of use cases.

## Self Description

The TSG Core Container provides an entrypoint for receiving `DescriptionRequestMessage`s that indicate a request for information about this connector. This can be either the full self description of the connector, but it can also request a specific element of the self description by means of the `requestedElement` property in the `DescriptionRequestMessage`.

The message flow shows both the usage of the user interface of the Core Container as the usage of an Data App to request the information. The first scenario is used to request information as a user to browse through the self description to see whether the connector has relevant information to offer. The latter scenario is intended to be used in an automated fashion, where the Data App requests additional information that it needs to properly format a "real" request to the other connector.

<div class="mermaid">
sequenceDiagram
    actor User
    participant DA as Data App
    participant TSGC as Consumer TSG Core Container
    participant TSGP as Provider TSG Core Container
    activate TSGC
    alt User Interface
    User->>TSGC: /api/description<br />{connectorId}, {accessUrl},<br />{requestedElement?}, {Accept? | Header}
    TSGC->>TSGC: Construct DescriptionRequestMessage
    else Data App
    DA->>TSGC: DescriptionRequestMessage
    end
    activate TSGP
    TSGC->>TSGP: DescriptionRequestMessage
    TSGP->>TSGP: Process Request
    TSGP-->>TSGC: DescriptionResponseMessage<br />{RequestedElement | JSON-LD}
    alt User Interface
    TSGC-->>User: RequestedElement
    else Data App
    TSGC-->>DA: DescriptionResponseMessage<br />{RequestedElement | JSON-LD}
    end
    deactivate TSGP 
    deactivate TSGC
</div>

## Broker

The Metadata Broker interactions are the primarily flows to enable the findability in the network, of both the Connectors themselves but also the resources that these Connectors provide in the network.

### Publish Self-Description

The first Metadata Broker interaction is the publication of a self description at the Broker, to make this information accessible for other components in the network. It consists out of a `ConnectorUpdateMessage` that is sent to the Broker with its self description as payload of the message. The trigger for the Core Container to start this interaction is either a fixed time interval or a change event of the metadata coming from the `ResourceManager`.

<div class="mermaid">
sequenceDiagram
    participant TSG as TSG Core Container
    participant Broker as Broker
    activate TSG
    alt Change Event
    TSG->>TSG: [ResourceManager] Self-Description change
    else Interval
    TSG->>TSG: [interval] Keep-alive Self-Description Publish
    end
    TSG->>TSG: Generate Self-Description
    activate Broker
    TSG->>Broker: ConnectorUpdateMessage
    Broker->>Broker: Persist Self-Description
    Broker-->>TSG: MessageProcessedNotification
    deactivate Broker 
    deactivate TSG
</div>

### Broker Query

The second Metadata Broker interaction is the querying of information at the Broker. Either done via the user interface of the core container or via an Data App, similar to the [Self Description](#self-description) flow. The message sent to the Broker is an `QueryMessage` with as payload an [SPARQL](https://www.w3.org/TR/rdf-sparql-query/) query. Since in most cases the intended result of a query is an Information Model object, the response is represented in JSON-LD format that can be parsed by the TSG components.

<div class="mermaid">
sequenceDiagram
    actor User
    participant DA as Data App
    participant TSG as TSG Core Container
    participant Broker as Broker
    activate TSG
    alt User Interface
    User->>TSG: /api/description/query<br />{SPARQL Query}
    TSG->>TSG: Construct QueryMessage
    else Data App
    DA->>TSG: QueryMessage<br />{SPARQL Query}
    end
    activate Broker
    TSG->>Broker: QueryMessage<br />{SPARQL Query}
    Broker->>Broker: Query Backend
    Broker-->>TSG: ResultMessage<br />{SPARQL Result | JSON-LD}
    alt User Interface
    TSG-->>User: SPARQL Result
    else Data App
    TSG-->>DA: ResultMessage<br />{SPARQL Result | JSON-LD}
    end
    deactivate Broker 
    deactivate TSG
</div>

## Artifact Request

The Artifact request flow is the most simplistic way of exchanging information between two connectors by means of artifacts. The request follows the `ids:ArtifactRequestMessage` with the identifier of the intended artifact (`requestedArtifact`) with a response in the form of an `ids:ArtifactResponseMessage`. The TSG components assume a Base64 encoded string as the payload of such an `ids:ArtifactResponseMessage` to be able to handle binary files to be exchanged.

<div class="mermaid">
sequenceDiagram
    actor User
    participant TSGC as Consumer TSG Core Container
    participant TSGP as Provider TSG Core Container

    activate User
    User->>TSGC: /api/artifacts/consumer/artifact<br />{artifact}, {connectorId},<br />{accessUrl}, {transferContract}
    activate TSGC
    TSGC->>TSGP: ArtifactRequestMessage<br />{requestedArtifact}, {transferContract}
    activate TSGP
    TSGP->>TSGP: Verify access
    TSGP->>TSGP: Retrieve Artifact
    TSGP-->>TSGC: ArtifactResponseMessage<br />{artifact | b64enc}
    deactivate TSGP
    TSGC-->>TSGC: Extract artifact
    TSGC-->>User: Artifact
    deactivate TSGC
    deactivate User
</div>

## Data App interaction

The Data App interaction is the most generic and versatile message flow, since the handling of the messages is done inside the Data Apps. The Core Container acts primarily as gateway for the message, while still checking the messages for Identification, Authentication, and Authorization purposes. The Data Apps can build in support for any of the IDS Messages described in [IDS Messages]({{ '/docs/communication-ids-messages' | relative_url }}) documentation.

Examples of Data Apps can be found in the [Existing Apps]({{ '/docs/data-apps-existing' | relative_url }}) section.

<div class="mermaid">
sequenceDiagram
    participant DAC as Consumer Data App
    participant TSGC as Consumer TSG Core Container
    participant TSGP as Provider TSG Core Container
    participant DAP as Provider Data App

    activate DAC
    activate TSGC
    DAC->>TSGC: /https_out*<br />{IDS Message | JSON-LD}, {Payload}
    activate TSGP
    TSGC->>TSGP: /router*<br />{IDS Message | JSON-LD}, {Payload}
    activate DAP
    TSGP->>DAP: /router*<br />{IDS Message | JSON-LD}, {Payload}
    DAP->>DAP: Process Message
    DAP-->>TSGP: {IDS Message | JSON-LD}, {Payload}
    deactivate DAP
    TSGP-->>TSGC: {IDS Message | JSON-LD}, {Payload}
    deactivate TSGP
    TSGC-->>DAC: {IDS Message | JSON-LD}, {Payload}
    deactivate TSGC
    DAC-->>DAC: Process Response
    deactivate DAC
</div>

## Policy Negotiation

The Policy Negotiation interaction shows the details of the process described in the [Policy Enforcement Framework]({{ '/docs/core-container-pef/#negotiation' | relative_url }}) section.

In the message flow, a lot of alternatives are modelled. To show not only the happy flow scenarios, but also the scenarios where more information is required or the contract is rejected.

<div class="mermaid">
sequenceDiagram
    actor User
    participant DA as Data App
    participant TSGC as Consumer TSG Core Container
    participant TSGP as Provider TSG Core Container
    alt User Interface
    activate User
    activate TSGC
    User->>TSGC: /api/artifacts/consumer/contractRequest<br />{connectorId}, {contractOffer | JSON-LD}, {accessUrl}
    TSGC->>TSGC: Construct ContractRequestMessage
    else Data App
    activate DA
    DA->>TSGC: ContractRequestMessage<br />{ContractRequest | JSON-LD}
    end
    activate TSGP
    TSGC->>TSGP: ContractRequestMessage<br />{ContractRequest | JSON-LD}
    TSGP->>TSGP: Evaluate ContractRequest
    alt Contract Accepted
    TSGP-->>TSGC: ContractAgreementMessage<br />{ContractAgreement | JSON-LD}
    TSGC->>TSGP: ContractAgreementMessage<br />{ContractAgreement | JSON-LD}
    TSGP-->>TSGC: MessageProcessedNotification
    alt User Interface
    deactivate TSGP
    TSGC-->>User: ContractAgreement
    else Data App
    TSGC-->>DA: ContractAgreementMessage<br />{ContractAgreement | JSON-LD}
    end
    else Contract Rejected
    TSGP-->>TSGC: ContractRejectionMessage<br />{ContractRejection | JSON-LD}
    alt User Interface
    TSGC-->>User: ContractRejection
    else Data App
    TSGC-->>DA: ContractRejectionMessage<br />{ContractRejection | JSON-LD}
    end
    end    
    deactivate User 
    deactivate DA
    deactivate TSGC
</div>

## DAPS Token Request

The DAPS Token Request is the simplest interaction, but arguably one of the most important in the workings of a dataspace. As with this request a Dynamic Attribute Token (DAT) is requested that provides the trust and information needed for the Identification and Authentication processes. The DAT received from the Dynamic Attribute Provisioning Service (DAPS) is a verifiable claim of the DAPS that the claimed identity matches the requester accompanied with the dynamic attributes the DAPS knows of the identity.

<div class="mermaid">
sequenceDiagram
    participant TSG as TSG Core Container
    participant DAPS as Dynamic Attribute Provisioning Service

    activate TSG
    TSG->>TSG: Create DAT Request Payload<br />{DatRequestPayload | JSON-LD}
    TSG->>TSG: Construct signed JWT<br />{client_assertion}
    activate DAPS
    TSG->>DAPS: /token<br />{grant_type}, {client_assertion_type}, {client_assertion}, {scope}
    DAPS->>DAPS: Verify identity and fetch dynamic attributes
    DAPS-->>TSG: Token<br />{access_token}, {token_type}
    deactivate TSG
    deactivate DAPS
</div>