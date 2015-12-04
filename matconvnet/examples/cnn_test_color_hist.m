function [net, info] = cnn_test_color_hist(net, imdb, getBatch, varargin)

% test gives the indices of elements of 'set' that are labeled 3
test = find(imdb.images.set==3);

% 1. pick one city, let's say Boston
% 2. switch color histograms with other cities randomly (not Boston)
% 3. compare accuracy of testing Boston images w/ swapped histogram and
%    original Boston images

% get vector of image names
currentCity = imdb.images.names(imdb.images.label(test)==2); % label 2 for Boston
compareTo = imdb.images.names(imdb.images.label(test)~=2); % all labels that are not Boston

% put new images in this folder
mkdir('swapped_histogram_boston');

% from compareTo, use enough images to compare to the Boston dataset
for i = 1: length(currentCity)
    
    % histogram matching
    swapped = imhistmatch(imread(currentCity(i)), imread(compareTo(i)));

    % save image to folder
    filename = strcat('swapped_', currentCity(i));
    whereToStore=fullfile('swapped_histogram_boston' ,filename);
    saveas(gcf, whereToStore); 
end

% TODO: do testing using network on images in folder

 







% OLD STUFF (can delete)
%
% % partition into two sets set1 and set2
% half = ceil(length(test)/2); % if odd number, put extra element in set1
% set1 = test(1:half);
% set2 = test(half+1:end);
% 
% % switch histogram on every i'th pair of elements set1(i) and set2(i)
% for i = 1: length(set2) % always the shorter of the two sets if not equal
%     newImage1 = imhistmatch(set1(i), set2(i)); 
%     newImage2 = imhistmatch(set2(i), set1(i));
%     
%     % somehow output new images to replace old
% end