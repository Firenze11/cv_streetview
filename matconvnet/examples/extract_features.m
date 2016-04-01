function features = extract_features(images)

%global vgg_net;
%if isempty(vgg_net)
imdir = 'C:/Users/lezhi/Dropbox/thesis/img_dense/%s'; % change this
netdir = 'C:\Users\lezhi\Dropbox\thesis\trainedstuff\singapore-net-epoch-40.mat';
imdbdir = 'C:\Users\lezhi\Dropbox\thesis\trainedstuff\boston-imdb.mat';


net = load(netdir); % CHANGE to our file name:
net = net.net;
net.layers{1,end}.type = 'softmax';
net.layers{1,end}.name = 'prob';
%end

features = zeros(length(images),4096); % change to the number of weights in layer:
                                       % for city-alexnet-simplenn model,
                                       % this number is 4096 for FC7 layer

for i=1:length(images)

% load and preprocess an image
im = imread(sprintf(imdir,images{i})) ;
im_ = single(im) ; % note: 0-255 range
im_ = imresize(im_, net.normalization.imageSize(1:2)) ;
for j = 1:3
im_(:,:,j)=im_(:,:,j)-net.normalization.averageImage(j);
end

% run the CNN
res = vl_simplenn(net, im_) ;

% extract features
features(i,:) = res(end-2).x(:)'; % for alexNet, we want this FC7 layer
i % print process
end

