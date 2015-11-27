function imdb = getCityImdb(opts)
% Preapre the imdb structure, returns image data with mean image subtracted

opts.dataDir = fullfile('C:\Users\lezhi\Dropbox\cv project') ; % change this!
opts.lite = false ;
% opts = vl_argparse(opts, varargin) ;

dirs = dir(opts.dataDir);
dirFlags = [dirs.isdir]; % Get a logical vector that tells which is a directory.
subFolders = dirs(dirFlags); % Extract only those that are directories.

labels = {};
names = {};
classes = {};

% loop through all city folders
for k = 3 : length(subFolders) % 3 is to ignore ./ and ../	
    files = dir(fullfile(opts.dataDir, subFolders(k).name, '*.png'));
    imnum = numel(files);
    fprintf('found %s with %d images\n', subFolders(k).name, imnum );
    
    labels{end+1} = (k-2)*ones(1,imnum); 
    names{end+1} = strcat([subFolders(k).name, filesep], {files.name}) ;
    classes{end+1} = subFolders(k).name;    
end % finish city folders loop

names = horzcat(names{:}) ; % convert to horizontal array
labels = horzcat(labels{:}) ;

% train/validate/test set fractions
trainfrac = double(4)/6;  validatefrac = double(1)/6;
trainnum = int32(size(labels,2)*trainfrac); 
validatenum = int32(size(labels,2)* validatefrac);

set = [ones(1,trainnum), 2*ones(1,validatenum),...
       3*ones(1,size(labels,2)-trainnum-validatenum)];

dataperm = randperm(size(labels,2)); % shuffle image order, together with labels 
labels = labels(1,dataperm);
names = names(1,dataperm);

imdb.images.id = 1:numel(names) ;
imdb.images.labels = single(labels) ;
imdb.images.name = names ; 
imdb.images.set = set ; 

imdb.classes.name = classes;
imdb.imageDir = fullfile(opts.dataDir) ;
end
