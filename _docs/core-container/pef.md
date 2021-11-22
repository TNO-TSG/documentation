---
layout: doc
title: Policy Enforcement Framework
toc: true
left_menu: true
slug: core-container-pef
---

The Core Container contains a custom built Policy Enforcement Framework (PEF) in the `ids-pef` module of the Core Container repository. The implementation allows policy management, policy evaluation, and policy negotiation processes to be executed. Since the PEF is called from Camel routes in the Core Container, the possibility remains to configure another PEF to be used instead of the embedded PEF.

## Overview

The Policy Enforcement Framework builds upon the [XACML](http://docs.oasis-open.org/xacml/3.0/xacml-3.0-core-spec-os-en.html) standard for the data-flow model, with the following concepts and terminology used:
* _Policy Enforcement Point_ (**PEP**): The entity that intercepts a data request/response and performs the access control, i.e. it ensures that, based on a decision, the request/response is passed through or not.
* _Policy Decision Point_ (**PDP**): The entity that evaluates an applicable policy and renders a decision, based on the context it receives from the PEP.
* _Policy Administration Point_ (**PAP**): The entity that administers policies in the scope of the PEF, will most likely provide CRUD-based support for policies for administrators as well as the ability for the PDP to request policies.
* _Policy Information Point_ (**PIP**): The entity that provides additional information that can be used during the evaluation of policies.

An overview of the interaction between these components is shown in the figure below.

<center><img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/XACML_Architecture_%26_Flow.png" alt="XACML Flow" title="XACML Flow" style="max-width: 650px;"></center>
<center><strong>XACML Flow <sup><a href="https://en.wikipedia.org/wiki/XACML" target="_blank">source</a></sup></strong></center>

The semantics of the policies themselves are based on the [IDS Policy Language](https://internationaldataspaces.org/wp-content/uploads/dlm_uploads/IDSA-Position-Paper-Usage-Control-in-the-IDS-V3..pdf), a [profile](https://www.w3.org/TR/odrl-model/#profile) on the [ODRL](https://www.w3.org/TR/odrl-model/) standard.

An overview of the ODRL model that shows the relations between the classes is shown in the figure below.

![ODRL Model - Click to enlarge](https://www.w3.org/TR/odrl-model/00Model.svg){:.image-modal}
<center><strong>ODRL Model <sup><a href="https://www.w3.org/TR/odrl-model/" target="_blank">source</a></sup></strong></center>

Within IDS, the Offer is the base class that is used before any data transactions are made, these Offers provide information what rules apply to certain assets. This information can be stored alongside resource metadata in a Metadata Broker, which allows other entities in the data space to view the offer and optionally start a negotiation process to come up to an Agreement. The Agreements are immutable and are stored in the PAP, allowing the PDP to make decisions based on these Agreements.

## IDS Policy Language

The IDS Policy Language is contained within the [IDS Information Model](https://github.com/International-Data-Spaces-Association/InformationModel/tree/v4.1.0/model/contract) and is an ODRL profile, the following table shows the relations from the IDS namespace to the ODRL namespace:

| IDS Information Model Class | ODRL Class | Explanation |
| --- | --- | --- |
| `ids:Contract`{: .no-break } | `odrl:Policy`{: .no-break } | Abstract set of rules governing the usage of a Resource. |
| `ids:ContractAgreement`{: .no-break } | `odrl:Agreement`{: .no-break } | Contract governing the actual usage of a Resource that has been agreed by all parties. |
| `ids:ContractRequest`{: .no-break } | `odrl:Request`{: .no-break } | Contract issued by the Data Consumer requesting the usage of a Resource at particular conditions. |
| `ids:ContractOffer`{: .no-break } | `odrl:Offer`{: .no-break } | Contract issued by the Data Provider offering the usage of a Resource at particular conditions. |
| `ids:Rule`{: .no-break } | `odrl:Rule`{: .no-break } | Superclass of Permissions, Prohibitions and Duties. |
| `ids:Permission`{: .no-break } | `odrl:Permission`{: .no-break } | The class of Permissions as defined in the ODRL ontology. |
| `ids:Prohibition`{: .no-break } | `odrl:Prohibition`{: .no-break } | The class of Prohibitions as defined in the ODRL ontology. |
| `ids:Duty`{: .no-break } | `odrl:Duty`{: .no-break } | The class of Duties as defined in the ODRL ontology. |
| `ids:Action`{: .no-break } | `odrl:Action`{: .no-break } | |
| `ids:Constraint`{: .no-break } | `odrl:Constraint`{: .no-break } | The class of Constraints that restrict a Rule. |
| `ids:LogicalConstraint`{: .no-break } | `odrl:LogicalConstraint`{: .no-break } | The class of Logical Constraints that restrict a Rule. A Logical Constraints is a collection of Constraints, related with each other through the ids:operand property |

<center><strong>IDS Policy Language ODRL relation <sup><a href="https://en.wikipedia.org/wiki/XACML" target="_blank">source</a></sup></strong></center>

A bare minimum `ids:ContractOffer` that allows read access to all resources is as follows:

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:ContractOffer",
  "@id" : "https://w3id.org/idsa/autogen/contractOffer/450ffa81-08a3-41c5-b44e-dc385c58d99b",
  "ids:permission" : [ {
    "@type" : "ids:Permission",
    "@id" : "https://w3id.org/idsa/autogen/permission/37372d7e-c479-40c8-ab80-094f71ac7351",
    "ids:action" : [ {
      "@id" : "https://w3id.org/idsa/code/READ"
    } ]
  } ],
  "ids:prohibition" : [ {
    "@type" : "ids:Prohibition",
    "@id" : "https://w3id.org/idsa/autogen/permission/37372d7e-c479-40c8-ab80-094f71ac7351",
    "ids:action" : [ {
      "@id" : "https://w3id.org/idsa/code/Write"
    } ]
  } ]
}
~~~

## Negotiation
The embedded PEF allows for automated negotiation of policies, see also the [Policy Negotiation Flow]({{ '/docs/communication-message-flows/#policy-negotiation' | relative_url }}). This allows consumers to send a `ids:ContractRequest` based on a `ids:ContractOffer` that, for instance, can be retrieved via the Metadata Broker or the Self-Description of the Provider. 

The automated policy negotiation is allowed to create an `ids:ContractAgreement` if and only if the `ids:ContractRequest` contains the same rules (Permission, Obligation, Duty). These rules can be only more specific than the rules of the `ids:ContractOffer`, e.g. if no `assignee` is set in the rule in the `isd:ContractOffer` the `ids:ContractRequest` may provide this while still being allowed to create the `ids:ContractAgreement`. The following rules are used by the automated negotiation:
* `permission`, `prohibition`, `duty` properties must be of equal length
* For each rule, the `assignee` must exactly match
* For each rule, the `assigner` must exactly match or if no `assigner` is provided in the `ids:ContractOffer` the `ids:ContractRequest` may provide an `assigner`
* For each rule, the `target` must exactly match
* For each rule, the `constraint` must exactly match or if no `constraint` is provided in the `ids:ContractOffer` the `ids:ContractRequest` may provide a `constraint`
* For each rule, the `action` must exactly match or if no `constraint` is provided in the `ids:ContractOffer` the `ids:ContractRequest` may provide a `action`
* For each rule, the `assetRefinement` must exactly match
* For each rule, the `preDuty` must match, the same way the `permission`, `prohibition`, `duty` are allowed to match
* For each rule, the `postDuty` must match, the same way the `permission`, `prohibition`, `duty` are allowed to match

Currently, the automated policy negotiation does not support asking an Administrator in the User Interface to provide the decision whether or not an `ids:ContractRequest` should be converted into an `ids:ContractAgreement`.

## Examples

For the examples, the Policy Classes as defined in the [Usage Control in the IDS](https://internationaldataspaces.org/wp-content/uploads/dlm_uploads/IDSA-Position-Paper-Usage-Control-in-the-IDS-V3..pdf) Position Paper are used. For clarity reasons, the examples might show only a part of the `ids:Contract` that is relevant for the policy class.

#### Allow or inhibit the usage of the data
This class of policy is an abstract category that either gives permission or prohibits a specified IDS Data Consumer to operate specified action(s) on the Data Asset without further restrictions. As mentioned before, the action "use" is a very generic action that is utilized to express all targeted usages and therefore, includes fine-grained actions such as "read", "distribute", "print", "delete", "display", and so on. When the permission to “use” the data is issued, the Data Consumer is allowed to operate any of the aforementioned actions on the data. In order to restrict the type of the actions that are allowed to be operated, the policy must address a particular action. For example, in a whitelisting approach, you want to allow your Data Consumer to read and display the data, therefore, you specify a policy that only permits the “read” and “display” actions.

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Permission",
  "@id" : "https://w3id.org/idsa/autogen/permission/16bdc430-7728-4214-8cf1-32df2d7143c5",
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/READ"
  }, {
    "@id" : "https://w3id.org/idsa/code/DISTRIBUTE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Prohibition",
  "@id" : "https://w3id.org/idsa/autogen/prohibition/3b49ae7a-04d9-4924-a9d8-82d01b955688",
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/WRITE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

#### Restrict the data usage to specific connectors
The context of IDS allows assigning more than one connector to a particular IDS party. Therefore, this class of policy addresses the condition of restricting the usage of data to specific connectors of the specified IDS Data Consumer. 

> _**NOTE**_: Not supported in the current form of the embedded PEF, which assumes `assignee` and `assigner` to be connector identifier instead of participant identifiers

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Permission",
  "@id" : "https://w3id.org/idsa/autogen/permission/b084931a-efb8-423c-9b96-06deae98d21d",
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:constraint" : [ {
    "@type" : "ids:Constraint",
    "@id" : "https://w3id.org/idsa/autogen/constraint/8aeb462f-78e4-4ad2-aa76-f23142491678",
    "ids:rightOperandReference" : {
      "@id" : "urn:ids:ConnectorIdentifier"
    },
    "ids:leftOperand" : {
      "@id" : "https://w3id.org/idsa/code/SYSTEM"
    },
    "ids:operator" : {
      "@id" : "https://w3id.org/idsa/code/SAME_AS"
    }
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/USE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

#### Restrict the data usage to a group of systems or applications
The Data Usage Control scenarios demand further restrictions on the policies that either allow or inhibit the usage of data. In order to apply the requested restrictions such as restricting the data usage into the specific systems, the corresponding policy conditions are specified. This implies that the usage of the data is permitted or prohibited when the specified conditions are met. In a policy, the conditions are indeed the prerequisite to operate the action. For example, you can instantiate a policy of this class that allows only a specified risk management system or application to use your data. This policy class faces few limitations, i.e., in order to evaluate the conditions, it requires that the systems and the applications be certified. Thus, a Data Usage Control technology can validate the certifications and enforce the policy.

> _**NOTE**_: Not supported in the current form of the embedded PEF

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Permission",
  "@id" : "https://w3id.org/idsa/autogen/permission/0689fdfd-3843-4480-83ff-35fdfd46b18a",
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:constraint" : [ {
    "@type" : "ids:LogicalConstraint",
    "@id" : "https://w3id.org/idsa/autogen/logicalConstraint/69f4987e-cb7a-42d9-9c8c-1d20b595041e",
    "ids:and" : [ {
      "@type" : "ids:Constraint",
      "@id" : "https://w3id.org/idsa/autogen/constraint/864a5580-26c1-462e-ab1c-37daa330a325",
      "ids:rightOperandReference" : {
        "@id" : "urn:ids:SystemOrApplicationIdentifier1"
      },
      "ids:leftOperand" : {
        "@id" : "https://w3id.org/idsa/code/SYSTEM"
      },
      "ids:operator" : {
        "@id" : "https://w3id.org/idsa/code/SAME_AS"
      }
    }, {
      "@type" : "ids:Constraint",
      "@id" : "https://w3id.org/idsa/autogen/constraint/480e7a93-b743-48d9-8537-f11d108795bb",
      "ids:rightOperandReference" : {
        "@id" : "urn:ids:SystemOrApplicationIdentifier2"
      },
      "ids:leftOperand" : {
        "@id" : "https://w3id.org/idsa/code/SYSTEM"
      },
      "ids:operator" : {
        "@id" : "https://w3id.org/idsa/code/SAME_AS"
      }
    } ],
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/USE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

#### Restrict the data usage to a group of users
Additionally, an IDS Data Provider may demand to restrict the usage of the data to a specific group of users. This condition addresses either the membership or the role of the users. In order to enforce such a policy, a Data Usage Control technology has to check whether a user is a member of the specified organization or has a specific role from authorized resources. 

> _**NOTE**_: Not supported in the current form of the embedded PEF

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Permission",
  "@id" : "https://w3id.org/idsa/autogen/permission/7b4f545f-21f6-47c7-bb79-4ee6244176b6",
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:constraint" : [ {
    "@type" : "ids:LogicalConstraint",
    "@id" : "https://w3id.org/idsa/autogen/logicalConstraint/d27e19ee-0ca2-4e95-b285-7e27c2eb168d",
    "ids:and" : [ {
      "@type" : "ids:Constraint",
      "@id" : "https://w3id.org/idsa/autogen/constraint/27f8fda1-bd3c-494d-b1eb-5d511cbd91ae",
      "ids:rightOperandReference" : {
        "@id" : "urn:ids:ConsumerParticipantIdentifier"
      },
      "ids:leftOperand" : {
        "@id" : "https://w3id.org/idsa/code/USER"
      },
      "ids:operator" : {
        "@id" : "https://w3id.org/idsa/code/MEMBER_OF"
      },
      "ids:pipEndpoint" : {
        "@id" : "https://pipendpoint/member_of"
      }
    }, {
      "@type" : "ids:Constraint",
      "@id" : "https://w3id.org/idsa/autogen/constraint/c3584a42-21e4-46d9-9fd3-a51e0c162268",
      "ids:rightOperandReference" : {
        "@id" : "urn:ids:RoleIdentifier"
      },
      "ids:leftOperand" : {
        "@id" : "https://w3id.org/idsa/code/USER"
      },
      "ids:operator" : {
        "@id" : "https://w3id.org/idsa/code/HAS_MEMBERSHIP"
      },
      "ids:pipEndpoint" : {
        "@id" : "https://pipendpoint/has_membership"
      }
    } ],
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/USE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

#### Restrict the data usage to specific locations
This class of policy addresses the restriction on the location of the Data Consumer. This condition refines the permitted or prohibited locations of the Data Consumers by region or bounding polygons. A bounding polygon shapes an area by indicating a set of geographical points. A policy may allow a specified Data Consumer to use data only when the assigned connector is located within the permitted area.

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Permission",
  "@id" : "https://w3id.org/idsa/autogen/permission/4ab4845b-189f-4991-baf3-fd705078cdbc",
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:constraint" : [ {
    "@type" : "ids:Constraint",
    "@id" : "https://w3id.org/idsa/autogen/constraint/48ff0aac-ed25-44d6-b21b-ddb07fa8420e",
    "ids:rightOperandReference" : {
      "@id" : "http://dbpedia.org/resource/Europe"
    },
    "ids:leftOperand" : {
      "@id" : "https://w3id.org/idsa/code/ABSOLUTE_SPATIAL_POSITION"
    },
    "ids:operator" : {
      "@id" : "https://w3id.org/idsa/code/SPATIAL_EQUALS"
    }
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/USE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

#### Restrict the data usage for specific purposes
This category represents another highly demanded class of policy that restricts the usage of data to specific purposes. In order to formulate the purpose of usage in a policy and later on, enforce it to the system, we need to define licenses and certifications. This concept is still evolving in the context of International Data Spaces. “If the purpose is risk management, then allow the usage of data and else if the purpose is marketing, then inhibit the usage of data” is an example policy that is instantiated from this policy class. 

> _**NOTE**_: Not supported in the current form of the embedded PEF, which assumes a Camel header to be set for exchanging purpose information instead of using a PIP.

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Permission",
  "@id" : "https://w3id.org/idsa/autogen/permission/3aa26432-1043-4692-bad2-d667d3758a9f",
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:constraint" : [ {
    "@type" : "ids:Constraint",
    "@id" : "https://w3id.org/idsa/autogen/constraint/c655bc36-e6c1-4d96-a50c-6ca999856832",
    "ids:rightOperandReference" : {
      "@id" : "urn:ids:PurposeIdentifier"
    },
    "ids:leftOperand" : {
      "@id" : "https://w3id.org/idsa/code/PURPOSE"
    },
    "ids:operator" : {
      "@id" : "https://w3id.org/idsa/code/SAME_AS"
    },
    "ids:pipEndpoint" : {
      "@id" : "/purpose"
    }
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/USE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

#### Restrict the data usage when a specific event has occurred
This class of policy represents the permission or prohibition of using data under specific conditions; in the circumstances that the usage of data must be restricted due to the occurrences of specific events, a policy of this type can be constructed. Similar to the previous classes and in order to specify policies such as “if an accident occurred, provide permission to read the geographic location” or “provide permission to a Data Consumer to use the data during the exhibition”, we need to formulate the events. Therefore, a Data Provider can specify the conditions that address “when accident occurred” or “during the exhibition”. The assumption is that a set of possible events are defined in the context of International Data Spaces and are available to the ones who specify the policies. As a result, a data usage control technology is able to interpret the events and restrict the data usage accordingly. 

> _**NOTE**_: Not supported in the current form of the embedded PEF, the PIP interaction is not supported right now.

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Permission",
  "@id" : "https://w3id.org/idsa/autogen/permission/6c822cf5-53ac-4823-86f8-5ac008e2c8bd",
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:constraint" : [ {
    "@type" : "ids:Constraint",
    "@id" : "https://w3id.org/idsa/autogen/constraint/0b587777-2c5b-454a-80d9-a92361bcf78f",
    "ids:rightOperandReference" : {
      "@id" : "urn:ids:EventIdentifier"
    },
    "ids:leftOperand" : {
      "@id" : "https://w3id.org/idsa/code/EVENT"
    },
    "ids:operator" : {
      "@id" : "https://w3id.org/idsa/code/SAME_AS"
    },
    "ids:pipEndpoint" : {
      "@id" : "https://pipendpoint/event"
    }
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/USE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

#### Restrict the data usage to the security level of the connectors
The information model of IDS differentiates the connectors with respect to their security levels (i.e., base, trust and trust plus). This class of policy addresses the condition of restricting the usage of data to the security level of the connectors. Depending on what is specified in the condition, an assigned connector of a Data Consumer is allowed to use the data. 

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Permission",
  "@id" : "https://w3id.org/idsa/autogen/permission/54cbc4c7-70d4-4e8b-95da-ad4d9b6e999b",
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:constraint" : [ {
    "@type" : "ids:LogicalConstraint",
    "@id" : "https://w3id.org/idsa/autogen/logicalConstraint/46e5f678-da2a-4e48-a0b8-41686df6c98e",
    "ids:and" : [ {
      "@type" : "ids:Constraint",
      "@id" : "https://w3id.org/idsa/autogen/constraint/c5206f85-0a7b-4da6-ac85-7694ce424366",
      "ids:rightOperandReference" : {
        "@id" : "idsc:TRUST_SECURITY_PROFILE"
      },
      "ids:leftOperand" : {
        "@id" : "https://w3id.org/idsa/code/SECURITY_LEVEL"
      },
      "ids:operator" : {
        "@id" : "https://w3id.org/idsa/code/SAME_AS"
      }
    }, {
      "@type" : "ids:Constraint",
      "@id" : "https://w3id.org/idsa/autogen/constraint/ba6f54a9-dce8-4f35-aab2-7fc2dc721e6f",
      "ids:rightOperandReference" : {
        "@id" : "idsc:TRUST_PLUS_SECURITY_PROFILE"
      },
      "ids:leftOperand" : {
        "@id" : "https://w3id.org/idsa/code/SECURITY_LEVEL"
      },
      "ids:operator" : {
        "@id" : "https://w3id.org/idsa/code/SAME_AS"
      }
    } ],
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/USE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

#### Restrict the data usage to a specific time interval 
The International Data Spaces customers require further time-based constraints, i.e., allow or inhibit the usage of data in a specified time interval. A policy, for example, specifies the permission to use the data from the beginning of September 2019 to the end of November 2019. The date and time conditions can be expressed in different ways. However, it is important that the system is able to interpret the date and time conditions that are specified in the policies. For example, if “xsd:dateTimeStamp” is used as the data type that defines the date and time in the policy, the system must also be able to read it and understand it. 

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Permission",
  "@id" : "https://w3id.org/idsa/autogen/permission/29e8f7ff-2d92-49a4-9f58-6939601bda4f",
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:constraint" : [ {
    "@type" : "ids:LogicalConstraint",
    "@id" : "https://w3id.org/idsa/autogen/logicalConstraint/eb312eb5-a13f-42cc-a5aa-3f9c6451456c",
    "ids:and" : [ {
      "@type" : "ids:Constraint",
      "@id" : "https://w3id.org/idsa/autogen/constraint/82e1b1e4-d598-47af-b74a-8a0dca298657",
      "ids:leftOperand" : {
        "@id" : "https://w3id.org/idsa/code/POLICY_EVALUATION_TIME"
      },
      "ids:operator" : {
        "@id" : "https://w3id.org/idsa/code/AFTER"
      },
      "ids:rightOperand" : {
        "@value" : "2021-01-01T00:00:00Z",
        "@language" : "http://www.w3.org/2001/XMLSchema#dateTimeStamp"
      }
    }, {
      "@type" : "ids:Constraint",
      "@id" : "https://w3id.org/idsa/autogen/constraint/d1ec469c-cde0-4af7-b6fc-a84e616f8f8e",
      "ids:leftOperand" : {
        "@id" : "https://w3id.org/idsa/code/POLICY_EVALUATION_TIME"
      },
      "ids:operator" : {
        "@id" : "https://w3id.org/idsa/code/BEFORE"
      },
      "ids:rightOperand" : {
        "@value" : "2022-01-01T00:00:00Z",
        "@language" : "http://www.w3.org/2001/XMLSchema#dateTimeStamp"
      }
    } ],
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/USE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

#### Restrict the data usage to a specific time duration
Another time-based constraint is to restrict the usage of data to a specific duration of time. For example, an instantiated policy from this policy class may allow a Data Consumer to use the data for a duration of three months. The permitted period may start from a given date and time. Moreover, the corresponding data type (e.g. “xsd:duration”) must be interpreted the same in all systems.

> _**NOTE**_: Not supported in the current form of the embedded PEF.

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Permission",
  "@id" : "https://w3id.org/idsa/autogen/permission/ecf01f9c-10b7-4c77-a8c4-ddf129fb9937",
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:constraint" : [ {
    "@type" : "ids:Constraint",
    "@id" : "https://w3id.org/idsa/autogen/constraint/c768b7ae-b568-4df2-9109-0a1ec3299d89",
    "ids:leftOperand" : {
      "@id" : "https://w3id.org/idsa/code/ELAPSED_TIME"
    },
    "ids:operator" : {
      "@id" : "https://w3id.org/idsa/code/SHORTER_EQ"
    },
    "ids:rightOperand" : {
      "@value" : "PT3M",
      "@language" : "http://www.w3.org/2001/XMLSchema#duration"
    }
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/USE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

#### Use the data not more than N times
This class of policy demands to restrict the numeric count of executions of the action. For example, a policy specifies that the data can be printed only once or it can be displayed not more than ten times or in total, data cannot be used more than N times. We can only apply this kind of policies to the cases in which, the usage of data is countable. Therefore, a mechanism is needed that counts the usage of data and store it securely and locally, in order to enforce such a policy. 

> _**NOTE**_: Only supported when re-requesting the data from the Provider, not when the usage is local to the consumer.

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Permission",
  "@id" : "https://w3id.org/idsa/autogen/permission/64aebfae-b6aa-4789-a1f3-95b2dda35f19",
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:constraint" : [ {
    "@type" : "ids:Constraint",
    "@id" : "https://w3id.org/idsa/autogen/constraint/42d0c94b-b0d8-425b-bc61-d58bf6f382bb",
    "ids:leftOperand" : {
      "@id" : "https://w3id.org/idsa/code/COUNT"
    },
    "ids:operator" : {
      "@id" : "https://w3id.org/idsa/code/LTEQ"
    },
    "ids:rightOperand" : {
      "@value" : "5",
      "@language" : "http://www.w3.org/2001/XMLSchema#nonNegativeInteger"
    }
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/USE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

#### Use data and delete it after
This class of policy gives permission to a specified IDS Data Consumer to use the Data Asset and requires the Data Consumer to delete the data after. A policy of this type shall be refined to clarify when the data must be deleted; it shall be immediately after the usage or after a delay period or before a specified date and time.

> _**NOTE**_: Not supported in the current form of the embedded PEF, the DELETE duty must be supported by Data Apps using the data.

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Permission",
  "@id" : "https://w3id.org/idsa/autogen/permission/e386757a-3ef8-4e07-8daf-96c027ccff17",
  "ids:postDuty" : [ {
    "@type" : "ids:Duty",
    "@id" : "https://w3id.org/idsa/autogen/duty/a2ea30a2-59fa-4812-ac6b-63abe28ff8e1",
    "ids:assignee" : [ {
      "@id" : "urn:ids:ConsumerParticipantIdentifier"
    } ],
    "ids:assigner" : [ {
      "@id" : "urn:ids:ProviderParticipantIdentifier"
    } ],
    "ids:action" : [ {
      "@id" : "https://w3id.org/idsa/code/DELETE"
    } ],
  } ],
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/USE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

#### Modify data (in transit)
In all aforementioned cases, the policies allow the users to use the entire data, without modifications, after the conditions are met. However, there might be cases where data must be modified or partially anonymized before it is allocated to the user. The data modification must be done before the permission to use the data is granted. This class of policy represents the Data Usage Control use cases demanding to modify the data in transit; a Data Usage Control technology intercepts the data that is transmitted and applies the modifications on them.

> _**NOTE**_: Not supported in the current form of the embedded PEF, validating that the data is actually anonymized is not possible right now.

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Permission",
  "@id" : "https://w3id.org/idsa/autogen/permission/7447ecfe-10ab-4ef8-9ea2-4177c540fc6a",
  "ids:postDuty" : [ {
    "@type" : "ids:Duty",
    "@id" : "https://w3id.org/idsa/autogen/duty/5f0e6efe-b411-484e-a0ab-781b77546998",
    "ids:assignee" : [ {
      "@id" : "urn:ids:ConsumerParticipantIdentifier"
    } ],
    "ids:assigner" : [ {
      "@id" : "urn:ids:ProviderParticipantIdentifier"
    } ],
    "ids:action" : [ {
      "@id" : "https://w3id.org/idsa/code/ANONYMIZE"
    } ],
  } ],
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/USE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

#### Modify data (in rest)
This class of policy demands for the data modifications or anonymizations before the permission to use the data is granted. In contrast to the previous policy class, it demands the modifications to be done when data is stored in a database. The Data Consumer is only allowed to use the data after certain modifications have been applied to the stored data. 

> _**NOTE**_: Not supported in the current form of the embedded PEF, validating that the data is actually anonymized is not possible right now.

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Permission",
  "@id" : "https://w3id.org/idsa/autogen/permission/d8eaa3c1-c53f-4934-80d7-288a4660ccff",
  "ids:postDuty" : [ {
    "@type" : "ids:Duty",
    "@id" : "https://w3id.org/idsa/autogen/duty/ae2535ae-fc2c-4842-9ffb-2f6bd01981fc",
    "ids:assignee" : [ {
      "@id" : "urn:ids:ConsumerParticipantIdentifier"
    } ],
    "ids:assigner" : [ {
      "@id" : "urn:ids:ProviderParticipantIdentifier"
    } ],
    "ids:action" : [ {
      "@id" : "https://w3id.org/idsa/code/ANONYMIZE"
    } ],
  } ],
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/USE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

#### Log the data usage information
The IDS Data Provider requests to log the information of transferring data from their sites to their Data Consumer sites. Although, logging the information is a part of the International Data Spaces infrastructure, a Data Usage Control technology can occasionally apply the logging policies to the systems and log the usage information locally, as well. For example, it might log the information about the data anonymizations. 

> _**NOTE**_: Not supported in the current form of the embedded PEF.

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Permission",
  "@id" : "https://w3id.org/idsa/autogen/permission/736a48f4-ea42-4c58-8b02-acd11b243435",
  "ids:postDuty" : [ {
    "@type" : "ids:Duty",
    "@id" : "https://w3id.org/idsa/autogen/duty/5ec8be34-4fbc-453a-a82f-8e86ca4be418",
    "ids:assignee" : [ {
      "@id" : "urn:ids:ConsumerParticipantIdentifier"
    } ],
    "ids:assigner" : [ {
      "@id" : "urn:ids:ProviderParticipantIdentifier"
    } ],
    "ids:action" : [ {
      "@id" : "https://w3id.org/idsa/code/LOG"
    } ],
  } ],
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/USE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

#### Notify a party or a specific group of users when the data is used
The studies show that the International Data Spaces Data Providers request to be notified in a stated situation. For example, we can specify policies of this type to request to notify the Data Providers, when their data has left their sites or when it is delivered to the data consumers. The formats and possibilities of the notifications depends on which platform is used; whether it is the notification system of International Data Spaces or, for example, a mailing system. 

> _**NOTE**_: Not supported in the current form of the embedded PEF, executing the call to the notification endpoint is not supported.

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Permission",
  "@id" : "https://w3id.org/idsa/autogen/permission/285e2639-19e8-4219-a0ff-a63df175d79b",
  "ids:postDuty" : [ {
    "@type" : "ids:Duty",
    "@id" : "https://w3id.org/idsa/autogen/duty/794e19d8-e594-448b-b30a-a7f4a68e9ebf",
    "ids:assignee" : [ {
      "@id" : "urn:ids:ConsumerParticipantIdentifier"
    } ],
    "ids:assigner" : [ {
      "@id" : "urn:ids:ProviderParticipantIdentifier"
    } ],
    "ids:constraint" : [ {
      "@type" : "ids:Constraint",
      "@id" : "https://w3id.org/idsa/autogen/constraint/aa2beb7e-0237-4a3d-a799-7233aae643d7",
      "ids:rightOperandReference" : {
        "@id" : "https://notificationendpoint"
      },
      "ids:leftOperand" : {
        "@id" : "https://w3id.org/idsa/code/ENDPOINT"
      },
      "ids:operator" : {
        "@id" : "https://w3id.org/idsa/code/DEFINES_AS"
      }
    } ],
    "ids:action" : [ {
      "@id" : "https://w3id.org/idsa/code/NOTIFY"
    } ],
  } ],
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/USE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

#### Attach policy when distribute the data to a third-party
An IDS Data Provider may specify additional data usage policies to be provided to the third parties. Here, the Data Consumer is obliged to pass the specified Data Usage Control policy to the third-party and demand for an agreement before further distributing the data.

> _**NOTE**_: Not supported in the current form of the embedded PEF

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Permission",
  "@id" : "https://w3id.org/idsa/autogen/permission/583b8674-4215-4e80-aba7-4c784aecb4a6",
  "ids:preDuty" : [ {
    "@type" : "ids:Duty",
    "@id" : "https://w3id.org/idsa/autogen/duty/c4611b7d-f347-4d89-a4e9-c0bcfe4f19c4",
    "ids:assignee" : [ {
      "@id" : "urn:ids:ConsumerParticipantIdentifier"
    } ],
    "ids:assigner" : [ {
      "@id" : "urn:ids:ProviderParticipantIdentifier"
    } ],
    "ids:action" : [ {
      "@id" : "https://w3id.org/idsa/code/NEXT_POLICY"
    } ],
  } ],
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/DISTRIBUTE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

#### Distribute the data only if it is encrypted
In most of the cases, a Data Provider specifies a policy to give permission to one or more data consumers to use the data. Although, there might be cases in which the Data Consumer requires permission to further distribute the data to other users or third parties. This class of policy exclusively addresses the state of the Data Asset in case of sharing it. For example, you can specify a policy of this type to demand your Data Consumer to share your data only if it is encrypted.

> _**NOTE**_: Not supported in the current form of the embedded PEF, validating that the data is encrypted is not possible right now.

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Permission",
  "@id" : "https://w3id.org/idsa/autogen/permission/a4664fdd-e85b-4f8b-84a7-e0ea38cb90ac",
  "ids:preDuty" : [ {
    "@type" : "ids:Duty",
    "@id" : "https://w3id.org/idsa/autogen/duty/7b47ee23-be72-4e8b-8085-509a17a1c9a9",
    "ids:assignee" : [ {
      "@id" : "urn:ids:ConsumerParticipantIdentifier"
    } ],
    "ids:assigner" : [ {
      "@id" : "urn:ids:ProviderParticipantIdentifier"
    } ],
    "ids:action" : [ {
      "@id" : "https://w3id.org/idsa/code/ENCRYPT"
    } ],
  } ],
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/DISTRIBUTE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

#### Perpetual data sale restrictions
The IDS platform provides the possibility to the Data Providers to sell their Data Assets. A Data Consumer has to fulfill the conditions that are specified in a data sale contract in order to buy the Data Assets. For example, a one-time payment has to be made. This class of policy addresses the conditions that are associated to a data sale contract. 

> _**NOTE**_: Not supported in the current form of the embedded PEF, `ids:SalesAgreement` not recognized as well as validating that the payment has been done is not possible right now.

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:SalesAgreement",
  "@id" : "https://w3id.org/idsa/autogen/salesAgreement/b56e98bc-6a54-45bd-809e-b5a7638ed65f",
  "ids:provider" : {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  },
  "ids:contractStart" : {
    "@value" : "2021-11-22T14:57:56.959+01:00",
    "@type" : "http://www.w3.org/2001/XMLSchema#dateTimeStamp"
  },
  "ids:consumer" : {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  },
  "ids:permission" : [ {
    "@type" : "ids:Permission",
    "@id" : "https://w3id.org/idsa/autogen/permission/6c27f75a-452c-46f2-856c-d4ce5986c150",
    "ids:preDuty" : [ {
      "@type" : "ids:Duty",
      "@id" : "https://w3id.org/idsa/autogen/duty/7cb6d261-f40e-4643-b2b2-faba416b4c4e",
      "ids:assignee" : [ {
        "@id" : "urn:ids:ConsumerParticipantIdentifier"
      } ],
      "ids:assigner" : [ {
        "@id" : "urn:ids:ProviderParticipantIdentifier"
      } ],
      "ids:constraint" : [ {
        "@type" : "ids:Constraint",
        "@id" : "https://w3id.org/idsa/autogen/constraint/5bfc390e-ab6a-4784-83d4-daed61edd104",
        "ids:leftOperand" : {
          "@id" : "https://w3id.org/idsa/code/PAY_AMOUNT"
        },
        "ids:operator" : {
          "@id" : "https://w3id.org/idsa/code/EQ"
        },
        "ids:unit" : {
          "@id" : "http://dbpedia.org/resource/Euro"
        },
        "ids:rightOperand" : {
          "@value" : "99.99",
          "@language" : "http://www.w3.org/2001/XMLSchema#double"
        }
      } ],
      "ids:action" : [ {
        "@id" : "https://w3id.org/idsa/code/COMPENSATE"
      } ],
    } ],
    "ids:assignee" : [ {
      "@id" : "urn:ids:ConsumerParticipantIdentifier"
    } ],
    "ids:assigner" : [ {
      "@id" : "urn:ids:ProviderParticipantIdentifier"
    } ],
    "ids:action" : [ {
      "@id" : "https://w3id.org/idsa/code/USE"
    } ],
    "ids:target" : {
      "@id" : "urn:ids:ResourceIdentifier"
    }
  } ]
}
~~~
</div>
</details>

#### Rental data restrictions
In contrary to the previous class of policy, this category addresses the conditions that are associated to a data rent contract. For example, a Data Usage Control technology has to check frequently whether the monthly fee which is specified in the contract is paid by the Data Consumer.

> _**NOTE**_: Not supported in the current form of the embedded PEF, `ids:RentalAgreement` not recognized as well as validating that the payment has been done is not possible right now.

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:RentalAgreement",
  "@id" : "https://w3id.org/idsa/autogen/rentalAgreement/93191fe4-04e2-478e-b929-adb32d92f390",
  "ids:provider" : {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  },
  "ids:contractStart" : {
    "@value" : "2021-11-22T14:57:57.361+01:00",
    "@type" : "http://www.w3.org/2001/XMLSchema#dateTimeStamp"
  },
  "ids:consumer" : {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  },
  "ids:permission" : [ {
    "@type" : "ids:Permission",
    "@id" : "https://w3id.org/idsa/autogen/permission/40db8572-2359-4291-9cae-8c6a39ae8ba1",
    "ids:preDuty" : [ {
      "@type" : "ids:Duty",
      "@id" : "https://w3id.org/idsa/autogen/duty/6e6fa037-acc3-4144-859e-0475814dc9b7",
      "ids:assignee" : [ {
        "@id" : "urn:ids:ConsumerParticipantIdentifier"
      } ],
      "ids:assigner" : [ {
        "@id" : "urn:ids:ProviderParticipantIdentifier"
      } ],
      "ids:constraint" : [ {
        "@type" : "ids:Constraint",
        "@id" : "https://w3id.org/idsa/autogen/constraint/48098db5-c6a8-439a-afaf-88c8e1a0052a",
        "ids:leftOperand" : {
          "@id" : "https://w3id.org/idsa/code/PAY_AMOUNT"
        },
        "ids:operator" : {
          "@id" : "https://w3id.org/idsa/code/EQ"
        },
        "ids:unit" : {
          "@id" : "http://dbpedia.org/resource/Euro"
        },
        "ids:rightOperand" : {
          "@value" : "9.99",
          "@language" : "http://www.w3.org/2001/XMLSchema#double"
        }
      } ],
      "ids:action" : [ {
        "@id" : "https://w3id.org/idsa/code/COMPENSATE"
      } ],
    } ],
    "ids:assignee" : [ {
      "@id" : "urn:ids:ConsumerParticipantIdentifier"
    } ],
    "ids:assigner" : [ {
      "@id" : "urn:ids:ProviderParticipantIdentifier"
    } ],
    "ids:constraint" : [ {
      "@type" : "ids:Constraint",
      "@id" : "https://w3id.org/idsa/autogen/constraint/e64b8f8a-9b7c-4d6e-8875-3f404829d9c0",
      "ids:leftOperand" : {
        "@id" : "https://w3id.org/idsa/code/ELAPSED_TIME"
      },
      "ids:operator" : {
        "@id" : "https://w3id.org/idsa/code/SHORTER_EQ"
      },
      "ids:rightOperand" : {
        "@value" : "PT3M",
        "@language" : "http://www.w3.org/2001/XMLSchema#duration"
      }
    } ],
    "ids:action" : [ {
      "@id" : "https://w3id.org/idsa/code/USE"
    } ],
    "ids:target" : {
      "@id" : "urn:ids:ResourceIdentifier"
    }
  } ]
}
~~~
</div>
</details>

#### Restrict the data usage to specific state
This category represents a condition in which the usage of data is restricted to a specific state. This condition refers to an environment state but not the state of the Data Asset. Therefore, it is about the state of the contract and the connectors. If the contract is terminated or if the firewall is activated are examples for this restriction. The state of the Data Consumer connector and the contract must be known by the Data Usage Control technology, so the application can check whether the condition is fulfilled and issue permission to the Data Consumer to use the Data Asset. 

> _**NOTE**_: Not supported in the current form of the embedded PEF, the PIP interaction is not supported right now.

<details>
<summary>Click to expand example</summary>
<div markdown="1">

~~~ json
{
  "@context" : {
    "ids" : "https://w3id.org/idsa/core/",
    "idsc" : "https://w3id.org/idsa/code/"
  },
  "@type" : "ids:Permission",
  "@id" : "https://w3id.org/idsa/autogen/permission/be0d89c2-4792-4bbb-b6c8-c0d9b8aad141",
  "ids:assignee" : [ {
    "@id" : "urn:ids:ConsumerParticipantIdentifier"
  } ],
  "ids:assigner" : [ {
    "@id" : "urn:ids:ProviderParticipantIdentifier"
  } ],
  "ids:constraint" : [ {
    "@type" : "ids:Constraint",
    "@id" : "https://w3id.org/idsa/autogen/constraint/6eeb29b0-e916-4585-80c9-a5be44594a4a",
    "ids:rightOperandReference" : {
      "@id" : "urn:ids:terminatedState"
    },
    "ids:leftOperand" : {
      "@id" : "https://w3id.org/idsa/code/STATE"
    },
    "ids:operator" : {
      "@id" : "https://w3id.org/idsa/code/NOT"
    },
    "ids:pipEndpoint" : {
      "@id" : "https://pipendpoint/state"
    }
  } ],
  "ids:action" : [ {
    "@id" : "https://w3id.org/idsa/code/USE"
  } ],
  "ids:target" : {
    "@id" : "urn:ids:ResourceIdentifier"
  }
}
~~~
</div>
</details>

<style>
details[open] summary ~ * {
  animation: sweep .5s ease-in-out;
}

@keyframes sweep {
  0%    {opacity: 0; transform: translateY(-25px)}
  100%  {opacity: 1; transform: translateY(0)}
}
</style>