---
layout: post
title: Could AI unlock unlimited product photography?
subtitle: AI Product Photography
---

![_config.yml]({{ site.baseurl }}/images/ai_product_photos/shoe_overview.png){:.centered}

Our team at Shopify usually focuses on spatial computing: AR, VR, and other forms of immersive media. However, we incorporated generative diffusion into our [AI Product Genie]({% post_url 2022-9-1-AI-Product-Genie %}) exploration, and during the course of that project we had the spark of an idea in the form of a ton of questions, and had developed the expertise to investigate and answer them.

The idea was this: if image diffusion had gotten this good, had it gotten good enough that merchants could use it to spruce up their product photos? If so, what are the limits of that improvement - is it closer to a color balance filter, or a little image retouching, or can it go further? Beyond that, we wondered whether there were certain products, categories, or image properties that would challenge the available diffusion models. These were the questions we asked when embarking on our exploration into AI product photos.

# Exploration

In parallel, we set out to explore 3 different avenues of research:

- Learning about how to construct better prompts - ones that get more consistent results, better reproduce the product, and generally get the results we want out of the models we have.

- Fine-tuning a version of Stable Diffusion 1.4 tuned to produce idealized studio product photos, and then using that fine-tuned model to transform existing average product photos into their idealized forms.

- Using [Dreambooth](https://dreambooth.github.io/) and/or [Textual Inversion](https://textual-inversion.github.io/) to build an understanding of a specific product, and then using that model to synthesize new product photos that look great.

## Learning to prompt

First thing's first - we had to learn how to get the most out of Stable Diffusion 1.4. A lot of this was about building an intuitive understanding of the system and what it would output for any given prompt. We quickly found terms like "a beautiful marketing photo", "in the dappled sunlight", and "dramatic lighting" to help in getting the look we wanted.

However, this is when some of our initial optimism started to temper with some realism: we could fiddle with different sampling methods, different parameters for the model, and hew to our known good keywords; but to get good results, we found that you simply have to generate a lot of options.

![_config.yml]({{ site.baseurl }}/images/ai_product_photos/prompt_fail.png){:.centered}

## Supercharged photo filters

Moving on to the image generation branches of research, we had seen a fine-tuned [version](https://huggingface.co/justinpinkney/pokemon-stable-diffusion) of Stable Diffusion 1.4 that transformed input photos into cartoon character versions of themselves. They also wrote a great [explainer](https://github.com/LambdaLabsML/examples/tree/main/stable-diffusion-finetuning) talking about how they did it, with 6 hours of training and less than 1000 captured cartoon images.

![_config.yml]({{ site.baseurl }}/images/ai_product_photos/cartoon.png){:.centered}

We followed the same process they described: first, gathering a dataset of great professional-looking product photos, then running a [BLIP](https://arxiv.org/abs/2201.12086) caption model to provide labels for each product photo, and finally using that dataset to fine-tune on a powerful GPU for 15,000 steps. Unfortunately, the more training steps we applied, the more the model seemed to deconverge - ultimately at 20,000 steps, forgetting how to produce anything recognizable at all!

![_config.yml]({{ site.baseurl }}/images/ai_product_photos/deconverge.png){:.centered}

Given what we know from further research and investigations, we now know that our training set was too diverse, our learning rate was too high, our BLIP captions were insufficient, and Stable Diffusion 1.4 is now not the best starting point for fine-tuning an img2img model. However, in this exploration with each 15,000 step training run taking up most of a workday, this began to take a lot of time and we decided to shelve this avenue of exploration for now.

## Unlimited product photography

What if, instead of trying to teach Stable Diffusion what a good product photo is, we taught it about a specific product? It seems to already know how to draw good product photos given the right prompt, so if we just teach it about our product, then we can prompt it for a good photo of our product. That was the idea behind this avenue of exploration, and we had two new ways of doing that.

First we wanted to explore [Textual Inversion](https://textual-inversion.github.io/), which allows you to give it example images, and have it output the set of words that it would take to coerce that set of images. Unfortunately, we quickly realized that unless you're a big brand with a product that the model already knows about, there aren't enough words in the model to sufficiently describe it for this use.

But we had also seen [Dreambooth](https://dreambooth.github.io/), a method published by Google for fine-tuning diffusion models by using not only a training set, but also a regularization set of images. It was developed for Google's Imagen diffusion model, but we found an [implementation](https://github.com/XavierXiao/Dreambooth-Stable-Diffusion) that had been converted for use in Stable Diffusion. Very quickly we realized that this pipeline was powerful, and it was going to work:

![_config.yml]({{ site.baseurl }}/images/ai_product_photos/chair_overview.png){:.centered}
![_config.yml]({{ site.baseurl }}/images/ai_product_photos/hoodie_overview.png){:.centered}
![_config.yml]({{ site.baseurl }}/images/ai_product_photos/teddy_overview.png){:.centered}

# Conclusions

We think there is an incredible opportunity here for every product to put its best foot forward. With better product photos, consumers can make clearer, more informed decisions. Merchants can better engage their audiences. It's still a work-in-progress: products with simple forms and organic lines work best today, while text, geometry, logos and counting are still out of reach:

![_config.yml]({{ site.baseurl }}/images/ai_product_photos/text_fail.png){:.centered}

But the ultimate takeaway is this: yes, AI can unlock unlimited product photography!