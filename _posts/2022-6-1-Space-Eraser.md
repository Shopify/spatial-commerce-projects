---
layout: post
title: What if your room had a reset button?
subtitle: Space_Eraser
video: https://cdn.shopify.com/videos/c/o/v/3bc293a3bf894f12b2d43bc8303e33be.mp4
---

Augmented reality is useful when you're shopping for furniture, but all the stuff that’s already in your room kinda gets in the way of a good AR preview. Diminished reality techniques use AI to blend selected areas of an image with surrounding pixels—effectively cloaking individual objects—but there is still no easy way to reset your room.

Apple recently announced a new API called [RoomPlan](https://developer.apple.com/augmented-reality/roomplan/) at WWDC. RoomPlan makes it easy to create a semantically labeled model of your room and “room-defining objects” using computer vision and LiDAR data.

We were excited to dig into this new API and wondered if we could leverage it to create a reset button for your room. What shopping experiences might we unlock If we made it easier to clear out your space?

> “The ability to select and remove real objects from a scene brings us closer to a fully-editable reality.”

# Concept

![_config.yml]({{ site.baseurl }}/images/space_eraser/space_eraser_title.gif){:.centered}

Space Eraser is a concept app that leverages Apple’s RoomPlan API to create a semantically labeled model of your room using your device’s LiDAR sensor. It maps your room in high fidelity, identifying room-defining objects, their size, position, and orientation.

![_config.yml]({{ site.baseurl }}/images/space_eraser/space_eraser_scan.gif){:.right}

Live pixel data is joined with LiDAR depth data in real time to texture object meshes. When the scanning process is complete these models are mapped 1:1 on top of your camera’s live video feed using augmented reality. This “digital twin” of your room would be interactive and editable. Now you can erase anything (or everything) and start fresh.

![_config.yml]({{ site.baseurl }}/images/space_eraser/space_eraser_popcorn.gif){:.right}

With an empty room, you could browse entire room sets quickly by swiping through curated collections from brands and influencers. The new furniture would arrange itself automatically, leveraging cues from the orientation of existing furniture and making it easy to try out completely different vibes quickly.

![_config.yml]({{ site.baseurl }}/images/space_eraser/space_eraser_swipe.gif){:.right}

A digital twin of your room also makes it easy to edit specific items. Select your sofa and swipe through alternatives that take the aesthetic and spatial context into account. Machine learning can surface sizes, styles, and colors similar to the original sofa—or perhaps something that better matches the rest of the room.

![_config.yml]({{ site.baseurl }}/images/space_eraser/space_eraser_couch_swap.gif){:.right}

In the near term this concept can be delivered through mobile AR, but it will only truly shine once more immersive AR headsets arrive, and it highlights that adding virtual things to a real room is just the first step. The ability to select and remove real objects from a scene brings us closer to a fully-editable reality.

# Prototype

We explored two problems: how do we align the model produced by RoomPlan with your room and how do we texture the model to match your room? Can we texture it automatically?

## Aligning the model

RoomPlan outputs a USDZ model. If you change the file extension to .zip and unzip you find that the USDZ is composed of individual unit cubes; one for each door, window, wall plane and “room-defining” object. These are the [room-defining objects](https://developer.apple.com/documentation/roomplan/capturedroom/object/category-swift.enum/) RoomPlan can currently detect.

{% include shopify-video.html id='https://cdn.shopify.com/videos/c/o/v/326b259bd7b94dec901337c08ced757a.mp4' width='100%' %}

`ARWorldMap` gave us everything we needed to align the model with the real room in an AR session.

{% include shopify-video.html id='https://cdn.shopify.com/videos/c/o/v/9c9ab9e5c26f4acf9a5ab4f583c8ab35.mp4' width='100%' %}

One thing surprised us: the model RoomPlan produces doesn’t include elements for the floor or ceiling, so we had to write a function to generate that geometry.

{% include shopify-video.html id='https://cdn.shopify.com/videos/c/o/v/d1fa09fff9f24b929a43009cdb5b1253.mp4' width='100%' %}

We also wrote functions to generate geometry for the baseboards and the door and window trims. Small details like those really helped sell the illusion.

{% include shopify-video.html id='https://cdn.shopify.com/videos/c/o/v/f565fe1ab5664236a5d8f4eea628494e.mp4' width='100%' %}

## Texturing the model

When we discovered that RoomPlan exports the USDZ models without textures, the first thing we did was brainstorm ways of automatically texturing the model. The optimal method for generating textures would be to simultaneously localize and map the texture when capturing the RoomPlan. However, given an aligned room scan model and a real-time camera feed, we have the next-best thing.

To achieve auto-texturing, we reverse the graphics rendering pipeline - instead of sampling from a texture and writing to the screen, we can sample from the camera feed and write into a texture. This was difficult to achieve in RealityKit, but we created an alternate version using SceneKit and modified the shaders to match. The result is a rapidly-populated texture map that can be applied to the world’s geometry and works quite well for unoccluded distance surfaces.

{% include shopify-video.html id='https://cdn.shopify.com/videos/c/o/v/95ad84097d814d78bc4f4ef875d24934.mp4' width='50%' %}

However, as you can see from the video above, we run into problems when objects in the room block the camera from seeing a surface, like the couch obscuring the bottom part of the wall. Thankfully, RoomPlan provides bounding box references for all the major room-defining objects, so we can determine what parts of the texture are obscured:

{% include shopify-video.html id='https://cdn.shopify.com/videos/c/o/v/0089804c3c8c4d26bcdd7991a66f8b7c.mp4' width='100%' %}

By knowing exactly which pixels are obscured from view, we can now use machine learning inpainting techniques to fill the missing parts of the texture:

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/space_eraser/floor_with_gaps.png){:style="width:49%;"}
![_config.yml]({{ site.baseurl }}/images/space_eraser/floor_infilled.png){:style="width:49%;"}

Given the size of the gaps that needed filling in, we were pleasantly surprised by the quality of results using off-the-shelf infill tools like Photoshop or [Inpaint](https://theinpaint.com).

## Rendering the model

With our model textured we wrote a shader that reveals it in a fun way and that adds AO shadows between walls to help improve the realism.

Here’s our Space Eraser prototype in action. We adopted Apple’s “glowing line” UI to kickstart our transition and then we fade in our textures. In just a matter of seconds we’re ready to visualize an entirely new setup for these rooms.

{% include shopify-video.html id='https://cdn.shopify.com/videos/c/o/v/9c4c95d6ce604c0698f5fdafa4060d8a.mp4' width='100%' %}