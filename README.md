[![devDependency Status](https://david-dm.org/maroslaw/rainyday.js/dev-status.png)](https://david-dm.org/maroslaw/rainyday.js#info=devDependencies)
[![Build Status](https://travis-ci.org/maroslaw/rainyday.js.png)](https://travis-ci.org/maroslaw/rainyday.js)

# rainyday.js

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=XWP2SR3FLGE6C)

A simple script for simulating raindrops falling on a glass surface.

For demos and more information see the [project page](http://maroslaw.github.io/rainyday.js/).

### How to use:

Simple use to render rain on a given rectangle based on a DOM element image:
```js
rd = new RainyDay()
    .rect(10, 10, 300, 300) // Destination rect
    .img(image)             // id of the image DOM element or the DOM element itself
    .rain(                  // execute with presets
    [
        [3, 3, 0.88],       // add drops size 3+(0,3) with 88% probability
        [5, 5, 0.9],        // add drops size 5+(0,5) with 2% probability
        [6, 2, 1]           // add drops size 6+(0,2) with 10% probability
    ]
);
```
If you want to render it as a page background use something like this
```js
rd = new RainyDay()
    .cover()            // Use as page background
    .img('image')       // you can use id of the img element
    .rain(              // execute with presets
    [
        [3, 3, 0.5],    // add drops size 3+(0,3) with 50% probability
        [7, 2, 0.8],    // add drops size 7+(0,2) with 30% probability
        [9, 2, 1]       // add drops size 9+(0,2) with 20% probability
    ]
);
```
In order to customize the configuration of the script pass an object overriding the default configuration like this:
```js
rd = new RainyDay
    (
        {
            opacity: 1,             // Opacity of rain drops
                                    // Defaults to 1
            blur: 10,               // Defines blur due to rain effect
                                    // Defaults to 10
            resize: true,           // Enable or disable handling resize events
                                    // Defaults to 'true'
            gravity: true,          // Enable or disable gravity
                                    // Defaults to 'true'
            collisions: true,       // Enable or disable collisions
                                    // Defaults to 'true'
            threshold: 3,           // Threshold for the gravity function
                                    // Defaults to 3
            angle: Math.PI / 2      // Gravity angle
                                    // Defaults to PI / 2
            angleVariance: 0,
            scaledownFactor: 5,
            reflectionWidth: 50,
            reflectionHeight: 50
        }
    )
    .cover()                        // Use as page background
    .img(image1)                    // script background
    .rain(                          // execute with presets
    [
        [3, 2, 0.4], // add drops size 3+(0,2) with 40% probability
        [5, 2, 0.5], // add drops size 5+(0,2) with 10% probability
        [7, 2, 1] // add drops size 7+(0,2) with 50% probability
    ]
);
```
Afterwards you can use the API to control the animation:
```js
rd.pause();                 // pause the animation
rd.start();                 // resume
rd.cover();                 // make animation full screen
rd.img('img2');             // load a different image
rd.intensity(33);           // control rain intensity (0-100)
rd.gravity(false);          // disable gravity function
rd.gravity();               // turn gravity back on
rd.speed(50);               // control rain speed (0-100)
rd.rect(0, 0, 100, 100);    // resize to a given rectangle
rd.stop();                  // stop the animation
```