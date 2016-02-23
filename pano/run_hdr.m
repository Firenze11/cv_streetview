function [shearedImgs, finalImgs, homogs] = run_hdr(keydir, dirs, circular, f, k1, k2, rotAngle)

rot = 0;
if nargin == 7;
    rot = 1;
end   

if rot == 1
    images = load_images(keydir, rot, rotAngle);
else
    images = load_images(keydir);
end
    
noImages = size(images, 4);
Ycrop = 0;

for i=1:noImages-1
    i
    im1 = cylinder_projection(images(:,:,:,i), f, k1, k2);
    im2 = cylinder_projection(images(:,:,:,i+1), f, k1, k2);
    
    [W, H] = model_homography(im1, im2);
    homogs(i,1) = floor(W);
    homogs(i,2) = floor(H);
    if (Ycrop < H)
        Ycrop = H;
    end
end

if (circular == 1 )
    noImages
    imlast = cylinder_projection(images(:,:,:,noImages), f, k1, k2);
    imfirst = cylinder_projection(images(:,:,:,1), f, k1, k2);

    [W, H] = model_homography(imlast, imfirst);
    homogs(noImages,1) = floor(W);
    homogs(noImages,2) = floor(H);
    if (Ycrop < H)
        Ycrop = H;
    end
end

if (Ycrop < 0)
    Ycrop = 0;
end


disp('printing homographies')
homogs

%disp('generating panoramas')
%1

%[shearedImg, finalImg] = run(images, circular, homogs, floor(Ycrop), f, k1, k2);

%shearedImgs(:,:,:,1) = shearedImg(:,:,:);
%finalImgs(:,:,:,1) = finalImg(:,:,:);

for i=1:size(dirs,1)
    disp('generating panoramas')
    i
    
    if rot == 1
        images = load_images(dirs(i,:), rot, rotAngle);
    else
        images = load_images(dir(i,:));
    end
    [shearedImg, finalImg] = run(images, circular, homogs, floor(Ycrop), f, k1, k2);

    shearedImgs(:,:,:,i) = shearedImg(:,:,:);
    finalImgs(:,:,:,i) = finalImg(:,:,:);
end
    