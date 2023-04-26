---
layout: post
title: Is the future of fashion still a piece of '90s movie magic?
subtitle: Clueless_Closet
video: https://cdn.shopify.com/videos/c/o/v/c041e6bfa71e4dcaa42d80bdb08a0872.mp4
---

In the 1995 cult classic film [Clueless](https://en.wikipedia.org/wiki/Clueless) there is a thirty second sequence that fashion fanatics still talk about to this day:

{% include youtube.html id='XNDubWJU0aU?modestbranding=1&amp;showinfo=0&amp;rel=0' %}

The idea of having a computer program that knows what's in your closet and that can help you experiment with different combinations of garments has really captured people's imagination.

If you look online, you'll find thousands of comments that ask the same question: _why isn't this real yet?_

There are already apps out there that allow you to digitize your closet and that can give you recommendations on what to wear, but they all lack the most magical feature of the Clueless closet: showing you what you would look like wearing the clothes.

With the rise of generative diffusion-based tools, we thought now might be the right time to check if the Clueless closet can be brought to life or not.

# Exploration

## Gathering data

The first thing we needed was access to images of a wide variety of garments. Sadly, no one in the Spatial Commerce team is particularly fashionable, which is why we partnered with [Jessie Char](https://jessiechar.com/closet/browse.html) and [Maxwell Neely-Cohen](https://maxy.world/closet.html), who have both cataloged and digitized their entire closets and created their own unique versions of the Clueless closet.

![_config.yml]({{ site.baseurl }}/images/clueless_closet/jessie_closet_website.PNG){:.centered}

## Training models for garments

In a previous [project]({{ site.baseurl }}{% link _posts/2022-10-1-AI-Product-Photos.md %}) we used [DreamBooth](https://dreambooth.github.io/) to fine-tune Stable Diffusion 1.4 to faithfully reproduce a wide variety of products.

![_config.yml]({{ site.baseurl }}/images/ai_product_photos/teddy_overview.png){:.centered}

A year later, there is a new and much more lightweight technique for doing the same thing called [Low-Rank Adaptation (LoRA)](https://arxiv.org/pdf/2106.09685.pdf).

Using [this](https://github.com/bmaltais/kohya_ss) open source tool we were able to take 10 images of a particular garment like these ones:

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_jacket_0.png){:style="width:32%;"}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_jacket_1.png){:style="width:32%;"}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_jacket_2.png){:style="width:32%;"}

And use them to train a LoRA that could reproduce the garment quite accurately when combined with Stable Diffusion 1.5:

![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_wearing_jacket.png){:.centered}

Training each LoRA took around 30 minutes on an NVIDIA GeForce RTX 3080 GPU. We could have probably gotten away with less images of the garment, which could reduce the training time to be between 10 and 15 minutes.

And the LoRA itself is simply a `.safetensors` file that weights nine megabytes.

## Training models for humans

Once we were certain that we could faithfully reproduce garments, we turned our attention to humans.

We found that it's better to have 2 separate LoRAs for each person: one trained on full-body shots, and one trained on close-ups of their face.

Using 30 images of a person was enough to train a LoRA that could accurately represent them, and we could probably have gotten away with less images. Here's a comparison of a training image and a diffused one:

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_face_real.png){:style="width:49%;"}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_face_diffused.png){:style="width:49%;"}

## Inpainting outfits

We tried a number of different approaches to diffuse Jessie and Max wearing garments from their closets. The one that produced the best results is based on masking and inpainting. Here's how it works:

Let's say we want to diffuse Max in this t-shirt and pants combination:

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_outfit_1/bottom.JPG){:style="width:49%;"}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_outfit_1/top.JPG){:style="width:49%;"}

We would start out by diffusing a full-body shot of him wearing a generic outfit using his full-body LoRA.

We can control the way his body is posed using ControlNet and the OpenPose model. In this example we will be feeding this image of a posed 3D character to the model:

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_outfit_1/pose.png)

It is at this stage in the process that we also need to define the background of the image through the prompt. For the example below we used a prompt along the lines of "Maxwell Neely-Cohen walking among Greek ruins wearing black shorts and a white t-shirt and white shoes"

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_outfit_1/0.png)

Note how his face doesn't look great. That's because we are using his full-body LoRA. We will fix that later.

Once we have an initial image that we are happy with, we can start inpainting the clothes. For the pants we need to draw a mask around his legs:

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_outfit_1/pants_mask.png)

And then use the pants LoRA to inpaint them within that mask. Our prompt can be as simple as "pants" (the keyword we used while training the LoRA), but sometimes it's necessary to be more descriptive with prompts like "black pleated pants".

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_outfit_1/1.png)

Next we repeat the same steps for the t-shirt. First we draw a mask:

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_outfit_1/shirt_mask.png)

And then we use the t-shirt LoRA with a prompt like "t-shirt" or "tie dye t-shirt":

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_outfit_1/2.png)

The diffused t-shirt doesn't exactly match the real one, but the image still tells us a lot about the vibes of the outfit, which is what we are after with the Clueless closet.

Finally, we repeat the same steps for the face. First we draw a mask:

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_outfit_1/face_mask.png)

And then we use the face LoRA with a prompt like "Maxwell Neely-Cohen":

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_outfit_1/3.png)

The final image is a surprisingly accurate representation of Max wearing those clothes.

Below you will find examples of other images we diffused using this technique. Note how the color of Jessie's hair changes frequently. That reflects the many hairstyles in the images we used to train the LoRA of her face:

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/jessie_outfit_1/outfit_1.png)

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/jessie_outfit_1/diffusion.png)

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/jessie_outfit_3/outfit_3.png)

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/jessie_outfit_3/diffusion.png)

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/jessie_outfit_6/outfit_6.png)

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/jessie_outfit_6/diffusion.png)

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/jessie_outfit_7/outfit_7.png)

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/jessie_outfit_7/diffusion.png)

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_outfit_0/outfit_0.png)

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_outfit_0/diffusion.png)

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_outfit_2/outfit_2.png)

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/max_outfit_2/diffusion.png)

One interesting thing to note in that final image is how the pant legs are rolled up. That detail isn't present in any of the training images. The model must have rolled them up because the person is barefoot in the beach. That type of contextual understanding highlights how good these models are at fitting clothes onto human bodies.

## Going beyond tops and bottoms

Once we realized how good these models are at inpainting clothes, we started wondering how far we could push them.

Here's an image we diffused of the Spatial Commerce team's very own 3D artist Brennan:

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/brennan_outfit_0/outfit_0.png)

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/brennan_outfit_0/diffusion.png)

We wondered: if we drew a proper mask, could we inpaint the jacket shown below on top of the floral shirt? Could we layer clothes like that?

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/brennan_outfit_0/jacket.JPG)

The answer is yes. Here is the mask we used and the resulting image:

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/brennan_outfit_0/jacket_mask.PNG)

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/brennan_outfit_0/diffusion_jacket.png)

How about adding a cap? Could we train a model of this cap and inpaint it on Brennan's head?

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/brennan_outfit_0/cap.JPG)

The answer is yes again:

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/brennan_outfit_0/diffusion_cap.png)

And what about shoes? Could we inpaint these shoes on Brennan's feet?

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/brennan_outfit_0/shoes.JPG)

Yes:

{:.text-align-center}
![_config.yml]({{ site.baseurl }}/images/clueless_closet/brennan_outfit_0/diffusion_shoes.png)

Even after playing with this technique for a couple of weeks, we kept discovering new things it could do. It never stopped surprising us.

# Conclusions

The layered inpainting technique we have presented in this blog post allowed us to get really stunning results. Once we had validated it, we looked at the problem of trying to automate it.

We believe the masking step could be automated using a model like Meta's [Segment Anything](https://segment-anything.com/), but even with proper masks of the legs and torso it can take dozens if not hundreds of image generations to achieve aesthetically pleasing results. Problems with hands, faces, feet and even backgrounds are extremely common.

Unless the quality of the diffused images becomes more consistent, an automated pipeline is likely to produce mostly poor results with occasional gems.

So for now the Clueless closet remains a piece of '90s movie magic, but we believe the world with catch up with it really soon, and when that happens even the boys in the Spatial Commerce team will become fashionable individuals.

Thanks to Jessie and Max for all the help they gave us during this project!
