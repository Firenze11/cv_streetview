function [shearedImg, finalImg] = run(images, circular, homogs, Ycrop, f, k1, k2)

oldW = 0;
oldH = 0;
    
noImages = size(images, 4);

for i=1:noImages-1
    im1 = cylinder_projection(images(:,:,:,i), f, k1, k2);
    im2 = cylinder_projection(images(:,:,:,i+1), f, k1, k2);
    
    W = homogs(i, 1);
    H = homogs(i, 2);
    
    if (i == 1)
        finalImg = stich(im1, im2, floor(W), floor(H));
    else
        finalImg = stich(finalImg, im2, oldW + floor(W), oldH + floor(H));
    end
    
    oldW = oldW  + floor(W);
    oldH = oldH + floor(H);
    i
end

if (circular == 1 )
    disp('circular sticthing.');
    % then we need to fiddle with stitching half of the first 
    % image at the end of the panorama, and setting Xcrop 
    % so that half of the first image is removed from the
    % beginning of the panorama.
    imlast = cylinder_projection(images(:,:,:,noImages), f, k1, k2);
    imfirst = cylinder_projection(images(:,:,:,1), f, k1, k2);

    W = homogs(noImages, 1);
    H = homogs(noImages, 2);
    Xcrop = size(images(:,:,:,1), 2)/2;

    finalImg = stich(finalImg, imfirst, oldW + floor(W), oldH + floor(H), Xcrop);
    shear = (oldH + floor(H))/(oldW + floor(W));
else
    disp('no circular sticthing.');
    Xcrop = 0;
    shear = oldH/oldW;
end

xdim = size(finalImg, 2);
ydim = size(finalImg, 1);
ytarget = size(images(:,:,:,1), 1);

shear

for i=Xcrop+1:xdim
    for j=Ycrop+1:ytarget-Ycrop
        ydash = floor(shear * i + j);
        if (ydash > 0 && ydash <= ydim)
            shearedImg(j-Ycrop, i-Xcrop,:) = finalImg(ydash, i, :);
        end
    end
end