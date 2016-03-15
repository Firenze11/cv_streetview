function imdb = getCityImdb(~)
%% Raw Data Format: 
% 1     2              3        4      5          6                     7
%	   lat	          lng	   dir	 city	    label	              filename
% 0	42.298631	-71.08309388	0	boston	Mount Bowdoin	boston/42.298631,-71.0830938769_0.png
% 1	42.298631	-71.08309388	1	boston	Mount Bowdoin	boston/42.298631,-71.0830938769_1.png
% 2	42.298631	-71.08309388	2	boston	Mount Bowdoin	boston/42.298631,-71.0830938769_2.png


%% prepare cell
IMAGE_PATH = 'C:/Users/lezhi/Dropbox/thesis/img'% '/media/senseable-beast/beast-brain-1/Data/streetviewdata/img'; % change this
LIST_PATH = 'C:/Users/lezhi/Dropbox/thesis/data/bos_sin_labels.csv';  % change this

fileID = fopen(LIST_PATH);
formatSpec = '%d %f %f %d %s %s %s %s';
csv_title = textscan(fileID,'%s ',7,'Delimiter',',');
csv_data = textscan(fileID,formatSpec,'Delimiter',',');

length_d = single(length(csv_data{1}));
length_c = single(length(unique(csv_data{6}))); 



%% prepare imdb.classes.name
class_name = unique(csv_data{6})';
class_name = regexprep(class_name,'[^\w'']',''); %delete space
imdb.classes.name =class_name;

%% prepare imdb.imageDir
imdb.imageDir = IMAGE_PATH;

%% prepare imdb.images.id
imdb.images.id = (double(csv_data{1}+1))';
%% prepare imdb.images.label

for i = 1:length_c
    classname_dict.(class_name{i}) =i; % build a dictionary to map name to number
end

label = 1:length_d;
for i = 1:length_d
    name = regexprep(csv_data{6}{i},'[^\w'']',''); %delete space
    label(i) = classname_dict.(name);
end

imdb.images.label = label;

%% prepare imdb.images.name
imdb.images.name = (strcat(csv_data{7} ,', ', csv_data{8}))';

imdb.images.name = strrep(imdb.images.name,'"','');

%% prepare imdb.images.set
set = rand(1,length_d);
for i = 1:length_d
     if     (set(i)<2/3) 
         set(i) = 1;
     elseif (set(i)<5/6) 
         set(i) = 2;
     else
         set(i) = 3;
     end
     set(i)= set(i);
end 
imdb.images.set = set;

end






