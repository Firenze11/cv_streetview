clear all
close all

% inputDir = '/media/senseable-beast/beast-brain-1/Data/streetviewdata/img_dense';
% outputDir = '/media/senseable-beast/beast-brain-1/Data/streetviewdata/img_dense2';

inputDir = 'C:\Users\lezhi\Dropbox\thesis\img_dense';
outputDir = 'C:\Users\lezhi\Dropbox\thesis\img_dense2';

allCityNames = dir(inputDir);
allCityNames = {allCityNames([allCityNames.isdir]).name};
allCityNames(ismember(allCityNames,{'.','..','boston','singapore','newyork'})) = [];

for c = 1:length(allCityNames)
    allFiles = dir(fullfile(inputDir, allCityNames{c}));
    allNames = {allFiles(~[allFiles.isdir]).name};

%     mkdir(fullfile(outputDir, allCityNames{c}));
    for i = 1:length(allNames)
        str = fullfile(inputDir, allCityNames{c}, allNames{i});
        file = dir(str);
        filesize = file.bytes;
        if filesize > 4096
            currentImg = imread(str);
            %currentImg = currentImg(1:256,:,:); % to crop images
            dark = length(find(currentImg<=50));
            bright = length(find(currentImg>=220)); % blank image value = 228
            if dark > 0.8*numel(currentImg) | bright > 0.8*numel(currentImg)                
%                 str = fullfile(outputDir, allCityNames{c}, allNames{i});
%                 imwrite(currentImg,str);
                delete(str);
            end
        end
    end
end