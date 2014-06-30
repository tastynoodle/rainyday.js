[![devDependency Status](https://david-dm.org/maroslaw/rainyday.js/dev-status.png)](https://david-dm.org/maroslaw/rainyday.js#info=devDependencies)
[![Build Status](https://travis-ci.org/maroslaw/rainyday.js.png)](https://travis-ci.org/maroslaw/rainyday.js)

# rainyday.js

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=XWP2SR3FLGE6C)

A simple script for simulating raindrops falling on a glass surface.

For demos and more information see the [project page](http://maroslaw.github.io/rainyday.js/).

### How to use:

```js
rd = new RainyDay()
    .rect(10, 10, window.innerWidth / 2, window.innerHeight / 2) // Destination rectangle
    .img(image) // id of the image DOM element or image URL of the image to be used
    .rain( // execute with presets
    [
        [3, 3, 0.88], // add drops size 3+(0,3) with 88% probability
        [5, 5, 0.9], // add drops size 5+(0,5) with 2% probability
        [6, 2, 1] // add drops size 6+(0,2) with 10% probability
    ]
);
```
