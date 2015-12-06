% initialize MatConvNet
run(fullfile(fileparts(mfilename('fullpath')), ...
  '..', 'matlab', 'vl_setupnn.m')) ;

% load the pre-trained CNN
trainedstuff = load('C:\Users\lezhi\Dropbox\cv project\city-alexnet-simplenn\net-epoch-31.mat'); % change this
net = trainedstuff.net;
net.layers{1,end}.type = 'softmax';
net.layers{1,end}.name = 'prob';

% load and preprocess an image
im = imread('C:/Users/lezhi/Dropbox/___6869/_streetview_valid/Singapore/1.273867,103.842282_2.jpg') ;
im_ = single(im) ; % note: 0-255 range
im_ = imresize(im_, net.normalization.imageSize(1:2)) ;
for i = 1:3
im_(:,:,i)=im_(:,:,i)-net.normalization.averageImage(i);
end

% run the CNN
res = vl_simplenn(net, im_) ;

% show the classification result
scores = squeeze(gather(res(end).x)) ;
[bestScore, best] = max(scores) ;
[sortedscores,index] = sort(scores,'descend');

city_names = {'Boston','Chicago','Hong Kong','London','New York',...
              'Paris','Rome','San Francisco','Singapore','Tokyo'};
figure(1) ; clf ; imagesc(im) ;
title({sprintf('%s (%d), score %.3f',...
city_names{index(1)}, index(1), sortedscores(1)),...
sprintf('%s (%d), score %.3f',...
city_names{index(2)}, index(2), sortedscores(2)),...
sprintf('%s (%d), score %.3f',...
city_names{index(3)}, index(3), sortedscores(3))}) ;

