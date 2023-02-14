---
layout: post
title: What might instruction manuals look like in the future?
subtitle: Instructional_AR
video: https://cdn.shopify.com/videos/c/o/v/4d27ea78346d4e49ae67ad5c56ee1fc0.mp4
---

![_config.yml]({{ site.baseurl }}/images/instructional_ar/steps_1_2_3.png){:.right}

It’s surprising how much ambiguity is created when you take a 3D object and you compress it down into a 2D image. That ambiguity is the source of many mistakes when you follow an instruction manual to assemble a product. Mistakes like using the wrong screws to connect two pieces together, or connecting a piece with the incorrect face pointing outwards.

With the arrival of Meta’s Quest Pro headset, we wanted to reimagine instruction manuals from the ground up to explore this future.

Would seeing the assembly steps in 3D eliminate the ambiguity usually associated with instruction manuals? And would it be more comfortable than a paper booklet that you are constantly picking up and putting down? And could this technology scale for companies that need to produce instruction manuals for hundreds or thousands of products?

{% include youtube.html id='hGQofWT2-z8?modestbranding=1&amp;showinfo=0&amp;rel=0' %}

# Exploration

## Choosing a product

The first step in the exploration phase was choosing the product that we would center our prototype around. The obvious choice was a piece of furniture, since most people are familiar with the experience (and struggles) of assembling furniture at home.

![_config.yml]({{ site.baseurl }}/images/instructional_ar/hape_kitchen.png){:.right}

![_config.yml]({{ site.baseurl }}/images/instructional_ar/parts.png){:.right}

After considering a few different options, we decided to go with a toy kitchen made by a Shopify merchant called Hape.

The instruction manual of the toy kitchen teaches you how to put it together in 17 steps, and the kitchen itself consists of 20 unique pieces that are connected together using 10 screws and 10 bolts. We felt that this product had the perfect amount of complexity to test our AR concept.



If our technology couldn’t teach you how to assemble a toy kitchen, then it definitely didn’t have legs for anything else.

## Object tracking

Once we had our product selected, we started thinking about how we would guide the user through the assembly process. We needed a way to tell them “grab these pieces and connect them like this”.

The first half of that sentence is what worried us the most. How would we highlight which pieces to grab if the Quest Pro doesn’t have support for identifying and tracking objects using computer vision?

Our solution to this problem ended up being beautifully simple. While discussing how each of us usually assembles furniture, we realized that most of us like to lay out all the pieces on the floor before starting to put them together. So then we thought: what if the AR instruction manual told you how to lay out the pieces? Once you completed that step, the system would know exactly where everything is, so it could tell you where to grab things!

{% include youtube.html id='SMrk0SaoOuk?modestbranding=1&amp;showinfo=0&amp;rel=0' %}

It turns out there’s a word for the process of laying things like that. It’s called knolling.

## Guiding the user

With the object tracking problem solved, now came the fun part: how would we guide the user through each step?

We explored many different ideas and interaction patterns during this phase. Here are the most interesting ones:

- We thought it would be fun to have an animated helper that keeps track of your hands and alerts you when you grab an incorrect piece. The alert can take the form of a speech bubble, an audio clip or just a nod of the character’s head. It’s surprising how expressive an animation by itself can be. 
{% include youtube.html id='_Zv1IxLZY8M?modestbranding=1&amp;showinfo=0&amp;rel=0' %}

- We implemented ghost pieces that travel from their knolled positions to their final positions on a reference model of what you are assembling. This ended up being our most commonly used pattern. It’s simple and effective at telling you what to do.

{% include youtube.html id='V5XeUwdvHMI?modestbranding=1&amp;showinfo=0&amp;rel=0' %}

- We color-coded the screws, bolts and tools to make it easy to recognize which ones to use at each step. We also displayed flowing dashed lines at the places where the screws and bolts needed to be inserted. Seeing those lines in 3D felt so much clearer than seeing them in a 2D diagram.

{% include youtube.html id='C0KNmCOpmnQ?modestbranding=1&amp;showinfo=0&amp;rel=0' %}

- We played with fun wobbly lines that guide your hands to the places where you need to connect things together. These were particularly delightful.

{% include youtube.html id='J81KuLbOneo?modestbranding=1&amp;showinfo=0&amp;rel=0' %}

- We duct-taped the Quest Pro’s controllers to parent virtual objects to physical objects. This led to beautiful interactions like being able to move a virtual wireframe model of the toy kitchen along with the real toy kitchen.

{% include youtube.html id='HTLwxL8lWbE?modestbranding=1&amp;showinfo=0&amp;rel=0' %}

- We used the Quest Pro’s microphone to notify the system when you are ready for the next step. We explored recognizing hand gestures like a thumbs-up for this purpose, but we found that that led to lots of false positives as you worked with the pieces.

{% include youtube.html id='XzaWY6YBou4?modestbranding=1&amp;showinfo=0&amp;rel=0' %}

## Delighting the user

After implementing so many fun mechanisms to guide the user, we realized that the assembly process of a product is also a great opportunity for merchants to delight users with fun special effects and animations.

To demonstrate that idea we added some animated toys to the kitchen that are displayed immediately after the last step is completed. By adding some invisible clipping planes to the scene, we made it possible for the virtual toys to be occluded by the real kitchen.

{% include youtube.html id='CXzawYi5ulo?modestbranding=1&amp;showinfo=0&amp;rel=0' %}

# Final prototype

The video below presents all the ideas that were discussed in the previous section in their final form within our prototype.

{% include youtube.html id='sn18abaSMg8?modestbranding=1&amp;showinfo=0&amp;rel=0' %}

We implemented all 17 steps of the toy kitchen’s instruction manual. After playing with the prototype extensively, we reached the following answers to the questions that we laid out in the beginning of this article:

- Does seeing the assembly steps in 3D eliminate the ambiguity usually associated with instruction manuals?

This is a resounding yes from our team. We believe that instruction manuals are meant to be experienced in 3D. Seeing precisely how pieces snap together from any angle eliminates all ambiguity. The system of flowing dashed lines and color-coded screws, bolts and tools also made it very difficult to make mistakes during the assembly process. All these elements come together to create an amazing user experience.

- Is an AR instruction manual more comfortable to work with than a paper booklet?

Yes and no.

Yes, because having the instructions float around you in 3D space means that you never have to interrupt the assembly process to pick up a booklet, read the next step, and put it down. AR makes this a hands-free experience in which you can dedicate your attention to assembling the product without any interruptions, which allows you to get the job done faster.

No, because the color passthrough of the Quest Pro isn’t as clear as we would like it to be, and because its tracking of your room can sometimes drift, leading to small misalignments between things like the flowing dashed lines and the holes in which screws and bolts need to be inserted.

We believe that those issues will be resolved as the technology evolves.

- Could this technology scale for companies that need to produce instruction manuals for hundreds or thousands of products?

This is the criticism that we received most often when we shared this project publicly. Most people believe that producing an AR instruction manual is prohibitively expensive. We disagree with that point of view for a few reasons.

First, it’s important to note that most companies that are producing 2D instruction manuals today have CAD models of their products. Those CAD models could be reused in AR instruction manuals without any modifications.

Second, people believe that to produce an AR instruction manual you need to hire one or more 3D artists to animate each step. In our prototype, a lot of the ghost piece animations are simple interpolations between their starting knolled transforms and their ending transforms within the CAD model. In other words, those animations are produced by code without any human intervention.

It’s true that you need an artist to add a delightful ending to an AR instruction manual, but producing a more pragmatic instruction manual could be almost fully automated by software.

# Conclusions

This investigation focused primarily on how AR instruction manuals could improve the experience of assembling furniture at home. We chose that angle because we felt that a lot of people could relate to the struggle of assembling furniture with a confusing set of instructions, but what we find exciting about this technology and the interaction paradigms that we developed is that they can be used to teach people a variety of skills, not just how to assemble furniture.

Imagine being an electrical engineer working on a circuit, and having useful information floating around you. Perhaps your headset could look at the color code on a resistor and tell you its resistance and tolerance. Perhaps a ghost of a diode could fly into its correct position, telling you the correct direction in which to connect it. You wouldn’t have to interrupt your work to consult a computer or a book to figure those things out.

That’s what’s beautiful about displaying instructions in 3D space. They make working and learning something that happens simultaneously, without friction.

The possibilities are simply endless when you start blending together the physical and the digital.