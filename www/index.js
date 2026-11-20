'use strict';

(function() {
  var synth = window.speechSynthesis;
  if (!synth) {
    document.getElementById('unsupported').hidden = false;
    document.getElementById('form').hidden = true;
    return;
  }

  var form = document.getElementById('form');
  var tbody = document.querySelector('#voices tbody');
  var status = document.getElementById('speech-status');
  var selectedURI = null;
  var sort = {key: 'name', ascending: true};

  // show each slider's value next to it
  document.querySelectorAll('.slider input').forEach(function(input) {
    var output = input.parentNode.querySelector('output');
    function update() { output.textContent = parseFloat(input.value).toFixed(1); }
    input.addEventListener('input', update);
    update();
  });

  // the default text is a Tokyo Drift joke, so prefer a Japanese voice
  function pickDefaultVoice(voices) {
    function isJapanese(voice) { return voice.lang == 'ja-JP' || voice.lang == 'ja_JP'; }
    function isEnglish(voice) { return voice.lang == 'en-US' || voice.lang == 'en_US'; }
    return voices.find(function(voice) { return isJapanese(voice) && !voice.localService; })
      || voices.find(isJapanese)
      || voices.find(function(voice) { return isEnglish(voice) && voice.localService; })
      || voices[0];
  }

  function selectedVoice() {
    return synth.getVoices().find(function(voice) { return voice.voiceURI == selectedURI; });
  }

  function sortValue(voice, key) {
    var value = voice[key];
    return typeof value === 'boolean' ? (value ? 'yes' : 'no') : String(value);
  }

  function renderVoices() {
    var voices = synth.getVoices().slice();
    if (!voices.length) return;
    if (!selectedVoice()) selectedURI = pickDefaultVoice(voices).voiceURI;

    voices.sort(function(a, b) {
      var diff = sortValue(a, sort.key).localeCompare(sortValue(b, sort.key));
      return sort.ascending ? diff : -diff;
    });

    tbody.replaceChildren.apply(tbody, voices.map(function(voice, i) {
      var row = document.createElement('tr');
      var id = 'voice-' + i;
      var cells = [null, voice.name, voice.lang, voice.default ? 'yes' : 'no', voice.localService ? 'yes' : 'no'];
      cells.forEach(function(text) {
        var cell = document.createElement('td');
        var label = document.createElement('label');
        label.htmlFor = id;
        if (text === null) {
          var radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = 'voice';
          radio.id = id;
          radio.value = voice.voiceURI;
          radio.checked = voice.voiceURI == selectedURI;
          label.appendChild(radio);
        } else {
          label.textContent = text;
        }
        cell.appendChild(label);
        row.appendChild(cell);
      });
      return row;
    }));

    document.querySelectorAll('#voices th[data-sort]').forEach(function(th) {
      th.setAttribute('aria-sort', th.dataset.sort == sort.key ? (sort.ascending ? 'ascending' : 'descending') : 'none');
    });
  }

  function setSpeaking(speaking) {
    status.className = speaking ? 'speaking' : 'not-speaking';
    status.setAttribute('aria-label', speaking ? 'Speaking' : 'Not speaking');
  }

  function speak() {
    var voice = selectedVoice();
    var utterance = new SpeechSynthesisUtterance(document.getElementById('text').value);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.volume = parseFloat(document.getElementById('volume').value);
    utterance.pitch = parseFloat(document.getElementById('pitch').value);
    utterance.rate = parseFloat(document.getElementById('rate').value);
    utterance.onstart = function() { setSpeaking(true); };
    utterance.onend = utterance.onerror = function() { setSpeaking(synth.speaking); };

    // stop anything still talking so the new voice starts right away
    synth.cancel();
    synth.speak(utterance);
  }

  form.addEventListener('submit', function(event) {
    event.preventDefault();
    speak();
  });

  // picking a voice says the text in that voice
  tbody.addEventListener('change', function(event) {
    selectedURI = event.target.value;
    speak();
  });

  document.querySelectorAll('#voices th[data-sort] button').forEach(function(button) {
    button.addEventListener('click', function() {
      var key = button.parentNode.dataset.sort;
      sort = {key: key, ascending: sort.key == key ? !sort.ascending : true};
      renderVoices();
    });
  });

  // some browsers load their voices a moment after the page does
  synth.addEventListener('voiceschanged', renderVoices);
  renderVoices();
})();
