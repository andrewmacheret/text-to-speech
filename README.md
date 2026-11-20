# text-to-speech

[![Deploy](https://github.com/andrewmacheret/text-to-speech/actions/workflows/deploy.yml/badge.svg)](https://github.com/andrewmacheret/text-to-speech/actions/workflows/deploy.yml) [![License](https://img.shields.io/badge/license-MIT-lightgray.svg)](https://github.com/andrewmacheret/text-to-speech/blob/master/LICENSE.md)

Text-to-speech in the browser using the [Speech Synthesis API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API). Plain JavaScript, no libraries.

See it running at [https://andrewmacheret.com/projects/text-to-speech/](https://andrewmacheret.com/projects/text-to-speech/).

![Sound image](www/sound.png?raw=true "Sound image")

## Run it locally

```
cd www
python3 -m http.server
```

Then open [http://localhost:8000](http://localhost:8000) and click "Speak". You should hear the text. Picking a voice from the table also reads the text in that voice.

## Deploy

Pushing to `master` runs [GitHub Actions](.github/workflows/deploy.yml), which syncs `www/` to `s3://andrewmacheret.com/projects/text-to-speech` and clears the CloudFront cache. It signs in to AWS with GitHub OIDC using the role in the `AWS_ROLE_ARN` repo variable.
