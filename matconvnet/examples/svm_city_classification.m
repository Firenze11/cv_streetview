% The aim here is to classify city images by training an SVM 
% using the features extracted from FC7 layer of model

%addpath utils
%addpath utils/libsvm/matlab

% read from imdb.mat
imdb = load('C:\Users\lezhi\Dropbox\cv project\city-alexnet-simplenn\imdb.mat');

% read train and test images
trn_ims = (imdb.images.name(imdb.images.set==1))'; % name vector, cell array
trn_labels = (imdb.images.label(imdb.images.set==1))'; % label vector, single vector
test_ims = (imdb.images.name(imdb.images.set==3))';
test_labels = (imdb.images.label(imdb.images.set==3))';
% NOTE: it should be okay for the above not to be transposes, should output
% same result because of how the functions handle them

% extract gradient features
trn_features = extract_features(trn_ims);
test_features = extract_features(test_ims);

% train and test a linear svm model
svm = svmtrain(trn_labels,trn_features,'-s 0 -t 0 '); % linear kernel
%TODO: test some C values
[test_predictions] = svmpredict(test_labels,test_features,svm); % vector of predicted labels
accuracy = sum(test_labels==test_predictions)/length(test_labels)