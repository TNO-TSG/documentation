---
layout: doc
title: Existing Data Apps
toc: true
left_menu: true
slug: data-apps-existing
---

TNO provides a set of Data Apps that can be deployed on your Connector. Deployment is done by extending the Helm chart of your TNO Security Gateway deployment. TNO currently offers the following Data Apps:

1. OpenAPI Data App for exposing a backend API to an IDS based data space
2. Federated Learning Data Apps for creating a Federated Learning environment within an IDS based Data Space
3. Multi Party Computation Data Apps for creating a  Multi Party Computation environment within an IDS based Data Space

## Overview
Fusce mollis est ipsum, eget condimentum magna ultricies nec. Vivamus non metus eros. Integer magna eros, ultricies a augue in, accumsan interdum est. Nam mi risus, malesuada eu mi id, semper pellentesque leo. Suspendisse sit amet metus vel lorem elementum condimentum at in nisl. Praesent gravida nunc sed orci sagittis, eu molestie nulla pellentesque. Integer tortor sem, pulvinar et aliquet nec, luctus nec purus. Phasellus ac mauris ac lorem sagittis tempus ac eu diam. Phasellus non eleifend augue. Nunc vulputate maximus mauris, ut posuere ante eleifend id. Suspendisse aliquet ipsum non lorem gravida, sed hendrerit mauris malesuada. Vestibulum sed elit id mi varius convallis. Nullam vulputate hendrerit dictum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.

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
