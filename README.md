# Front
(Yet another) preconfigured frontend devstack - this time focusing on what's truly needed and helpful without all the useless stuff. With template engine [Swig](http://paularmstrong.github.io/swig/).

## Requirements

- [Node.js](http://nodes.org)
- [Gulp.js](http://gulpjs.com)
- [Bower](http://bower.io)

## Quickstart

```
git clone https://github.com/AvocadoExperience/Front.git
cd Front
npm install
bower install
```

Then run the default `gulp` task:

```
gulp
```

Your HTML templates (with inheritance), JavaScript, and Less files under `src` will be processed, bower dependencies gathered, and the output will go to the `build` folder. A BrowserSync server will also be started.

## Copyright
Copyright 2015 [Avocado Experience Ltd.](http://avocadoexperience.co)
Under [the MIT license](LICENSE.md).
Inspired by [Baby steps with gulp.js by Jair Trejo](http://jairtrejo.mx/blog/2014/11/baby-steps-with-gulp).
