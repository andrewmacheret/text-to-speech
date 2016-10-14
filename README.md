# text-to-speech

[![Build Status](https://travis-ci.org/andrewmacheret/text-to-speech.svg?branch=master)](https://travis-ci.org/andrewmacheret/text-to-speech) [![License](https://img.shields.io/badge/license-MIT-lightgray.svg)](https://github.com/andrewmacheret/text-to-speech/blob/master/LICENSE.md)

Text-to-speech in the browser using the [Speech Synthesis API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API).

See it running at [https://andrewmacheret.com/projects/text-to-speech](https://andrewmacheret.com/projects/text-to-speech).

![Sound image](www/sound.png?raw=true "Sound image")

Prereqs:
* A web server (like [Apache](https://httpd.apache.org/)).

Installation steps:
* `git clone <clone url>`

Test it:
* Open `index.html` in a browser.
 * For testing purposes, if you don't have a web server, running `python -m SimpleHTTPServer` in the project directory and navigating to [http://localhost:8000](http://localhost:8000) should do the trick.
* Click the "Speak" button - you should hear sound.
* To troubleshoot, look for javascript errors in the browser console.

