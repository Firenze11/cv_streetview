# cv_streetview

_Code repository for deep learning urban visual characteristics analysis_

## Overview

The goal of this research project is to evaluate how well cities/districts can be characterized by their visual properties 
using the readily available city imaginary data set provided by Google street view. 

In order to ﬁnd out the image features that would affect a deep learning algorithm to distinguish between different cities, 
we trained several **image categorization neural networks** using AlexNet and VGG-S CNN structures, 
and analyzed the visual clues that helps the algorithm make categorization decisions. 
We found out that the algorithm precisely grasps the differences between different city types, 
and has almost **92% accuracy** for the best model. 

As an exploration of latent urban characteristics that can be reﬂected in the visual aspect, 
the research proposes an alternative paradigm of computational urban morphological research 
where environmental aﬀordances revealed in streetlevel urban imagery are taken into consideration.

![CNN recognizing cities from Google streetview.](teaser.png "CNN recognizing cities from Google streetview.")

## Dataset

About 160,000 images were requested using Googole Streetview API (data requesting code [here](scripts/getting_data.ipynb)). Samples of the dataset can be found in the ["data"](data/) folder. 2/3 of the images were used for training, 1/6 for validating, and 1/6 for testing.