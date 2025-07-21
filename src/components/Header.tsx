import React from 'react';
import { Zap, Github, Heart } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="text-center mb-12">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ImageCompress
        </h1>
      </div>
      
      <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
        Ultra-powerful image compression that reduces file sizes by up to 90% 
        while maintaining stunning visual quality
      </p>

      <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <Heart className="w-4 h-4 text-red-500" />
          <span>Free & Privacy-focused</span>
        </div>
        <div className="flex items-center space-x-1">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span>Lightning fast processing</span>
        </div>
        <div className="flex items-center space-x-1">
          <Github className="w-4 h-4" />
          <span>Open source</span>
        </div>
      </div>
    </header>
  );
};