---
layout: doc
title: Communication
toc: true
left_menu: true
slug: communication
---

The communication of the different components of the TSG follows the IDS Protocols as basis. Especially the communication between two connectors follows the standards to ensure the interoperability between different IDS connector implementations.

## Overview

There are several points in the different TSG components that use either IDS Protocols or custom-made protocols for the TSG components. The primary component that combines all of the communication is the Core Container, which is the central point of the communication between other internal and external components. The figure below shows the main entrypoints of the communication. 

![Communication overview - Click to enlarge]({{"/assets/images/drawio/communication-overview.drawio.svg" | absolute_url}}){:.image-modal}
<center><strong>Communication overview</strong></center>

Given the figure above, the following communication is distinguished:
1. IDS Information Model message annotated communication.<br />Follows one of: MIME Multipart, IDSCPv2, IDS REST <sup>* Not supported at this moment</sup>
2. IDS Information Model message annotated communication (not standardized in the IDS standard).<br />The decision is made for the TSG components that the communication between the Core Container and the Data Apps follows the MIME Multipart protocol, this is not standardized in the IDS specification at this moment.
3. OAuth-like token requests.
4. IDS Information Model message annotated communication combined with Docker Registry interactions for actual retrieval of Docker Images.<br /> Downloading Docker Images will be done outside of the Core Container, to make the usage within Kubernetes not unnecessarily complex. The App Store features are not fully developed at this moment.
5. IDS Information Model message annotated communication.<br />Not fully standardized and supported by the TSG.
6. Core Container administration API.

## IDS Protocols

In the IDS specification, three different ways of exchanging information between two connectors are specified. Currently, the most used variant is the MIME Multipart, which will be superseded by the IDS REST protocol in the future. The IDSCPv2 protocol is a custom protocol that allows for more elaborate communication between connectors, with support for remote attestation.

### HTTP MIME Multipart

The HTTP MIME Multipart protocol uses the [HTTP MIME Multipart](https://datatracker.ietf.org/doc/html/rfc2046) protocol, in which two parts are specified: header and payload. The header part must contain the JSON-LD serialization of an `ids:Message` class, which contains the metadata of the message that is sent. The payload part is a mostly arbitrary part without restrictions, however, for certain `ids:Message` classes the payload must follow a certain structure (e.g. the `ids:ConnectorUpdateMessage` requires the payload to be a JSON-LD serialization of the self-description of a connector).

### IDSCPv2

The IDS Communication Protocol version 2 (IDSCPv2) is a custom TLS-based stateful protocol. It consists of a transport layer protocol responsible for setting up a mutual authenticated, encrypted and integrity protected communication channel, and an application layer protocol that allows for the actual data exchange to be exchanged over the session.

### IDS REST

The IDS REST protocol is intended to be the replacement of the HTTP MIME Multipart protocol, by following more closely the [Linked Data Platform W3C recommendation](https://www.w3.org/TR/ldp/).

The IDS REST protocol deviates from the Multipart and IDSCPv2 protocols with respect to the representation of the `header` part, since it doesn't use the JSON-LD representation for the `header`. Instead, a combination of HTTP method, HTTP URL, and HTTP headers is used to represent the header.

The protocol is not finalized and published yet, as soon as it is it will be linked here. This also is the reason the TSG components do not support IDS REST at this moment.

## Relevant repositories

The relevant public repositories for the IDS Protocols:
* [TSG Organization](https://github.com/TNO-TSG) containing all of the TSG components that are using the IDS Protocols.
* [IDS-G](https://github.com/International-Data-Spaces-Association/IDS-G) containing the public IDS specification. [IDS-G Pre](https://github.com/International-Data-Spaces-Association/IDS-G-pre) & [IDS ThinkTank](https://github.com/International-Data-Spaces-Association/IDS-ThinkTank) provide input for the IDS-G repository, these repositories can only be accessed if you're an IDSA member.
* [Information Model](https://github.com/International-Data-Spaces-Association/InformationModel) containing the IDS Information Model ontology
* [Information Model Java library](https://github.com/International-Data-Spaces-Association/Java-Representation-of-IDS-Information-Model) containing the Java library for (de)serialization of the IDS Information Model
* [IDSCPv2 Java library](https://github.com/International-Data-Spaces-Association/idscp2-jvm)
