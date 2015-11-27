function [net, info] = cnn_city(varargin)
% CNN_CIFAR   Demonstrates MatConvNet on CIFAR-10
%    The demo includes two standard model: LeNet and Network in
%    Network (NIN). Use the 'modelType' option to choose one.

run(fullfile(fileparts(mfilename('fullpath')), ...
  '..', 'matlab', 'vl_setupnn.m')) ;

opts.modelType = 'lenet' ;
[opts, varargin] = vl_argparse(opts, varargin) ;

switch opts.modelType
  case 'lenet'
    opts.train.learningRate = [0.05*ones(1,15) 0.005*ones(1,10) 0.0005*ones(1,5)] ;
    opts.train.weightDecay = 0.0001 ;
  case 'nin'
    opts.train.learningRate = [0.5*ones(1,30) 0.1*ones(1,10) 0.02*ones(1,10)] ;
    opts.train.weightDecay = 0.0005 ;
  otherwise
    error('Unknown model type %s', opts.modelType) ;
end
opts.expDir = fullfile('data', sprintf('city-%s', opts.modelType)) ;
[opts, varargin] = vl_argparse(opts, varargin) ;

opts.train.numEpochs = numel(opts.train.learningRate) ;
[opts, varargin] = vl_argparse(opts, varargin) ;

% opts.dataDir = fullfile('C:\Users\lezhi\Dropbox\cv project') ; % change this!
opts.imdbPath = fullfile(opts.expDir, 'imdb.mat');
opts.whitenData = true ;
opts.contrastNormalization = true ;
opts.train.batchSize = 100 ;
opts.train.continue = true ;
opts.train.gpus = [] ;
opts.train.expDir = opts.expDir ;
opts = vl_argparse(opts, varargin) ;

% --------------------------------------------------------------------
%                                               Prepare data and model
% --------------------------------------------------------------------

switch opts.modelType
  case 'lenet', net = cnn_cifar_init(opts) ;
  case 'nin',   net = cnn_cifar_init_nin(opts) ;
end

if exist(opts.imdbPath, 'file')
  imdb = load(opts.imdbPath) ;
else
  imdb = getCityImdb(opts) ;
  mkdir(opts.expDir) ;
  save(opts.imdbPath, '-struct', 'imdb') ;
end

% --------------------------------------------------------------------
%                                                                Train
% --------------------------------------------------------------------
[net, info] = cnn_train(net, imdb, @getCityBatch, ...
    opts.train, ...
    'val', find(imdb.images.set == 3)) ;  % what does these two variables mean?
end




