import React from 'react';
import { Zap, Github, Heart, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

export const Header: React.FC = () => {
  return (
    <>
      {/* Mobile Navigation */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ImageCompress
            </h1>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-white p-6">
              <SheetHeader>
                <SheetTitle>About ImageCompress</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-6 mt-4">
                {/* Hero Text */}
                <div className="p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">
                    Ultra-powerful image compression that reduces file sizes by up to 90% while maintaining stunning visual quality.
                  </p>
                </div>
                
                {/* Feature Highlights */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">Features</h3>
                  <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">Free & Privacy-focused</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">Lightning fast processing</span>
                  </div>
                  <a 
                    href="https://github.com/adenaufal/imagecompress" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Github className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Open source</span>
                  </a>
                </div>
                
                {/* Footer Content */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="text-center text-gray-500 text-sm">
                    <p>
                      Built with ❤️ by{' '}
                      <a 
                        href="https://github.com/adenaufal" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        adenaufal
                      </a>
                    </p>
                    <p className="mt-2 text-xs">
                      All processing happens locally in your browser
                    </p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Header */}
      <header className="text-center mb-8 md:mb-12 hidden md:block">
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
          <a 
            href="https://github.com/adenaufal/imagecompress" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>Open source</span>
          </a>
        </div>
      </header>

      {/* Mobile Header Content - Hidden on mobile */}
      <div className="px-4 pb-6 hidden">
        <p className="text-base text-gray-600 text-center mb-8">
          Ultra-powerful image compression that reduces file sizes by up to 90% 
          while maintaining stunning visual quality
        </p>
      </div>
    </>
  );
};