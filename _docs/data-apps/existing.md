---
layout: doc
title: Existing Data Apps
toc: true
left_menu: true
slug: data-apps-existing
---

## Overview
TNO provides a set of Data Apps that can be deployed on your Connector. Deployment is done by extending the Helm chart of your TNO Security Gateway deployment. TNO currently offers the following Data Apps:

1. OpenAPI Data App for exposing a backend API to an IDS based data space
2. Federated Learning Data Apps for creating a Federated Learning environment within an IDS based Data Space
3. Multi Party Computation Data Apps for creating a  Multi Party Computation environment within an IDS based Data Space


## OpenAPI Data App
The OpenAPI Data App is a Data App that is capable of exposing a back end API service to an IDS based Data Space using the TNO Security Gateway. By deploying the OpenAPI Data App you can easily expose any existing API service using the API's openAPI spec.
The OpenAPI Data App can be deployed alongside the TNO Security Gateway by extending the Helm scripts used to deploy the TNO Security Gateway. It can be added by extending the .containers key in the Helm chart's values yaml file as follows:

    containers:
      - type: data-app
        image: registry.ids.smart-connected.nl/openapi-data-app:IM4
        name: openapi-data-app
        # config -- Data App Configuration. Will be inserted as the application.yaml of the Data App and therefore needs an equal structure
        config:
          openApi:
            # openApiBaseUrl should provide a url to the openapi spec.
            openApiBaseUrl: http://api-spec-yaml-url
              versions:
              # version of the spec to use
              - 0.4.6  
              # You can use .agents to specify one or more backend agents.              
              agents:
              - backendUrl: http://endpoint-url                
                id: urn:scsn:12345678
                title: TNO SCSN Test Buyer Agent A Test           


## Federated Learning & Multi Party Computation
