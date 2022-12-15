---
id: space-eraser
title: Space Eraser
slug: /projects/space-eraser
---

# What if your room had a reset button?

![Image 2](/img/space-eraser/placeholder.png)

Augmented reality is useful when you're shopping for furniture, but all the stuff that’s already in your room kinda gets in the way of a good AR preview. Diminished reality techniques use AI to blend selected areas of an image with surrounding pixels—effectively cloaking individual objects—but there is still no easy way to reset your room.

Apple recently announced RoomPlan at WWDC. RoomPlan makes it easy to create a semantically labeled model of your room and “room-defining objects” using computer vision and LiDAR data.

We were excited to dig into this new API and wondered if we could leverage it to create a RESET button for your room. What shopping experiences might we unlock If we made it easier to clear out your space?

> “The ability to select and remove real objects from a scene brings us closer to a fully-editable reality.”

## Concept

![Image 10](/img/space-eraser/placeholder.png)

Space Eraser is a concept app that leverages Apple’s latest RoomPlan API to create a semantically labeled model of your room using your device’s LiDAR sensor. It maps your room in high fidelity, identifying room-defining objects, their size, position, and orientation.

![Image 2](/img/space-eraser/placeholder.png)

Live pixel data is joined with LiDAR depth data in real time to texture object meshes. When the scanning process is complete these models are mapped 1:1 on top of your camera’s live video feed using augmented reality. This “digital twin” of your room would be interactive and editable. Now you can erase anything (or everything) and start fresh.

![Image 3](/img/space-eraser/placeholder.png)

With an empty room, you could browse entire room sets quickly by swiping through curated collections from brands and influencers. The new furniture would arrange itself automatically, leveraging cues from the orientation of existing furniture and making it easy to try out completely different vibes quickly.

![Image 4](/img/space-eraser/placeholder.png)

A digital twin of your room also makes it easy to edit specific items. Select your sofa and swipe through alternatives that take aesthetic and spatial context into account. Machine learning can surface sizes, styles, and colors similar to the original sofa—or perhaps something that better matches the rest of the room.


In the near term this concept can be delivered through mobile AR, but will shine on more immersive AR headsets and highlights that adding virtual things to a real room is just the first step. The ability to select and remove real objects from a scene brings us closer to a fully-editable reality.

## Prototype

We explored two problems: how do we align the model produced by RoomPlan with your room and how do we texture the model to match your room? Can we texture it automatically?

### Aligning the Model

![Image 9](/img/space-eraser/placeholder.png)
![Image 15](/img/space-eraser/placeholder.png)

RoomPlan outputs a USDZ model. If you change the file extension to .zip and unzip you find that the USDZ is composed of individual unit cubes; one for each door, window, wall plane and “room-defining” object. These are the room-defining objects RoomPlan can currently detect.

![Image 17](/img/space-eraser/placeholder.png)
![Image 14](/img/space-eraser/placeholder.png)

`ARWorldMap` gave us everything we needed to align the model with the real room in an AR session. In iOS16 Beta 1 we had to scale the model by 100X to match life size, but this bug appears to be fixed in Beta 2.

![Image 6](/img/space-eraser/placeholder.png)
![Image 7](/img/space-eraser/placeholder.png)
![Image 8](/img/space-eraser/placeholder.png)

### Texturing the Model

When we discovered that RoomPlan exports the USDZ models without textures, the first thing we did was brainstorm ways of automatically texturing the model. The optimal method for generating textures would be to simultaneously localize and map the texture when capturing the RoomPlan. However, given an aligned room scan model and a real-time camera feed, we have the next-best thing.


To achieve auto-texturing, we reverse the graphics rendering pipeline - instead of sampling from a texture and writing to the screen, we can sample from the camera feed and write into a texture. This was difficult to achieve in RealityKit, but we created an alternate version using SceneKit and modified the shaders to match. The result is a rapidly-populated texture map that can be applied to the world’s geometry and works quite well for unoccluded distance surfaces.

![Image 12](/img/space-eraser/placeholder.png)

However, as you can see from the video above, we run into problems when objects in the room block the camera from seeing a surface, like a couch obscuring the bottom part of the wall. Thankfully, RoomPlan provides bounding box references for all the major room-defining objects, so we can determine what parts of the texture are obscured:

![Image 13](/img/space-eraser/image13.png)

By knowing exactly which pixels are obscured from view, we can now use machine learning inpainting techniques to fill the missing parts of the texture:

![Image 11](/img/space-eraser/image11.png)
![Image 5](/img/space-eraser/image5.png)

Given the size of the gaps that needed filling in, we were pleasantly surprised by the quality of results using off-the-shelf infill tools like Photoshop or https://theinpaint.com.

### Shader Work

![Image 1](/img/space-eraser/placeholder.png)
![Image 16](/img/space-eraser/placeholder.png)

With our model textured we built door and window trim generators and a shader that adds AO shadows between walls to help improve the realism.

Here’s our Room Eraser prototype in action. We adopted Apple’s “glowing line” UI to kickstart our transition and then we fade in our textures. In just a matter of seconds we’re ready to visualize an entirely new setup for these rooms.


## Learnings

A fuller account of our learnings can be found here.

* ARSessions can’t be accessed/carried on from the RoomPlan experience, making it impossible to do basic things in the capture session.
* Custom materials should allow more than one custom parameter and they should be writable. 30% of use cases not served by having only read access to one custom parameter. I want to put in a texture that I could write to. It’s in SceneKit so it’s a regression in RealityKit. That would have allowed us to texture everything.
* RoomPlan outputs in cm instead of m
* Geometry is all unit cubes stretched using transforms.
* In trying to create this demo real we wanted to capture and immediately go into AR. But there’s a forced view of the capture presenting and in that moment it’s doing processing on the data before it presents to you. While it’s doing that it’s finishing it’s work. Only after that animation is completed does it give us back the captured room object. We can then save it out to a USDZ. Apple has a function that takes a captured room and outputs a room model.
* The USDZ is difficult to work with and you lose some of the structured information. That information is still recalculable, but you lose the structured access to it. I.e. the size of the wall. Going forward if I were to start again I would base everything off the captured room models and I would completely skip the USDZ export. More work than it’s worth.
* We also found out USDZ export for these they are not axis aligned to the room, or a wall, they’re aligned to where you start your recording session. VIP
* “I would not pick RealityKit again for a project on a deadline” - Eric Florenzano