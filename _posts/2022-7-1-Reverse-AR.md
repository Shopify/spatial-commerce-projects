---
layout: post
title: What if you could bring your home shopping?
---

[Brennan_Concept_Art.mp4]

We typically use AR to visualize products in our home to see how they _look_, but AR can’t give us a sense for how products _feel_. Aesthetics matter when shopping for a couch, but it’s just as important to sit down and feel if the couch is comfortable or not. Today, only a visit to the store can deliver that tactile experience.

Recently, photogrammetry apps like [Polycam](https://poly.cam/) and [Reality Capture](https://www.capturingreality.com/realitycapture) have made it easy for anyone to create a high fidelity model of their room using their iPhone. We [previously]({% post_url 2022-6-1-Space-Eraser %}) explored using Apple’s new RoomPlan API to create high fidelity room models as well. NeRFs are an exciting breakthrough in 3D capture and rendering that are taking 3D capture to new levels of fidelity.

[Polycam.mp4]

We wondered if we could use these technologies to deliver the best of both worlds: _look_ and _feel_. We explored what it would be like to reverse the role AR typically plays: instead of rendering a _virtual thing_ in a _real room_ we’d render a _virtual room_ around a _real thing_.

> “We’ve turned traditional augmented reality on its head.”

## Concept

[Reverse_AR_Concept.mp4]

Reversing AR makes it easy for shoppers to touch a product directly and see it in their space instantly. Before arriving at the store, shoppers take just a few moments to create a high fidelity model of their room by recording a short video. Still frames from the video are used to build a detailed 3D model of the room in seconds which can be used again and again in any store.

In a store, shoppers use their phone or AR glasses to project their 3D room model into the environment. Computer vision systems segment furniture and people from their camera feed and composite them into the virtual room.

> “Now shoppers can sit on the real thing and see if it fits their space at the same time.”

Multiplayer capabilities allow two shoppers to view the same scene simultaneously, making it easier to discuss ideas. Gestures can be used to control the orientation of the room, creating some mind-bending moments.

Merchants could offer shoppers multiple scenes to showcase the versatility of a piece—in a Paris flat, a modern mountain cabin, or next to an infinity pool nestled in a desert oasis.

## Exploration

In exploring this concept we had to solve two problems. We had to leverage existing APIs to classify and segment a piece of furniture from a scene in real time and we needed to render the live segmented video and virtual room together with a high degree of realism.

We began by exploring classification and segmentation using [YOLOv3 and DeepLabV3](https://developer.apple.com/machine-learning/models/), but the quality of the segmentation didn’t pass the bar for our needs.

[Segmentation.mp4]

In parallel, we explored RealityKit’s implementation, trying to figure out why Apple’s furniture segmentation worked so well. It looked to us like they were leveraging meshes constructed from LiDAR data.

[Apple_Segmentation.mp4]

We decided to use Unity and ARFoundation to explore meshing. We built a quick demo that generates a mesh for any object classified as a sofa and applies an occlusion material to it. That way, when a piece of furniture is surrounded by a virtual room, its mesh becomes a window into the real world that reveals the real object.

[Unity_Meshing_Demo.mp4]

It captured the form well for some objects, but we weren’t happy with the edge quality. Pieces with thin parts or gaps weren’t meshed correctly, and cushions and cats poked holes in the meshes. All these problems broke the illusion.

[Meshing_Problems.mp4]

Along the way, we explored depth-based segmentation on LiDAR equipped devices, which worked surprisingly well when seated on the sofa, but not when a user stood up. This approach was promising but we needed to find a way to segment parts of the scene.

[Simple_Depth.mp4]

Then we discovered that we could use depth-based segmentation to more cleanly cut objects out of the scene if we had a bounding box to constrain the depth buffer to world space.

[Advanced_Depth.mp4]

Here’s how it works:

[Depth_Explanation_Video.mp4]

In parallel, we also needed to generate grounding shadows for real objects in the virtual scene. A top-down orthographic projection onto the floor plane of the chair’s computed mesh creates a sharp-looking shadow. Adding a gaussian blur to the effect softens the edges and makes it much more believable.

[Shadows.mp4]

## Final prototype

When you bring it all together, it’s a magical experience we can build with today’s technology. This prototype is running live in a real furniture store on an iPad Pro.

[Reverse_AR_Prototype_Montage_2.mp4]

The depth-based segmentation approach constrained by the bounding box produces incredible results, and it isn’t adversely affected by unrecognized objects like cushions and pets. In fact, with this approach, users can bring their pets into beautiful virtual worlds, even if they don’t want to come.

[Russ_Cat.mp4]