imdir = 'C:/Users/lezhi/Dropbox/___6869/_streetview_valid/%s'; % change this
netdir = 'C:\Users\lezhi\Dropbox\cv project\city-alexnet-simplenn\net-epoch-31.mat';
imdbdir = 'C:\Users\lezhi\Dropbox\cv project\city-alexnet-simplenn\imdb.mat';

%% evaluate
% initialize MatConvNet
run(fullfile(fileparts(mfilename('fullpath')), ...
  '..', 'matlab', 'vl_setupnn.m')) ;

% load the pre-trained CNN
trainedstuff = load(netdir); % change this
net = trainedstuff.net;
net.layers{1,end}.type = 'softmax';
net.layers{1,end}.name = 'prob';

% loop through test images and estimate results
imdb = load(imdbdir); % change this
names = imdb.images.name(imdb.images.set==3);
labels = imdb.images.label(imdb.images.set==3);

% variables for storing test statistics
confusion = zeros(10); % confusion matrix
predLabels = zeros(1,length(names)); 
bestScores = zeros(1,length(names));
ownScores = zeros(1,length(names));
for i = 1:length(names)
im = imread(sprintf(imdir,names{i})); % change this
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
ownscore = scores(labels(i)); 

% remember the prodicted category and their corresponding scores
predLabels(i) = best; 
bestScores(i) = bestScore;
ownScores(i) = ownscore;

% if categorized wrongly, 
% add the score difference between the top score and the score for the gound truth category
% to the corresponding cell in confusion matix
if best ~= labels(i) 
  score_diff = bestScore - ownscore;
  confusion(best,labels(i)) = confusion(best,labels(i)) + score_diff; % row for target label, column for ground truth label
end

i % print process
end

%% save stats
% divide confusion matrix by the total number in each category, to get
% false classification rates
tot = zeros(1,10);
for i = 1:10
  tot (i) = length(names(labels==i)); 
end
confusion_rate = confusion*100 ./ double(repmat(tot,10,1));
false_rate = sum(confusion_rate);

coords = zeros(length(names),2);
for i = 1:length(names)
coord = strsplit(names{i},{'/',',','_'},'CollapseDelimiters',true);
coords(i,:) = [str2double(coord{2}),str2double(coord{3})];
end

save('test_stats.mat','names','ownScores','labels','bestScores','predLabels','confusion','confusion_rate','false_rate')
csvwrite('test_stats_map.csv',[coords,labels',ownScores',predLabels',bestScores']);

%% visualization-top10
addpath('lib');
city_names = imdb.classes.name;
figure
ha = tight_subplot(5,10,[0.018,0.001]);%,[.1 .01],[.01 .01]);
for i = 6:10
b_scores_sub = bestScores(labels==i);
o_scores_sub = ownScores(labels==i);
names_sub = names(labels==i);
p_labels_sub = predLabels(labels==i);
[~,index] = sort(o_scores_sub,'ascend'); % highest possibilities in each category
for j = 1:10 
  axes(ha(10*(i-6)+j)); 
  im = imread(sprintf(imdir,names_sub{index(j)}));
  imagesc(im); 
  th = title(sprintf('certainty: %0.1f, pred: %d',o_scores_sub(index(j)),p_labels_sub(index(j))));
  set(th,'Fontname','Timesnewroman');
  set(th,'Fontsize',9);
  set(th,'Position',[128,279,0]);
end
set(ha(1:50),'XTickLabel',''); set(ha,'YTickLabel','');
end

%% visualization-confusion




