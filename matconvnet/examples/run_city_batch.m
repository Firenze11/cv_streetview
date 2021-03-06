% imdir = 'C:/Users/lezhi/Dropbox/thesis/img_dense/%s'; % change this
% netdir = 'C:\Users\lezhi\Dropbox\thesis\trainedstuff\all-net-epoch-75.mat';
% imdbdir = 'C:\Users\lezhi\Dropbox\thesis\trainedstuff\all-imdb.mat';
% 
% num_cat = 119; % number of categories, change this
% % evaluate
% % initialize MatConvNet
% run(fullfile(fileparts(mfilename('fullpath')), ...
%   '..', 'matlab', 'vl_setupnn.m')) ;
% 
% % load the pre-trained CNN
% trainedstuff = load(netdir); % change this
% net = trainedstuff.net;
% net.layers{1,end}.type = 'softmax';
% net.layers{1,end}.name = 'prob';
% 
% % loop through test images and estimate results
% imdb = load(imdbdir); % change this
% names = imdb.images.name(imdb.images.set~=1); %both test and validation set
% labels = imdb.images.label(imdb.images.set~=1);
% 
% % variables for storing test statistics
% confusion = zeros(num_cat); % confusion matrix
% predLabels = zeros(1,length(names)); 
% bestScores = zeros(1,length(names));
% ownScores = zeros(1,length(names));
% 
% % variable for storing test features
% features = zeros(length(names),4096); % change to the number of weights in layer:
%                                        % for city-alexnet-simplenn model,
%                                        % this number is 4096 for FC7 layer
                                       
% for i = 1:length(names)
% im = imread(sprintf(imdir,strcat(names{i}(1:end-4),'.png'))); % change this % names{i}
% im_ = single(im) ; % note: 0-255 range
% im_ = im_(1:256,:,:);
% im_ = imresize(im_, net.meta.normalization.imageSize(1:2));
% for j = 1:3
%   im_(:,:,j)=im_(:,:,j)-net.meta.normalization.averageImage(j);
% end
% 
% % run the CNN
% res = vl_simplenn(net, im_) ;
% 
% % extract features
% features(i,:) = res(end-2).x(:)'; % for alexNet, we want this FC7 layer
% 
% % show the classification result
% scores = squeeze(gather(res(end).x)) ;
% [bestScore, best] = max(scores) ;
% [sortedscores,index] = sort(scores,'descend');
% ownscore = scores(labels(i)); 
% 
% % remember the prodicted category and their corresponding scores
% predLabels(i) = best; 
% bestScores(i) = bestScore;
% ownScores(i) = ownscore;
% 
% % if categorized wrongly, 
% % add the score difference between the top score and the score for the gound truth category
% % to the corresponding cell in confusion matix
% if best ~= labels(i) 
%   score_diff = bestScore - ownscore;
%   confusion(best,labels(i)) = confusion(best,labels(i)) + score_diff; % row for target label, column for ground truth label
% end
% 
% i % print process
% end
% 
% % save stats
% % divide confusion matrix by the total number in each category, to get
% % false classification rates
% tot = zeros(1,num_cat);
% for i = 1:num_cat
%   tot (i) = length(names(labels==i)); 
% end
% confusion_rate = confusion*100 ./ double(repmat(tot,num_cat,1));
% false_rate = sum(confusion_rate);
% 
% coords = zeros(length(names),2);
% for i = 1:length(names)
% coord = strsplit(names{i},{'/',',','_'},'CollapseDelimiters',true);
% coords(i,:) = [str2double(coord{2}),str2double(coord{3})];
% end

csvwrite('deep_features_all.csv',features); 
save('test_stats_all.mat','names','ownScores','labels','bestScores','predLabels','confusion','confusion_rate','false_rate');
csvwrite('confusion_all.csv',confusion_rate);

fid = fopen('test_stats_all.csv','wt');
 if fid>0
     for i=1:length(names)
%          fprintf(fid,'%s\n',names{k,:});
        row = strsplit(names{i}(1:end-4),{'/',',','_'},'CollapseDelimiters',true);
        for j=2:length(row)
            fprintf(fid,'%s,',row{j}); %{k,:}
        end
        fprintf(fid,'%s,%f,%f,%s,%f,%f\n', ...
            imdb.classes.name{labels(i)},labels(i),ownScores(i),...
            imdb.classes.name{predLabels(i)},predLabels(i),bestScores(i));
     end
     fclose(fid);
 end
%% visualization-top10
addpath('lib');
city_names = imdb.classes.name;

fid = fopen('best_img_sanfrancisco.tsv','wt');

for i = 1:num_cat
    if mod(i,10) == 1
        figure
        ha = tight_subplot(10,10,[0.018,0.001]);%,[.1 .01],[.01 .01]);
    end    
    b_scores_sub = bestScores(labels==i);
    o_scores_sub = ownScores(labels==i);
    names_sub = names(labels==i);
    p_labels_sub = predLabels(labels==i);
    [~,index] = sort(o_scores_sub,'descend'); % highest possibilities in each category
    
    fprintf(fid, '\n%s\t',imdb.classes.name{i});
    
    for j = 1:20 
        if mod(j,2) == 0 
            j2 = j/2;
            axisind = mod(i*10-10+j2,100);
            if axisind == 0
              axisind = 100;
            end
            axes(ha(axisind)); 
            im = imread(sprintf(imdir, strcat( names_sub{index(j)}(1:end-4), '.png') ));
            imagesc(im); 
            % without strrep, matlab will mess up the display of an
            % underscore
            th = title(sprintf('%s: %0.2f',strrep(imdb.classes.name{i},'_','\_'),o_scores_sub(index(j)) ));
%             set(th,'Fontname','Timesnewroman');
            set(th,'Fontsize',8);
            set(th,'Position',[240,427,0]); % change this position according to image dimension
        
            fprintf(fid, '%s\t', strcat( names_sub{index(j)}(1:end-4), '.png'));        
        end
    end        
    set(ha(1:100),'XTickLabel',''); set(ha,'YTickLabel','');
end
fclose(fid) ;
%% visualization-confusion
% http://stackoverflow.com/questions/3942892/how-do-i-visualize-a-matrix-with-colors-and-values-displayed
mat = confusion_rate;           
fig = imagesc(mat);      
xlabel('Ground Truth');
ylabel('Predicted');
colormap(flipud(gray));  %# Change the colormap to gray (so higher values are
                         %#   black and lower values are white)

textStrings = num2str(mat(:),'%0.2f');  %# Create strings from the matrix values
textStrings = strtrim(cellstr(textStrings));  %# Remove any space padding
[x,y] = meshgrid(1:num_cat);   %# Create x and y coordinates for the strings
hStrings = text(x(:),y(:),textStrings(:),...      %# Plot the strings
                'HorizontalAlignment','center');
midValue = mean(get(gca,'CLim'));  %# Get the middle value of the color range
textColors = repmat(mat(:) > midValue,1,3);  %# Choose white or black for the
                                             %#   text color of the strings so
                                             %#   they can be easily seen over
                                             %#   the background color
set(hStrings,{'Color'},num2cell(textColors,2));  %# Change the text colors

% ax.XTickLabelRotation=45;
set(gca,'XTick',1:num_cat,...                         %# Change the axes tick marks
        'XTickLabel',strrep(imdb.classes.name,'_','\_'),...  %#   and tick labels
        'XTickLabelRotation',30,...
        'YTick',1:num_cat,...
        'YTickLabel',strrep(imdb.classes.name,'_','\_'),...
        'TickLength',[0 0]);
    
%% evaluate - histogram swapping
% initialize MatConvNet
run(fullfile(fileparts(mfilename('fullpath')), ...
  '..', 'matlab', 'vl_setupnn.m')) ;

% load the pre-trained CNN
trainedstuff = load(netdir); % change this
net = trainedstuff.net;
net.layers{1,end}.type = 'softmax';
net.layers{1,end}.name = 'prob';

% loop through test images and estimate results
imdb = load(imdbdir); 
names = imdb.images.name(imdb.images.set==3);
labels = imdb.images.label(imdb.images.set==3);
names_cat = {};
for i = 1:10
names_cat{end+1} = names(labels==i);
end

% variables for storing test statistics
confusion_c = zeros(10); % confusion matrix

for k = [1,9] % swap singapore and boston
for i = 1:length(names_cat{k})
  im = imread(sprintf(imdir,names_cat{k}{i})); 
  if (k==1), k2 = 9; else k2 = 1; end;
  i2 = randi(length(names_cat{k2}));
  imcolor = imread(sprintf(imdir,names_cat{k2}{i2}));
  im = imhistmatch(im, imcolor);
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
  ownscore = scores(k); 
 
  % if categorized wrongly, 
  % add the score difference between the top score and the score for the gound truth category
  % to the corresponding cell in confusion matix
  if best ~= k 
    score_diff = bestScore - ownscore;
    confusion_c(best,k) = confusion_c(best,k) + score_diff; % row for target label, column for ground truth label
  end

  [k,i] % print process
end
end

% divide confusion matrix by the total number in each category, to get
% false classification rates
tot = zeros(1,10);
for i = 1:10
  tot (i) = length(names(labels==i)); 
end
confusion_rate_c = confusion_c*100 ./ double(repmat(tot,10,1));
false_rate_c = sum(confusion_rate_c);

confusion_rate_c2 = confusion_rate;
confusion_rate_c2(:,[1,9]) = confusion_rate_c(:,[1,9]);

%% four histogram change images
im1 = imread(sprintf(imdir,'Boston/42.347651,-71.063051_0.jpg'));
im2 = imread(sprintf(imdir,'Singapore/1.273867,103.842282_6.jpg'));
im1s = imhistmatch(im1, im2);
im2s = imhistmatch(im2, im1);
figure 
subplot(2,2,1), imshow(im1), title('Boston');
subplot(2,2,2), imshow(im2), title('Singapore');
subplot(2,2,3), imshow(im1s), title('Boston with Singapore color');
subplot(2,2,4), imshow(im2s); title('Singapore with Boston color');
