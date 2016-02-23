function newImg = stich(imcyl1, imcyl2, Tx, Ty, cropX)

if nargin < 5
   cropX = size(imcyl2, 2);
end

% the below code snippets assume
% that all images are of the same
% sizes.
xdimfirst = size(imcyl1, 2);
ydimfirst = size(imcyl1, 1);
xoverlap = xdimfirst - Tx;

newImg = imcyl1;

disp('Stiching It!')

for y = 1:size(imcyl2, 1)
   for x = 1:cropX
       if ((Tx+x) > 0 && (Ty+y) >0)
       % if we are in the overlap region, then we need to blend.
       if ( x < xoverlap &&  (Ty + y) <= ydimfirst)
           % if both images contain non-black pixels,
           if ( (imcyl1(Ty + y, Tx + x, 1) ~= 0 || ... 
                 imcyl1(Ty + y, Tx + x, 2) ~= 0 || ...
                 imcyl1(Ty + y, Tx + x, 3) ~= 0)         && ....                   
                (imcyl2(y, x, 1) ~= 0 || ...
                 imcyl2(y, x, 2) ~= 0 || ... 
                 imcyl2(y, x, 3) ~= 0))            
               % then blend them
               scale1 = (xoverlap - x) / xoverlap;
               scale2 = x / xoverlap;
               r = scale1 * imcyl1(Ty + y, Tx + x, 1) + scale2 * imcyl2(y, x, 1);
               g = scale1 * imcyl1(Ty + y, Tx + x, 2) + scale2 * imcyl2(y, x, 2);
               b = scale1 * imcyl1(Ty + y, Tx + x, 3) + scale2 * imcyl2(y, x, 3);
               newImg(Ty + y, Tx + x, :) = [r g b];
           % else if first image contains black pixel
           elseif ( imcyl1(Ty + y, Tx + x, 1) == 0 && ... 
                    imcyl1(Ty + y, Tx + x, 2) == 0 && ...
                    imcyl1(Ty + y, Tx + x, 3) == 0 )
               % then, pass through second image.
               newImg(Ty + y, Tx + x, :) = imcyl2(y, x, :);
           % else if second image contains black pixel
           elseif ( imcyl2(y, x, 1) == 0 && ...
                    imcyl2(y, x, 2) == 0 && ... 
                    imcyl2(y, x, 3) == 0 )
               % then, pass through first image.
               newImg(Ty + y, Tx + x, :) = imcyl1(Ty + y, Tx + x, :);
           % else => both images contain black pixels.
           else
               % so we don't really need to do anything.
               % but all the same 
               newImg(Ty + y, Tx + x, :) = [0 0 0];
           end
           %if (imcyl2(y, x, 1) ~= 0)
           %    pval = [imcyl2(y, x, 1) imcyl2(y, x, 2) imcyl2(y, x, 3)];
           %    newImg(Ty + y, Tx + x, :) = pval;
           %end
       else % if we are not in the overlap region, 
           % we just pass the pixel through from second image
           pval = [imcyl2(y, x, 1) imcyl2(y, x, 2) imcyl2(y, x, 3)];
           newImg(Ty + y, Tx + x, :) = pval;
       end
       else
           disp('encountered -ve')
       end
   end
end