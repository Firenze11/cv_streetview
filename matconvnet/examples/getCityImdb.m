function imdb = getCityImdb(opts)

% Preapre the imdb structure, returns image data with mean image subtracted
dimx = 256; dimy=256; % image dimensions that we want
dirs = dir(opts.dataDir)
dirFlags = [dirs.isdir] % Get a logical vector that tells which is a directory.
subFolders = dirs(dirFlags) % Extract only those that are directories.

data = zeros(dimy,dimx,3,0);
labels = zeros(1,0);
names = cell(1,0);
classes = {};

% loop through all city folders
for k = 3 : length(subFolders) % 3 is to ignore ./ and ../	
    folder = fullfile(opts.dataDir, subFolders(k).name);       
    curDir = cd; % current directory
    cd(folder); % change to data directory, otherwise there is 'file name too long' error  
    
    files = dir('*.png');
    imnum = int8(length(files) / 1000);
    fprintf('found %s with %d images\n', subFolders(k).name, imnum );
    
    data_sub = zeros(dimy,dimx,3,imnum); % last column is label
    name_sub = cell(1,imnum);    
    
    for i = 1:imnum  % loop through all files in this folder       
        im = im2uint8(imread(files(i).name));
        im = imresize(im(1:256,:,:),[dimy,dimx]); % crop google logo
        data_sub(:,:,:,i) = im; % reshape(im, [1,dimy*dimx*3]);
        name_sub{i} = files(i).name(1:end-4);
        imshow(im);
    end % finish files loop
    
    data = cat(4,data,data_sub);
    labels = cat(2,labels,(k-2)*ones(1,imnum)); 
    names = cat(2,names,name_sub);
    classes{end+1} = subFolders(k).name;
    
    cd(curDir);
end % finish city folders loop

% normalize by image mean and std as suggested in `An Analysis of
% Single-Layer Networks in Unsupervised Feature Learning` Adam
% Coates, Honglak Lee, Andrew Y. Ng

% if opts.contrastNormalization
% z = reshape(data,[],60000) ;
% z = bsxfun(@minus, z, mean(z,1)) ;
% n = std(z,0,1) ;
% z = bsxfun(@times, z, mean(n) ./ max(n, 40)) ;
% data = reshape(z, 32, 32, 3, []) ;
% end
% 
% if opts.whitenData
% z = reshape(data,[],60000) ;
% W = z(:,set == 1)*z(:,set == 1)'/60000 ;
% [V,D] = eig(W) ;
% % the scale is selected to approximately preserve the norm of W
% d2 = diag(D) ;
% en = sqrt(mean(d2)) ;
% z = V*diag(en./max(sqrt(d2), 10))*V'*z ;
% data = reshape(z, 32, 32, 3, []) ;
% end

% train/validate/test set fractions
trainfrac = double(4)/6;  validatefrac = double(1)/6;
trainnum = int16(size(data,4)*trainfrac); 
validatenum = int16(size(data,4)* validatefrac);

set = [ones(1,trainnum), 2*ones(1,validatenum),...
       3*ones(1,size(data,4)-trainnum-validatenum)];
set = set(randperm(length(set))); % shuffle train/validate/test sequence

dataperm = randperm(size(data,4)); % shuffle image order, together with labels 
data = data(:,:,:,dataperm); 
labels = labels(1,dataperm);
names = names(1,dataperm);

dataMean = mean(data(:,:,:,set == 1), 4); % subtract the mean
data = bsxfun(@minus, data, dataMean) ;

imdb.images.data = single(data) ;
imdb.images.labels = single(labels) ;
imdb.images.id = 1:numel(names) ;
imdb.images.name = names ; 
imdb.images.set = uint8(set) ; 

imdb.meta.sets = {'train', 'val', 'test'} ;
imdb.meta.classes = classes;
end
