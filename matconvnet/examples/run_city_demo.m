% initialize MatConvNet
run(fullfile(fileparts(mfilename('fullpath')), ...
  '..', 'matlab', 'vl_setupnn.m')) ;

% load the pre-trained CNN
trainedstuff = load('C:\Users\lezhi\Dropbox\cv project\city-alexnet-simplenn\net-epoch-31.mat') ;
net = trainedstuff.net;
% net.layers{end}.class = 2 ; % put in the correct label
net.layers(end) = []; %remove softmax layer http://www.mathworks.com/help/matlab/matlab_prog/delete-data-from-a-cell-array.html?refresh=true

% load and preprocess an image
im = imread('C:\Users\lezhi\Dropbox\cv project\Singapore\1.312367,103.871982_0.png') ;
im_ = single(im) ; % note: 0-255 range
im_ = im_(1:256,:,:);
im_ = imresize(im_, net.normalization.imageSize(1:2)) ;
for i = 1:3
im_(:,:,i)=im_(:,:,i)-net.normalization.averageImage(i)* ones(net.normalization.imageSize(1:2));
end

% run the CNN
res = vl_simplenn(net, im_) ;

% show the classification result
scores = squeeze(gather(res(end).x)) ;
[bestScore, best] = max(scores) ;
[sortedscores,index] = sort(scores,'descend');

city_names = {'Berlin','Boston','Chicago','Hong Kong','London',...
              'New York','Paris','Rome','Singapore','Tokyo'};
figure(1) ; clf ; imagesc(im) ;
title({sprintf('%s (%d), score %.3f',...
city_names{index(1)}, index(1), sortedscores(1)),...
sprintf('%s (%d), score %.3f',...
city_names{index(2)}, index(2), sortedscores(2)),...
sprintf('%s (%d), score %.3f',...
city_names{index(3)}, index(3), sortedscores(3))}) ;

