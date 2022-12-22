---
id: retail-research-kit
title: Retail Research Kit
slug: /projects/retail-research-kit
---

# Retail Research Kit

During the course of our last project, the [Meta Quest Pro](https://www.meta.com/quest/quest-pro/) launched, which brought with it a new mix of capabilities that hasn't been brought together before: a portable VR headset, with hand and eye tracking, and color passthrough for mixed reality development. We wondered: what new use cases could this headset unlock for merchants?

![Meta Quest Pro](/img/retail-research-kit/quest-pro.jpeg)

Thinking about hand and eye tracking in particular, we thought - hey, those are the fundamental tools required to run user research studies in retail stores.

User research studies analyze the behavior of customers as they walk through a store to determine which parts of the store receive the most attention, and which parts are ignored. They use eye tracking and other sources of data to help retailers optimize their physical spaces to better serve customers. You can think of them as [Hotjar](https://www.hotjar.com/) but in real life.

If a small merchant wants to run user research studies in the store right now, they have many professional options available, but these studies can be expensive and time-consuming, and frankly they seem like a daunting undertaking. This is one of those areas where larger businesses are able to afford the time and money costs of these studies to optimize, putting small businesses under even more pressure to compete. So then we thought - what if we could send a few Quest Pro’s to a small merchant, and have them collect data in their store with a group of volunteers. Could we use that data to provide the merchant with valuable insights? Could we help small merchants compete?

That’s how we ended up exploring this idea of creating an affordable “retail research kit” with the Quest Pro.

<iframe width="960" height="960" src="/heatmap-visualization/" />

### Software preparation

First, we needed some software that could connect to the headset and request the user's position and orientation, and do the same for each hand's position and orientation, and the same for the gaze. After some trial-and-error, we found that at the time, Unity 2022.1.21f1 and the Built-In render pipeline was the way to go for Quest Pro (however now you can use 2022.2.1f1 and URP!) We coded up a script to save these position and orientation values over time, and another script to read those saved values and run a playback in the editor.

![Playback Video](/img/placeholder.png)

### Software preparation

The key is that all these things, the gaze, the hand position, and the user's position within the store - these are all tied together, and can be used to create secondary artifacts like heatmaps and reports. But in order to do so, you need all of this information to be correct, so when the user looks at a product, we know the right place to mark down on the heatmap.

The easy part is the hand and eye tracking, and even the user's position in space: this is all provided by the headset and is aligned together. The hard part is aligning all of this with the real world, such that the walls and floors and products really match up. To accomplish this we created a configuration mode where you load a pre-scanned 3D model of the environment, and drag it into alignment with the real environment using the controller and passthrough cameras.

![Alignment Adjustment Video](/img/retail-research-kit/TrimmedAdjust.mp4)

### In-store trial (and error)

With all of this working, we were ready to give this idea a trial run! We offered some compensation for people's time, called local Shopify stores in our area, and we found that a local store named [Paxton Gate](https://paxtongate.com/) was as eager as we were to find out more. We'd have to scan the store first into a 3D model, then load that into our research tools so that we could do the alignment and begin recording.

Then, since we really needed that scan to work before the rest could be aligned, of course the store failed to scan. We cycled through different phones, Android and iPhone, and it just turned out that scanning the whole store was too much for the software that we had based our workflow around.

![Scan Fail](/img/retail-research-kit/rs.png)

We discovered that by focusing on a smaller part of the store, we could get a scan that would complete, and we were able to use that scan for the remainder of the research. We found, after one participant had left, that for the majority the time their eyes were not tracked. So it's important to acknowledge the reality of the current state of the art, while understanding that this is brand new technology that just launched.

### Heatmaps and artifacts

With the room scan and the aligned motion capture data at our disposal, now we could use this data to drive replays, and those replays could produce artifacts like heatmaps. We developed a set of shaders with a bunch of parameters that could control the way the heatmap looked, for example the color scheme, the size and shape of the focus beam, and the length of time it takes to colorize.

This approach worked great, because it decoupled the process of analysis from the process of capture. We could use the results that were taken yesterday to gain further insights today. And when we had a new idea about how to better visualize the data, we could go back and use existing data to validate and check our insights.

![Heatmap Generation Video](/img/retail-research-kit/cyclops_sim.mp4)

## Takeaways

When everything is working, this is an invaluable and magical tool for merchants, allowing small businesses to compete with the largest corporations in doing user studies. All using technology that's within reach today. After a quick scan, some post-processing and a little debugging, we now have an interactive heatmap of the items that caught people's attention in the store, generated by our own researchers in our own environment. For a merchant who's never had easy access to this type of technology, this is now a huge opportunity.

