function [WidthOrigin, HeightOrigin]=model_homography(image1, image2)

% Note that in this code, X axis is along the height of the image
% and Y axis is along the width of the image.

[img1, desc1, loc1] = sift(image1);
[img2, desc2, loc2] = sift(image2);

%match is N x 5 array where each row contains
% [im1X im1Y im2X im2Y dist]
match=sift_matcher(desc1, loc1, desc2, loc2);

CONTROL_K = 100;
e = 0.6;
count = 0;
%currentMatches = [];
currentH = zeros(3,3);

for k=1:CONTROL_K
    sample = ceil(rand(1) * size(match, 1));    
    deltaX = match(sample, 3) - match(sample, 1);
    deltaY = match(sample, 4) - match(sample, 2);
    H=[1 0 deltaX; 0 1 deltaY; 0 0 1];
    currentCount = 0;
    %clear matchIndexes;
    
    for i = 1:size(match, 1)
        lhs = H * [match(i, 1); match(i, 2); 1];
        xnew = lhs(1);
        ynew = lhs(2);
        
        ssd = (match(i, 3) - xnew)^2 + (match(i, 4) - ynew)^2;
        if ssd < e
            currentCount = currentCount + 1;
            %matchIndexes(currentCount, 1) = i;
        end
    end
    
    if currentCount > count
        count = currentCount;
        %currentMatches = matchIndexes;
        currentH = H;
    end
end

%for i=1:size(currentMatches)
%    inliersImage1(i, 1:2) = match(i, 1:2);    
%    inliersImage2(i, 1:2) = match(i, 3:4);
%end

%inliersImage1(:, 3) = 1;
%inliersImage2(:, 3) = 1;

%H = inliersImage1\inliersImage2;
%H = H';
%currentH
WidthOrigin = -(currentH(2,3));
HeightOrigin = -(currentH(1,3));