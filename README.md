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
    .rect(10, 10, window.innerWidth / 2, window.innerHeight / 2) // Destination rectangle
    .img(image) // id of the image DOM element or the DOM element itself
    .rain( // execute with presets
    [
        [3, 3, 0.88], // add drops size 3+(0,3) with 88% probability
        [5, 5, 0.9], // add drops size 5+(0,5) with 2% probability
        [6, 2, 1] // add drops size 6+(0,2) with 10% probability
    ]
);
```
If you want to render it as a page background use something like this
```js
rd = new RainyDay()
    .cover() // Use as page background
    .img('http://i.imgur.com/U1Tqqdw.jpg') // you can use image URL here as well
    .rain( // execute with presets
    [
        [3, 3, 0.5], // add drops size 3+(0,3) with 50% probability
        [7, 2, 0.8], // add drops size 7+(0,2) with 30% probability
        [9, 2, 1] // add drops size 9+(0,2) with 20% probability
    ]
);
```
In order to customize the configuration of the script pass an object overriding the default configuration like this:
```js
rd = new RainyDay
    (
        {
            opacity: 1,                         // Opacity of rain drops (= 1)
            blur: 10,                           // Defines blur due to rain effect (= 10)
            resize: true,
            gravity: true,                      // Enable or disable gravity (= true)
            reflections: true,                  // Enable or disable reclections inside droplets (= true)
            fill: '#8ED6FF',                    // Fill style if reflections are disabled (= #8ED6FF)
            collisions: true,                   // Enable or disable collisions (= true)
            gravityThreshold: 3,                // Threshold for the gravity function (= 3)
            gravityAngle: Math.PI / 2,          // Gravoty angle ( = PI / 2)
            gravityAngleVariance: 0,
            reflectionScaledownFactor: 5,
            reflectionDropMappingWidth: 50,
            reflectionDropMappingHeight: 50
        }
    )
    .cover() // Use as page background
    .img('http://i.imgur.com/U1Tqqdw.jpg') // script background
    .rain( // execute with presets
    [
        [3, 2, 0.4], // add drops size 3+(0,2) with 40% probability
        [5, 2, 0.5], // add drops size 5+(0,2) with 10% probability
        [7, 2, 1] // add drops size 7+(0,2) with 50% probability
    ]
);
