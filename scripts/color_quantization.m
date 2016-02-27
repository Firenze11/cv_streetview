close all;

[rgb, alpha]=imread('test.png');
imshow(rgb);

[X_no_dither,map]= rgb2ind(rgb,20,'nodither');
figure, imshow(X_no_dither,map);