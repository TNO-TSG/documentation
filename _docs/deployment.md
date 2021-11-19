---
layout: doc
title: Deployment
toc: true
left_menu: true
slug: deployment
---

The default deployment strategy of the TSG components is using [Kubernetes](https://kubernetes.io/) as container orchestration solution. Partly, because of the feature set of Kubernetes that make administrating larger deployments better manageable. But also because Kubernetes provides a layer of abstraction for the underlying (cloud) infrastructure. This allows the deployments to be highly portable and deployable on a wide variety of ecosystems.

Another aspect of using Kubernetes is the capability of the core container to communicate with the Kubernetes API to orchestrate data apps.

Non-kubernetes deployments are possible, since the deployments rely solely on Docker containers. However, we highly discourage non-Kubernetes deployments, due to the added complexity during the life-time of the deployment, while Kubernetes primarily adds complexity on the deploy-time of deployments. 

## Helm
All of the provided components can be deployed via [Helm](https://helm.sh/). Helm Charts provide a package of resources that can be easily configured and deployed to Kubernetes. These Charts make it easy to deploy several resources in Kubernetes that have to be linked together (e.g. Deployments & Services). Helm uses a template enginge, based on Golang templates, so that with configuration properties the relevant Kubernetes resources are generated.

This configuration allows the TSG components to be deployed on almost all of the Kubernetes environments, by providing for instance the possibility to expose services via `Ingress` resources (preferred) or with so-called `LoadBalancer` or `NodePort` services.

An example of the configurabilty can be seen in the main Helm chart, with snippets for both `Ingress`-based configuration as `NodePort` service-based configuration:
~~~ yaml
coreContainer:
  # Ingress Service configuration
  ingress:
    path: /(.*)
    rewriteTarget: /$1
    clusterIssuer: letsencrypt
~~~
<center><strong><code>Ingress</code>-based core container deployment</strong></center>

~~~ yaml
coreContainer:
  # NodePort Service configuration
  nodePort:
    api: 31000
    camel: 31001
~~~
<center><strong><code>NodePort</code> service-based core container deployment</strong></center>
> _TODO: Link & sync with actual open-source_

Another powerful aspect of using Helm charts is the capability of including Helm charts as dependency for Helm chart. This allows you to include, for instance, a database solution next to your application. Or create a full TSG environment with one chart that includes the relevant sub-charts.

### Helm Charts

The available Helm charts that can be used are:
* `connector`: The main Helm chart for deploying the core container and relevant deploy-time data apps. This chart can be used standalone, or as a dependency to create a full local environment for testing purposes.
* `daps`: The Helm chart for deploying a Dynamic Attribute Provisioning Service (DAPS) for creating a new identity provider. This chart will in most scenarios be deployed for a test environment, or for a newly created dataspace.
* `example-deployment`: The Helm chart for deploying a full ecosystem with a DAPS, a Broker and two connectors. This chart is only intended for test environments and is not suited for use in production. The accompanying repository also contains scripts for setting up a Certificate Authority (CA) structure. This deployment has no dependencies to external components and can, therefore, be used as an isolated test environment.

> _TODO: Link & sync with actual open-source_

## ACME cert-manager (e.g. LetsEncrypt)

For the TLS encryption between two connectors, the default structure is to use [Automatic Certificate Management Environment (ACME)](https://datatracker.ietf.org/doc/html/rfc8555). 

## Spring Configuration

Most of the Kotlin- or Java-based applications are using [Spring Boot](https://spring.io/projects/spring-boot). This also means that all of the configuration for these components follow the Spring configuration, which allows the configuration to be manipulated in a couple of [different ways](https://docs.spring.io/spring-boot/docs/2.4.3/reference/html/spring-boot-features.html#boot-features-external-config). Most relevant:
* `application.yaml` file: primary configuration file for the components, is created by the Helm charts. This can be modified (e.g. for the core container everything in the `ids` key will be placed in this file), for the addition of configuration properties required in certain scenarios (e.g. to modify the allowed HTTP post sizes to allow large files to be transfered).
* Environment variables: configured environment variables override default properties and properties set in the `application.yaml` file. Spring uses relaxed binding for properties, which means that properties will be matched case-insensitive and ignoring dots, dashes, and underscores. For example, the `daps.pem.cert` property can be provided by the `DAPS_PEM_CERT` environment variable.

The documentation of the core container and data apps provide all of the possible configuration properties that are used by the components.