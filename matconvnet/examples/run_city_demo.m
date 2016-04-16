% initialize MatConvNet
run(fullfile(fileparts(mfilename('fullpath')), ...
  '..', 'matlab', 'vl_setupnn.m')) ;

% load the pre-trained CNN
trainedstuff = load('C:\Users\lezhi\Dropbox\thesis\trainedstuff\boston-net-epoch-50.mat'); % change this
net = trainedstuff.net;
net.layers{1,end}.type = 'softmax';
net.layers{1,end}.name = 'prob';

% load and preprocess an image
im = imread('C:\Users\lezhi\Desktop\test.png') ;
% im = imread('C:\Users\lezhi\Dropbox\thesis\img\boston\42.349631,-71.077004719_3.png') ; % change this
im_ = single(im) ; % note: 0-255 range
im_ = imresize(im_, net.meta.normalization.imageSize(1:2)) ;
for i = 1:3
im_(:,:,i)=im_(:,:,i)-net.meta.normalization.averageImage(i);
end

% run the CNN
res = vl_simplenn(net, im_) ;

% show the classification result
scores = squeeze(gather(res(end).x)) ;
[bestScore, best] = max(scores) ;
[sortedscores,index] = sort(scores,'descend');

% city_names = {'Boston','Chicago','Hong Kong','London','New York',...
%               'Paris','Rome','San Francisco','Singapore','Tokyo'};
city_names = {'Agassiz','Allston','Area 2/MIT','BROOKLINE_02445','BROOKLINE_02446','Back Bay', ... 
        'Bay Village','Beacon Hill','Brighton','Cambridgeport','Charlestown','Chinatown',...
        'Dorchester','Downtown','EVERETT_02149','East Boston','East Cambridge','Fenway',...
        'Jamaica Plain','Leather District','Longwood Medical Area','MEDFORD_02155','Mid-Cambridge',...
        'Mission Hill','Neighborhood Nine','North Cambridge','North End','Riverside','Roxbury',...
        'SOMERVILLE_02143','SOMERVILLE_02144','SOMERVILLE_02145','South Boston','South Boston Waterfront',...
        'South End','The Port','WATERTOWN_02472','Wellington-Harrington','West Cambridge','West End'}
figure(1) ; clf ; imagesc(im) ;
title({sprintf('%s (%d), score %.3f',...
city_names{index(1)}, index(1), sortedscores(1)),...
sprintf('%s (%d), score %.3f',...
city_names{index(2)}, index(2), sortedscores(2)),...
sprintf('%s (%d), score %.3f',...
city_names{index(3)}, index(3), sortedscores(3))}) ;

