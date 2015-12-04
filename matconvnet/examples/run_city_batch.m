% initialize MatConvNet
run(fullfile(fileparts(mfilename('fullpath')), ...
  '..', 'matlab', 'vl_setupnn.m')) ;

% load the pre-trained CNN
trainedstuff = load('C:\Users\lezhi\Dropbox\cv project\city-alexnet-simplenn\net-epoch-31.mat'); % change this
net = trainedstuff.net;
net.layers{1,end}.type = 'softmax';
net.layers{1,end}.name = 'prob';

% loop through test images and estimate results
imdb = load('C:\Users\lezhi\Dropbox\cv project\city-alexnet-simplenn\imdb.mat'); % change this
names = imdb.images.name(imdb.images.set==3);
labels = imdb.images.label(imdb.images.set==3);

% confusion matrix
confusion = zeros(10);

for i = 1:size(names,2)
im = imread(sprintf('C:/Users/lezhi/Dropbox/___6869/_streetview_valid/%s.jpg',names{i}(1:end-4))); % change this
im_ = single(im) ; % note: 0-255 range
im_ = im_(1:256,:,:);
im_ = imresize(im_, net.normalization.imageSize(1:2));
for j = 1:3
  im_(:,:,j)=im_(:,:,j)-net.normalization.averageImage(j);
end

% run the CNN
res = vl_simplenn(net, im_) ;

% show the classification result
scores = squeeze(gather(res(end).x)) ;
[bestScore, best] = max(scores) ;
[sortedscores,index] = sort(scores,'descend');
if best ~= labels(i) % if categorized wrongly
  ownscore = scores(labels(i)); % score for the gound truth category
  score_diff = bestScore - ownscore;
  confusion(best,label{i}) = confusion(best,label{i}) + score_diff; % row for target label, column for ground truth lanlel/
end
end

city_names = imdb.classes.name;
figure(1) ; clf ; imagesc(im) ;
title({sprintf('%s (%d), score %.3f',...
city_names{index(1)}, index(1), sortedscores(1)),...
sprintf('%s (%d), score %.3f',...
city_names{index(2)}, index(2), sortedscores(2)),...
sprintf('%s (%d), score %.3f',...
city_names{index(3)}, index(3), sortedscores(3))}) ;
