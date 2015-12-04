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

% variables for storing test statistics
confusion = zeros(10); % confusion matrix
predLabels = zeros(1,length(names)); 
bestScores = zeros(1,length(names));

for i = 1:length(names)
im = imread(sprintf('C:/Users/lezhi/Dropbox/___6869/_streetview_valid/%s',names{i})); % change this
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

% remember the prodicted category and their corresponding scores
predLabels(i) = best; 
bestScores(i) = bestScore;

% if categorized wrongly, 
% add the score difference between the top score and the score for the gound truth category
% to the corresponding cell in confusion matix
if best ~= labels(i) 
  ownscore = scores(labels(i)); 
  score_diff = bestScore - ownscore;
  confusion(best,labels(i)) = confusion(best,labels(i)) + score_diff; % row for target label, column for ground truth label
end

i % print process
end

%% post precess
% divide confusion matrix by the total number in each category, to get
% false classification rates
tot = zeros(1,10);
for i = 1:10
  tot (i) = length(names(labels==i)); 
end
confusion_rate = confusion*100 ./ double(repmat(tot,10,1));
false_rate = sum(confusion_rate);

save('test_stats.mat','names','labels','bestScores','predLabels','confusion','confusion_rate','false_rate')

%% visualization
city_names = imdb.classes.name;

