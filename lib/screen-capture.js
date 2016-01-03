"use strict";

const os = require('os');
const process = require('process');
const spawn = require('child_process').spawn;

class ScreenCapture {
   
   get stream() {
      return this._process.stdout;
   }
   
   constructor(options) {
      options = Object.assign({
         size: '1024x768',
         framerate: 25,
         fps: 25
      }, options);
      
      this._process = spawn('ffmpeg', this._configure(options));
      this._process.stderr.pipe(process.stderr);
   }
   
   end() {
      this._process.stdin.write('s');
   }
   
   _configure(options) {
      let args = [];
   
      switch (os.platform()) {
         case 'linux':
         case 'freebsd':
         case 'sunos':
            args.push(
               '-f', 'x11grab',
               '-i', process.env['DISPLAY']);
            break;
   
         case 'darwin':
            args.push(
               '-f', 'avfoundation',
               '-i', '"0:0"');
            break;
   
         case 'win32':
            args.push(
               '-f', 'dshow',
               '-i', 'video="screen-capture-recorder"');
            break;
   
         default:
            throw new Error('platform not supported');
      }
      
      args.push(
         '-framerate', options.fps,
         '-video_size', options.size,
         '-c:v', 'bmp',
         '-f', 'rawvideo',
         '-pix_fmt', 'bgr8',
         'pipe:1');
      
      return args;
   }
}

module.exports = options => new ScreenCapture(options);