---
layout: doc
title: Data Workflows
toc: true
left_menu: true
slug: communication-workflows
---

> _**ALPHA**_: This feature is in alpha status, it **must** not be used in any production-like environments at this moment.

The Data Workflow management is a feature that allows for integrating data pipelines into the Core Container directly. With the certainty that a given workflow is executed given the configuration that is provided. 

Possible use-cases for this feature can be:
* Processing data from backend system(s) and providing the results via the Core Container to other organizations in the data space.
* Executing complex workflows accross multiple organization in the data space, e.g. federated learning & secure multy party computation.
* Processing input data retrieved from another organization in the data space and providing the processed data in the data space.


## Overview
The Workflow Manager combines different managers, the Orchestration Manager and the Route Manager, to provide a coherent interface between them for the specific use case of executing workflows with the Core Container. The Orchestration Manager is used to orchestrate the containers specified in the workflow and makes sure these can be accessed and the Route Manager is used to create routes to the orchestrated containers to make sure messages are actually delivered to the right containers. Also, in the routes that are created checks are done to know in which stage the workflow is in to make sure messages are only forwarded if the applications are actually expecting these.

The following figure shows the perspective of an administrator of the core container that starts a workflow via the Core Container GUI.

![Workflow overview - Click to enlarge]({{"/assets/images/drawio/workflow-manager.drawio.svg" | absolute_url}}){:.image-modal}
<center><strong>Workflow overview</strong></center>

The stepwise approach of the figure can be summarized to:
1. The Administrator starts a new workflow, see [Workflow Configuration Language](#workflow-configuration-language) for the specifics of the model used to start the workflow.
2. The Workflow Manager instructs the Orchestration Manager to start the relevant containers via the Kubernetes API.
3. The Workflow Manager creates new routes via the Route Manager with processors that follow the execution of the workflow, see [Camel Integration](#camel-integration).
4. The Workflow is started, by either receiving a message from another organization, or with a self-invocation.
5. When all steps in the workflow are finished, the Workflow Manager instructs both the Orchestration Manager and Route Manager to clean-up the resources created.

## Camel integration

The Workflow Manager integrates with Camel via the Route Manager. For all interactions between the Core Container and the Workflow App containers information must flow through the Camel routes.

This is because of the specific Workflow Manager Camel Processor that monitors the execution of the workflow in order to make sure messages are only forwarded when the application does expect them.

The current implementation allows for HTTP input & output routes, as well as, IDS Artifact output routes. More integrations will follow that allow input or output of workflows to tightly integrate with IDS as well as with backend systems (e.g. SQL, MongoDB, S3, etc.).

## IDS Integration

Currently the integrations with IDS are either on the output of the Workflow being provided as Artifact, working together with the built in Artifact Manager of the Core Container. This allows the results of workflows to be exchanged with other organizations by standard IDS interactions (`ArtifactRequestMessage`s & `ArtifactResponseMessage`s).

Also for workflows that interact with other connectors within a workflow, `InvokeOperationMessage`s are exchanged in order to securely send a message to another connector in the data space.

### Workflow Configuration Language

The Workflow Configuration Language is used to model a workflow with the relevant steps for the workflow.

An example with of a flow executing Federated Learning is shown below, with an Docker image `ids_fl_usecase` being deployed that listens on port 8080. With three steps: an initialize step, a training step, and a finalization step. The training step is the step in which the actual algorithm is executed, in this case in a loop of 5 messages with the server. So the trained model is shared with the server 5 times, during which the server also receives trained models from other parties and aggregates these which will be sent back to the workers.

<details>
<summary>Federated Learning Configuration model example</summary>
<div markdown="1">
~~~ yaml
# Remote parties participating in this workflow
parties:
    # IDS Connector Identifier of the remote party
  - id: urn:ids:server
    # Name of the remote party
    name: Server
    # Type of interaction
    type: IDS
    # Access URL for the corresponding workflow at the other party
    accessUrl: http://localhost:8080/router/workflow/2
# IDS Connector Identifier of the connector this workflow will be deployed on
idsid: urn:ids:1
# Workflow Application Docker Container details
container:
  name: fl
  image:
    name: ids_fl_usecase
    tag: latest
    pullSecretName: ""
  ports:
    - 8080
  environment:
    FL_ROLE: "1"
# Steps in the workflow
steps:
  - name: "initialize"
    # Input definitions
    input:
        # Input type
      - type: "http"
        # Endpoint the Workflow Application listens to for this input
        endpoint: "/initialize/input/1"
        # Expected parties invoking this input 
        from:
          - "urn:ids:server"
  - name: "training"
    # Dependency on steps that have to be finished first
    depends_on:
      - "initialize"
    # Output definitions
    output:
        # Output type
      - type: "http"
        # Number of outputs
        count: 5
        # Expected parties receiving this output
        to:
            # IDS identifier
          - id: "urn:ids:server"
            # Endpoint of the remote party for invocation.
            endpoint: "/training/input"
    # Input definitions
    input:
        # Input type
      - type: "http"
        # Number of inputs
        count: 5
        # Endpoint the Workflow Application listens to for this input
        endpoint: "/training/input/0"
        # Expected parties invoking this input 
        from:
          - "urn:ids:server"
  - name: "finalize"
    # Dependency on steps that have to be finished first
    depends_on:
      - "training"
    output:
      - type: "http"
        # Expected parties receiving this output
        to:
            # IDS identifier
          - id: "urn:ids:server"
            # Endpoint of the remote party for invocation.
            endpoint: "/finalize/input/0"
~~~
</div>
</details>
<br />
The flow of the example can be visualized in a flow diagram, where in black the configuration as it will be loaded on the Core Container and in gray the corresponding workflow of the Server is shown.

![Workflow example - Click to enlarge]({{"/assets/images/drawio/workflow-example.drawio.svg" | absolute_url}}){:.image-modal}
<center><strong>Workflow example</strong></center>

## Workflow Step implementation

Implementations of Workflow Apps do not require specific IDS functionality to work, for instance, this means that the applications are not required to implement the IDS Information Model.

The applications do need to adhere to the following specifications in order for the Workflow Manager to know where to send requests to. The configuration of a workflow specific will be injected to the container started by the Orchestration Manager to the `/config/workflow.json` file, an example of such an file is shown below, and follows largely the structure of the Workflow Configuration model described in previous section. Only the necessary information of the Workflow Configuration model is shared with the actual implementation.

The Workflow Apps do need to implement the endpoints that are stated in the input specifications of the workflow. So in the example below, the Workflow App needs to implement the `POST /inputEndpoint` endpoint listening on the primary port of the application.

For exchanging outputs, the combination of the `workflowOutputPrefix` and the endpoint in the output specification needs to be appended to eachother, in the example below, the application must send its results to `http://core-container:8080/workflows/0/outputEndpoint/output/0` in order for the Workflow Manager to share the output with the identifiers specified in the `to` field. The application itself does not need to differentiate between the two `to` values as this is handled in the Camel routes instantiated by the Workflow Manager.

The `from` and `to` properties, in respectively the input and output specification, contain the IDS identifiers of the other parties involved in the workflow. Where the `self` value is reserved for the use-case where the message should be sent to the connector internally, which is primarily used for the initial invocation for now to start the workflow.

<details>
<summary>workflow.json example</summary>
<div markdown="1">

~~~ json
{
  "workflowOutputPrefix": "http://core-container:8080/workflows/0",
  "steps": [
    {
      "name": "StepName",
      "inputs": [
        {
          "endpoint": "/inputEndpoint",
          "count": 1,
          "loop": 1,
          "from": [
            "self",
            "urn:ids:test"
          ]
        }
      ],
      "outputs": [
        {
          "endpoint": "/outputEndpoint/output/0",
          "count": 1,
          "loop": 1,
          "to": [
            "self",
            "urn:ids:test"
          ]
        }
      ]
    }
  ]
}
~~~
</div>
</details>
