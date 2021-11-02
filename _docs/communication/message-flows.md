---
layout: doc
title: Message Flows
toc: true
left_menu: true
slug: communication-message-flows
---
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean in suscipit odio, sed maximus eros. Curabitur sagittis, metus in mollis finibus, nibh sem aliquam purus, id varius ante arcu non mi. Vivamus sem sapien, dapibus vitae tempor eget, imperdiet id elit. Nam lacinia, arcu eu eleifend porttitor, risus purus venenatis magna, nec luctus massa ex eu orci. Pellentesque lectus sem, molestie eget aliquam sit amet, aliquet at augue. Nulla facilisi. Maecenas pellentesque odio non euismod efficitur. Phasellus ornare nec ligula eu dictum. Quisque eget posuere enim, nec fringilla mi.

## Overview
> Message flows intro: self-description, broker, artifact request, data app interaction, policy negotiation, DAPS token request



Fusce mollis est ipsum, eget condimentum magna ultricies nec. Vivamus non metus eros. Integer magna eros, ultricies a augue in, accumsan interdum est. Nam mi risus, malesuada eu mi id, semper pellentesque leo. Suspendisse sit amet metus vel lorem elementum condimentum at in nisl. Praesent gravida nunc sed orci sagittis, eu molestie nulla pellentesque. Integer tortor sem, pulvinar et aliquet nec, luctus nec purus. Phasellus ac mauris ac lorem sagittis tempus ac eu diam. Phasellus non eleifend augue. Nunc vulputate maximus mauris, ut posuere ante eleifend id. Suspendisse aliquet ipsum non lorem gravida, sed hendrerit mauris malesuada. Vestibulum sed elit id mi varius convallis. Nullam vulputate hendrerit dictum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.

## Self Description
Aliquam viverra, nibh non finibus fermentum, felis velit aliquam ligula, eget condimentum enim enim a neque. Nunc orci augue, interdum eget nulla eu, sagittis commodo felis. Integer imperdiet egestas nibh, nec accumsan tortor sagittis a. Praesent ac ligula convallis ex rhoncus commodo vitae eget nibh. Sed nec fermentum odio, at mollis ipsum. Vestibulum consequat a odio eget pharetra. Aliquam nibh nisl, bibendum et accumsan vel, interdum eget neque. In hac habitasse platea dictumst.

## Broker
Nulla faucibus luctus eros, sed iaculis erat vestibulum non. Morbi varius dictum erat sed varius. Aenean in dui nisi. Nunc feugiat a mauris non porttitor. Donec iaculis felis a ante fermentum fermentum. Cras tortor lacus, consequat ac mauris quis, sagittis aliquet est. Donec fermentum nec metus et iaculis. Mauris cursus molestie urna, id accumsan ipsum. Praesent urna justo, luctus vitae interdum at, aliquet non tellus.

### Publish Self-Description
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
Aenean eget dignissim ex, ac lacinia mi. Sed varius faucibus condimentum. Curabitur a malesuada mi. Suspendisse sed nunc nec ante sagittis placerat et quis sapien. Phasellus at efficitur enim, eget venenatis sem. Aliquam at euismod nisl, ut lacinia lorem. Quisque eu quam magna. Proin pretium, tellus nec efficitur fringilla, orci nisl mollis mi, eu ullamcorper erat nunc mollis risus.

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
Nam congue rutrum posuere. Fusce cursus lacus nec dolor semper viverra. Quisque justo mi, hendrerit nec ex in, luctus sagittis quam. In odio dolor, tincidunt ut dolor sit amet, rhoncus dignissim velit. Nam a turpis id justo tempor dignissim ut et ex. Quisque tristique lectus a neque consectetur, vitae finibus enim vehicula. Curabitur nec hendrerit elit. Curabitur quis tortor et neque auctor varius. Donec hendrerit facilisis eros vel tincidunt. Fusce in leo urna. Sed at tempor ipsum, id dignissim orci. Proin maximus leo lacus, vel varius massa tempor at. Proin facilisis felis ut interdum malesuada.
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
In efficitur feugiat augue nec malesuada. Vestibulum et scelerisque urna. Mauris magna nisl, pharetra id elementum ac, mattis a lorem. Proin vel mattis purus. Nullam laoreet augue eros, at facilisis eros blandit eu. Vivamus quis purus quis ipsum pellentesque pellentesque. Sed sit amet augue iaculis ipsum dignissim volutpat non id sapien. Donec et quam et diam tempus volutpat vel eu purus. Praesent ultrices augue odio, rhoncus convallis lacus fringilla vestibulum. In a facilisis tortor. Etiam vitae dolor et mauris lacinia vulputate. Etiam vitae mi eget est malesuada sollicitudin. Nulla at viverra est, in lobortis urna.



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

Cras non auctor risus. Mauris mauris arcu, ornare vitae justo id, mattis bibendum orci. Fusce velit nisl, euismod tincidunt purus at, placerat volutpat dui. In ornare, velit ut pretium euismod, purus ex scelerisque enim, eget fermentum elit enim at arcu. Ut mattis lorem et urna vehicula vehicula. Proin maximus magna tellus, nec ullamcorper leo tristique nec. Suspendisse interdum consequat justo, et imperdiet lectus interdum ut. Nullam leo lorem, sodales eu mi at, vehicula cursus arcu. Aliquam in quam id ipsum molestie ullamcorper. Phasellus ac metus a dolor pharetra hendrerit sit amet luctus tortor. Mauris ipsum tortor, cursus ut viverra sit amet, auctor nec nibh. Sed urna nibh, ultricies rutrum rutrum a, cursus vitae leo. Donec pharetra, velit nec tincidunt finibus, metus est gravida libero, sit amet imperdiet enim nulla ac massa.

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