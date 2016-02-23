
unitID = 200;
totalImages = size(images, 2);

featureSet_unit = squeeze(features(:,:,unitID,:));
featureSet_vectorized = reshape(featureSet_unit,[13*13 totalImages]);
maxValue = max(featureSet_vectorized);
[value_sorted,IDX_sorted ] = sort(maxValue,'descend');
mkdir('data');
for i=1:20
    filepath = sprintf('C:/Users/Ian/Desktop/Valid/%s',images{IDX_sorted(i)});
    tempstr = images{IDX_sorted(i)};
    imagenames{i} = strrep(tempstr,'/','_');
    curImg = imread(filepath);
    disp(filepath);
    curImg = imresize(curImg,[256 256]);
    featureMap = squeeze(features(:,:,unitID,IDX_sorted(i)));
    featureMap = permute(featureMap,[2 1]);
    imwrite(curImg,['data/unitID' num2str(unitID) '_img' num2str(i) '.jpg']);
    %save(['data/unitID' num2str(unitID) '_img' num2str(i) '.jpg'], 'curImg');
    save(['data/unitID' num2str(unitID) '_feature' num2str(i) '.mat'],'featureMap');
end