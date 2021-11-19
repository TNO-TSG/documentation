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

TNO offers Helm scripts to easily deploy a TNO offered Data App or a custom Data app based on the TNO Kotlin library in your Kubernetes cluster next to the TNO Security Gateway. TNO does currently not offer support for alternative deployment strategies such as Docker Compose or Virtual Machines. 


## Overview
A Data App sits next to the Security Gateway in the Connector architecture. It can listen for specific IDS messages forwarded by the Security Gateway and perform additional tasks based on the content of those messages that are beyond the capabilities of the Security Gateway. A typical use case for a Data App  for instance may be a data consumer whose data app trains a model based on data obtained from a Data Provider. Ideally, this Data App has been certified, so that the Data Provider can trust the Data Consumer with its data to only be used for training the model. The Data App prevents the Data Consumer from directly using the data by only giving access to the resulting model and discarding the data after training.

![Tux, the Linux mascot](/assets/images/ids-connector-architecture.png)


Fusce mollis est ipsum, eget condimentum magna ultricies nec. Vivamus non metus eros. Integer magna eros, ultricies a augue in, accumsan interdum est. Nam mi risus, malesuada eu mi id, semper pellentesque leo. Suspendisse sit amet metus vel lorem elementum condimentum at in nisl. Praesent gravida nunc sed orci sagittis, eu molestie nulla pellentesque. Integer tortor sem, pulvinar et aliquet nec, luctus nec purus. Phasellus ac mauris ac lorem sagittis tempus ac eu diam. Phasellus non eleifend augue. Nunc vulputate maximus mauris, ut posuere ante eleifend id. Suspendisse aliquet ipsum non lorem gravida, sed hendrerit mauris malesuada. Vestibulum sed elit id mi varius convallis. Nullam vulputate hendrerit dictum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.

Maecenas quis mi est. Phasellus cursus urna quis volutpat malesuada. Morbi blandit malesuada ante, et pretium mauris malesuada ac. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Morbi ultrices vestibulum nibh, a malesuada lectus rutrum et. Phasellus convallis augue sed malesuada varius. Aenean efficitur lobortis mi. Proin nec nisi eros. Quisque mattis urna ex, ut sollicitudin quam elementum vitae. Mauris condimentum cursus nulla, vel pellentesque lectus mollis quis. Mauris ut libero eu magna pharetra ultricies.

## Core Container integration
Aliquam viverra, nibh non finibus fermentum, felis velit aliquam ligula, eget condimentum enim enim a neque. Nunc orci augue, interdum eget nulla eu, sagittis commodo felis. Integer imperdiet egestas nibh, nec accumsan tortor sagittis a. Praesent ac ligula convallis ex rhoncus commodo vitae eget nibh. Sed nec fermentum odio, at mollis ipsum. Vestibulum consequat a odio eget pharetra. Aliquam nibh nisl, bibendum et accumsan vel, interdum eget neque. In hac habitasse platea dictumst.

Nulla faucibus luctus eros, sed iaculis erat vestibulum non. Morbi varius dictum erat sed varius. Aenean in dui nisi. Nunc feugiat a mauris non porttitor. Donec iaculis felis a ante fermentum fermentum. Cras tortor lacus, consequat ac mauris quis, sagittis aliquet est. Donec fermentum nec metus et iaculis. Mauris cursus molestie urna, id accumsan ipsum. Praesent urna justo, luctus vitae interdum at, aliquet non tellus.

## Deployment
Aenean eget dignissim ex, ac lacinia mi. Sed varius faucibus condimentum. Curabitur a malesuada mi. Suspendisse sed nunc nec ante sagittis placerat et quis sapien. Phasellus at efficitur enim, eget venenatis sem. Aliquam at euismod nisl, ut lacinia lorem. Quisque eu quam magna. Proin pretium, tellus nec efficitur fringilla, orci nisl mollis mi, eu ullamcorper erat nunc mollis risus.

### Helm
Cras non auctor risus. Mauris mauris arcu, ornare vitae justo id, mattis bibendum orci. Fusce velit nisl, euismod tincidunt purus at, placerat volutpat dui. In ornare, velit ut pretium euismod, purus ex scelerisque enim, eget fermentum elit enim at arcu. Ut mattis lorem et urna vehicula vehicula. Proin maximus magna tellus, nec ullamcorper leo tristique nec. Suspendisse interdum consequat justo, et imperdiet lectus interdum ut. Nullam leo lorem, sodales eu mi at, vehicula cursus arcu. Aliquam in quam id ipsum molestie ullamcorper. Phasellus ac metus a dolor pharetra hendrerit sit amet luctus tortor. Mauris ipsum tortor, cursus ut viverra sit amet, auctor nec nibh. Sed urna nibh, ultricies rutrum rutrum a, cursus vitae leo. Donec pharetra, velit nec tincidunt finibus, metus est gravida libero, sit amet imperdiet enim nulla ac massa.

### Orchestration Manager
Donec a vestibulum mi. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nunc volutpat purus quam, sit amet vulputate ligula dapibus vitae. Integer porta, lectus non accumsan faucibus, elit mi luctus velit, ut egestas mi lectus nec ligula. Duis leo augue, condimentum quis nunc vel, imperdiet posuere tellus. Duis ultricies magna ac urna gravida feugiat. In fringilla pharetra ligula, in fringilla ligula pulvinar ut. Phasellus nunc lacus, tempor non sem eget, lobortis sodales est. Ut in sollicitudin ligula, eu tristique mi. Suspendisse potenti. Proin aliquet ex at tellus facilisis euismod.


