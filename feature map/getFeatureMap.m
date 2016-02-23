clear all;

netdir = 'C:\Users\lezhi\Dropbox\cv project\city-alexnet-simplenn\';
datadir = 'C:\Users\lezhi\Dropbox\___6869\_streetview_valid\';

imdb = load(strcat(netdir,'imdb.mat'));
net = load(strcat(netdir,'net-epoch-60.mat'));
net= net.net;
net.layers{1,end}.type = 'softmax';
net.layers{1,end}.name = 'prob';

city = find(imdb.images.label==10);
test = find(imdb.images.set==3);
intersect = intersect(city, test);
images = imdb.images.name(intersect);

features = zeros(length(images),13, 13, 256); % change to the number of weights in layer:
                                      % 256 for conv5

for i=1:length(images)

% load and preprocess an image
im = imread(strcat(datadir,images{i}));
im_ = single(im) ; % note: 0-255 range
im_ = imresize(im_, net.normalization.imageSize(1:2)) ;
for j = 1:3
im_(:,:,j) = im_(:,:,j) - net.normalization.averageImage(j) ;
end

% run the CNN
res = vl_simplenn(net, im_);

% extract features
features(i,:) = res(15).x(:)'; % we want this conv5 layer

end

features = permute(features,[2,3,4,1]);
