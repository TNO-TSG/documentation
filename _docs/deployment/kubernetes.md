---
layout: doc
title: Kubernetes
toc: true
left_menu: true
slug: deployment-kubernetes
---

All of the deployments use Kubernetes as primary deployment environment. This page will layout the infrastructural requirements and the used Kubernetes concepts for reference purposes. This allows you to setup a Kubernetes environment that fits your needs.

> **TIP**: _Debugging and monitoring Kubernetes clusters can made easier by using [Lens](https://k8slens.dev/) which allows you to quickly navigate through the cluster and view the logs of containers_

## Overview
The Helm charts allow for high configurability to ensure the TSG components can run on almost all of the Kubernetes environments. However, some recommendations are made to ensure a secure and production-ready environment.

First of all, allowing ingress traffic (i.e. network traffic from outside the cluster into the cluster) is the most important aspect to carefully setup. The preferred way of doing this is by leveraging the [Ingress resources](https://kubernetes.io/docs/concepts/services-networking/ingress/) and accompanying [Ingress Controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/). As a default, the Helm charts assumes a [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/) to be present in the cluster when enabling Ingress resources for the components. Other Ingress Controllers might work, but often do require specific annotations to be provided for the Ingress. In the [Examples](#examples) section below, several tutorials are linked to setup clusters on different cloud or on-premise environments.

Another important aspect, especially in production environments, is the setup of persistent volumes. Most of the TSG components don't use [Persistent Volume Claims](https://kubernetes.io/docs/concepts/storage/persistent-volumes/), since the components themselves don't hold state. However, when deploying data apps or databases (e.g. MongoDB) next to these components, ensuring that this data is securely backed up is very important. The most convenient way for doing this is to enable backups on a cluster level, for instance by using [Velero](https://velero.io/) or [Longhorn](https://longhorn.io).


The TSG Helm charts use a couple of Kubernetes resources regularly of which a short description is given below. For a complete overview, the [Kubernetes Documentation](https://kubernetes.io/docs/concepts/) is quite extensive.

* [**Pods**](https://kubernetes.io/docs/concepts/workloads/pods/): The smallest deployable unit of computing within Kubernetes, similar to a Docker Container. A Pod contains one (or more) containers that are always co-located and co-scheduler and run in a shared context. In practice, Pods often contain only a single container and are then equivalent to a Docker Container. In some scenario's, multiple containers can live in the same Pod, for instance, when a container is added that executes some initial steps (so called init containers).
* [**Deployments**](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/): Describe the desired state of Pods, allowing, for instance, the horizontal scaling of Pods accross the cluster. Where Pods live in the same context, multiple Pods described by a Deployment can live anywhere on the cluster.
* [**Services**](https://kubernetes.io/docs/concepts/services-networking/service/): Abstract way of describing exposed services within the cluster. Services allow for exposing ports of Pods (e.g. related to Deployments), so that if there are multiple similar Pods the Service can distribute the load over the instances. The default type of services is `ClusterIP`, which means the service is only reachable from inside the cluster. These services are also used when opting for Ingress resources, as the Ingress Controller will communicate via the ClusterIP service. Cloud providers provide the possibility to use the `LoadBalancer` service type, which connects an external load balancer to the service. `NodePort` services are exposed on all of the nodes in the cluster, in most cases this type should be avoided and only used in local clusters (e.g. Docker Desktop) or in specific on-premise deployments.
* [**Config Maps**](https://kubernetes.io/docs/concepts/configuration/configmap/): Key-value pairs that store non-confidential data, in most cases the configuration used in Pods. This can be mounted to Pods by means of volumes (i.e. mounted to the filesystem of the containers) or environment variables. Updates to ConfigMaps that are mounted as volumes are automatically updated in running Pods, when mounted to environment variables Pods are restarted to reflect the new state of the ConfigMap.
* [**Secrets**](https://kubernetes.io/docs/concepts/configuration/secret/): Sensitive data that can be used in Pods as configuration (either as volumes or as environment variables). Secrets can be used for a wide variety of configuration (e.g. passwords, tokens, keys, etc.). Especially in production environments distinguishing between secrets and application configuration is very important, as often you'll be checking in the application configuration into Git (for instance in a Helm chart) and by seperating the secrets from the configuration the risk of leaking secrets is reduced.  
* [**Ingresses**](https://kubernetes.io/docs/concepts/services-networking/ingress/): Manage external access to Pods in the cluster, via primarily HTTP. Ingresses are closely related to [Ingress Controllers](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/), where the Ingress resource describes how information should be routed and the Ingress Controller actually handling these descriptions and routing traffic in the cluster.
* [**Persistent Volume (Claims)**](https://kubernetes.io/docs/concepts/storage/persistent-volumes/): Manage persistent storage that can stays online when Pods are rescheduled or moved. `PersistentVolume`s are the actual provisioned storage in the cluster, while `PersistentVolumeClaim`s are the requests for storage by users.

## Examples
### Docker-Desktop

[Docker Desktop](https://www.docker.com/products/docker-desktop) has built in support for a [local Kubernetes cluster](https://docs.docker.com/desktop/kubernetes/). The TSG deployments do work on such a Docker Desktop environment.

For exposing services on Docker Desktop, the `NodePort` service type is in most scenarios sufficient. Since the Docker Desktop cluster should be used for development only, as it is a single-node cluster without configuration options. Exposing services to outside of the machine, Ingress resources can be used in combination with a [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/deploy/#docker-desktop).

### Azure Kubernetes Service

Useful links:
* Azure Kuberenetes service: https://azure.microsoft.com/en-us/services/kubernetes-service
* NGINX Ingress Controller + Cert-Manager setup: https://docs.microsoft.com/en-us/azure/aks/ingress-tls, when not using Azure Container Registry you can use the [old version of this tutorial](https://github.com/MicrosoftDocs/azure-docs/blob/e64a0bb378c0279ed29361f196772e3af5be856c/articles/aks/ingress-tls.md)

### Amazon Elastic Kubernetes Service


Aenean eget dignissim ex, ac lacinia mi. Sed varius faucibus condimentum. Curabitur a malesuada mi. Suspendisse sed nunc nec ante sagittis placerat et quis sapien. Phasellus at efficitur enim, eget venenatis sem. Aliquam at euismod nisl, ut lacinia lorem. Quisque eu quam magna. Proin pretium, tellus nec efficitur fringilla, orci nisl mollis mi, eu ullamcorper erat nunc mollis risus.

### Rancher

Cras non auctor risus. Mauris mauris arcu, ornare vitae justo id, mattis bibendum orci. Fusce velit nisl, euismod tincidunt purus at, placerat volutpat dui. In ornare, velit ut pretium euismod, purus ex scelerisque enim, eget fermentum elit enim at arcu. Ut mattis lorem et urna vehicula vehicula. Proin maximus magna tellus, nec ullamcorper leo tristique nec. Suspendisse interdum consequat justo, et imperdiet lectus interdum ut. Nullam leo lorem, sodales eu mi at, vehicula cursus arcu. Aliquam in quam id ipsum molestie ullamcorper. Phasellus ac metus a dolor pharetra hendrerit sit amet luctus tortor. Mauris ipsum tortor, cursus ut viverra sit amet, auctor nec nibh. Sed urna nibh, ultricies rutrum rutrum a, cursus vitae leo. Donec pharetra, velit nec tincidunt finibus, metus est gravida libero, sit amet imperdiet enim nulla ac massa.
