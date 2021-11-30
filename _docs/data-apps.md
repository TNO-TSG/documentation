---
layout: doc
title: Data Apps
toc: true
left_menu: true
slug: data-apps
---

Data Apps are applications that can be integrated into the data exchange workflow between two or more participants in the International Data Spaces. Data Apps can be used by Connectors for specific data processing or data transformation tasks. They can perform tasks of different complexity, ranging from simple data transformation to complex data analytics. An example of data transformation may be a Data App parsing a single string field with address information and producing a data structure consisting of street  name and number, zip code, name of the city, and name of the country. An example of complex data analytics may be a data app providing Machine Learning services. Data apps are to be deployed next to the secure gateway as part of the Connector and can be deployed by any participant within the IDS based data space. 

TNO offers a small collection of Data Apps that can be easily deployed next to the TNO Security Gateway as part of the Connector. Alternatively, if none of the offered Data Apps cover your specific use case, TNO also offers a Kotlin library to write your own Data Apps in Kotlin.

> In the future, Data Apps can also be obtained through officially recognized and trusted IDS App stores. Such Data Apps usually require to pass a certification process and therefore can attain a higher level of trust, which may be a requirement for the processing of highly sensitive data. However, Currently there are no officially recognized IDS App Stores in operation and this is still an active area of research and development orchestrated by the IDSA.

## Overview
A Data App sits next to the Security Gateway in the Connector architecture. It can listen for specific IDS messages forwarded by the Security Gateway and perform additional tasks based on the content of those messages that are beyond the capabilities of the Security Gateway. A typical use case for a Data App  for instance may be a data consumer whose data app trains a model based on data obtained from a Data Provider. Ideally, this Data App has been certified, so that the Data Provider can trust the Data Consumer with its data to only be used for training the model. The Data App prevents the Data Consumer from directly using the data by only giving access to the resulting model and discarding the data after training.

The diagram below shows the high level architecture of a Connector with Data Apps and the interaction between a Data App and the Security Gateway.

![Connector architecture with Data Apps](/assets/images/ids-connector-architecture.png)

## Deployment
TNO offers Helm scripts to easily deploy a TNO offered Data App or a custom Data app based on the TNO Kotlin library in your Kubernetes cluster next to the TNO Security Gateway. TNO does currently not offer support for alternative deployment strategies such as Docker Compose or Virtual Machines. To deploy a Data App yourself in your connector, you can follow the steps in either running an [existing Data App](data-apps/existing.md) or in [Building your own Data App](data-apps/build-your-own.md).

### Orchestration Manager
Running Data Apps can be monitored and managed from the Orchestration Manager, which can be viewed from the TNO Security Gateway UI.


