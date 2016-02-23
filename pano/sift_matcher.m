function [match] = sift_matcher(K1, loc1, K2, loc2)

funnyno = 100000000;
distq1 = funnyno;
distq2 = funnyno;
m=1;


for i=1:size(K1, 1)
  keypoint = K1(i, :);
  keylist = K2;
  
  distq1 = funnyno;
  distq2 = funnyno;
  
  for j=1:size(keylist, 1)
      dist = sum((keypoint - keylist(j, :)).^2);      
      if (dist < distq1)
          distq2 = distq1;
          distq1 = dist;
          minkey = j;
      elseif (dist < distq2)
          distq2 = dist;
      end
  end
  
  if (10 * 10 * distq1 < 6 * 6 * distq2)
      a = loc1(i, :);
      b = loc2(minkey, :);
      match(m, 1) = a(1);
      match(m, 2) = a(2);
      match(m, 3) = b(1);
      match(m, 4) = b(2);
      match(m, 5) = distq1;  
      m = m + 1;
  end
end