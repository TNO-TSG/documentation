---
layout: doc
title: Overview
toc: true
left_menu: true
slug: overview
tags: documentation, overview
---

This documentation provides information and insights into the different components of the TNO Security Gateway (TSG).

The TSG components allows you to participate in an IDS dataspace to exchange information with other organizations with data sovereignty in mind. You will be able to participate with the provided components as-is, but your allowed to modify the components to create your own dataspace with specific use-cases in mind. The source code is open-source with the Apache 2.0 license, and is available in the [TNO TSG](https://github.com/TNO-TSG) Github organization. 

## Features

The main features of the TNO Security Gateway are of course the pilars of the [International Data Spaces](https://internationaldataspaces.org/) movement:
* **Trust**: Trust is the basis of the International Data Spaces, by means of evaluation and certification before getting granted access to the dataspace.
* **Security & Data Sovereignty**: Secure data exchanging with the certainty of remaining in control of your data, by means of security protocols and policy enforcement.
* **Ecosystem of Data**: Decentralization is a key aspect of International Data Spaces, with the principle of keeping the data as close to the source as possible and only sharing it when explicitly allowed.
* **Standardized Interoperability**: Standardized communication patterns between IDS Connectors allow the creation of different Connector implementations, of which the TSG is one.
* **Value Adding Apps**: The ability to create a modular ecosystem in which value adding applications can be added on-demand to IDS connectors.
* **Data Markets**: Data-driven services combined with the pilars above allow for new business models to thrive.

But next to these pilars, the TSG components have a unique set of features:
* **Kubernetes support**: All of the TSG components are created with support for Kubernetes in mind, that make the deployments of components robust and allow for production-ready deployments.
* **Abstractions of IDS specifics**: By means of specific Data Apps developed to enable the inclusion of existing systems.
* **Embedded Policy Enforcement**: The TSG Core Container contains an embedded Policy Enforcement Framework that supports a variety of IDS Usage Policies.
* **Easy Configuration**: The TSG components can be deployed in a wide variety of use cases, configuration of the components receives special care to prevent overwhelming configuration and allow the flexibility of the configuration.

## Getting started

This documentation is aimed to support readers that want to get more information about IDS and TSG. Ranging from deploying existing component to information on how to create new functionality.

The [**Communication**]({{ '/docs/communication' | relative_url }}) page is the starting point to get more information on how information can be shared with the TSG components.

The [**Deployment**]({{ '/docs/deployment' | relative_url }}) page is the starting point if you want to deploy TSG and participate in a dataspace.

The [**Core Container**]({{ '/docs/core-container' | relative_url }}) page is the starting point for more information on the core component of the TSG, to get in-depth information on how to interact with the internal API and how to configure the Core Container.

The [**Data Apps**]({{ '/docs/core-container' | relative_url }}) page is the starting point for more information on the Data Apps and see which Data Apps are available and how you can create your own Data App to add functionality that is not provided by one of the existing Data Apps. 