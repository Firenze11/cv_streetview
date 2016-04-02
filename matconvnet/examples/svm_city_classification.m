% The aim here is to classify city images by training an SVM 
% using the features extracted from FC7 layer of model

%addpath utils
%addpath utils/libsvm/matlab
run(fullfile(fileparts(mfilename('fullpath')), ...
  '..', 'matlab', 'vl_setupnn.m')) ;

% read from imdb.mat
netdir = 'C:\Users\lezhi\Dropbox\thesis\trainedstuff\boston-net-epoch-50.mat';
imdbdir = 'C:\Users\lezhi\Dropbox\thesis\trainedstuff\boston-imdb.mat';

% read train and test images
% trn_ims = (imdb.images.name(imdb.images.set==1))'; % name vector, cell array
% trn_labels = (imdb.images.label(imdb.images.set==1))'; % label vector, single vector
test_ims = (imdb.images.name(imdb.images.set~=1))';
test_labels = (imdb.images.label(imdb.images.set~=1))';
csvwrite('deep_features_boston.csv',test_features); % record image features

% NOTE: it should be okay for the above not to be transposes, should output
% same result because of how the functions handle them

% extract gradient features
% trn_features = extract_features(trn_ims);
test_features = extract_features(test_ims);

% train and test a linear svm model
% svm = svmtrain(trn_features,trn_labels(1:100),'-s 0 -t 0 '); % linear kernel
options = '-s 0 -t 0 '; %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% not used yet!
test_predictions = multisvm(trn_features,trn_labels(1:100),test_features);
%TODO: test some C values
%[test_predictions] = svmpredict(test_features,test_labels(1:100),svm); % vector of predicted labels
accuracy = sum(test_labels(1:100)==test_predictions)/length(test_labels)