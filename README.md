# cv_streetview

* Code repository for deep learning urban visual characteristics analysis *

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

The spatial distribution of falsely categorized images concentrate in urban district centers, 
where there is usually less homogeneity and more distinctiveness. 