function images = load_images(str, isRotate, degree, count)


if nargin < 2
    isRotate = 0;
end

if nargin < 3
    degree = 90;
end

if nargin < 4
    count = 100;
end


cd(str);

for i=1:count
    file = sprintf('%d.png', i);
    if exist(file)
        im = imread(file);
        if isRotate
            im = imrotate(im, degree);
        end
        images(:,:,:,i) = im;  
    else
        break;
    end
end

cd ..