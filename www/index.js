'use strict';

(function() {
  var synth = window.speechSynthesis;
  if (!synth) {
    document.getElementById('unsupported').hidden = false;
    document.getElementById('form').hidden = true;
    return;
  }

  var form = document.getElementById('form');
  var text = document.getElementById('text');
  var tbody = document.querySelector('#voices tbody');
  var status = document.getElementById('speech-status');
  var stopButton = document.getElementById('stop');
  var search = document.getElementById('voice-search');
  var count = document.getElementById('voice-count');
  var noVoices = document.getElementById('no-voices');
  var selectedURI = null;
  var sort = {key: 'name', ascending: true};

  // turns "ja-JP" into "Japanese (Japan)" in the reader's own language
  var languageNames = null;
  try {
    languageNames = new Intl.DisplayNames([navigator.language], {type: 'language'});
  } catch (e) {}

  function languageName(lang) {
    try {
      return languageNames ? languageNames.of(lang.replace('_', '-')) : lang;
    } catch (e) {
      return lang;
    }
  }

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
    if (key == 'lang') return languageName(value);
    return typeof value === 'boolean' ? (value ? 'yes' : 'no') : String(value);
  }

  function matchesSearch(voice) {
    var query = search.value.trim().toLowerCase();
    if (!query) return true;
    return [voice.name, voice.lang, languageName(voice.lang)].some(function(field) {
      return field.toLowerCase().indexOf(query) != -1;
    });
  }

  function makeCell(id, content) {
    var cell = document.createElement('td');
    var label = document.createElement('label');
    label.htmlFor = id;
    label.append.apply(label, content);
    cell.appendChild(label);
    return cell;
  }

  function makeSpan(className, text) {
    var span = document.createElement('span');
    span.className = className;
    span.textContent = text;
    return span;
  }

  function yesNo(value) {
    return makeSpan(value ? 'yes' : 'no', value ? 'Yes' : 'No');
  }

  // scroll the list (not the page) so the chosen voice is in the middle
  function scrollToSelected() {
    var radio = tbody.querySelector('input:checked');
    if (!radio) return;
    var wrapper = document.getElementById('voices-wrapper');
    var row = radio.closest('tr');
    wrapper.scrollTop = row.offsetTop - (wrapper.clientHeight - row.offsetHeight) / 2;
  }

  function renderVoices() {
    var allVoices = synth.getVoices();
    if (!allVoices.length) return;
    var firstRender = !selectedURI;
    if (!selectedVoice()) selectedURI = pickDefaultVoice(allVoices).voiceURI;

    var voices = allVoices.filter(matchesSearch);
    voices.sort(function(a, b) {
      var diff = sortValue(a, sort.key).localeCompare(sortValue(b, sort.key));
      return sort.ascending ? diff : -diff;
    });

    count.textContent = voices.length == allVoices.length ? allVoices.length : voices.length + ' of ' + allVoices.length;
    noVoices.hidden = voices.length > 0;

    tbody.replaceChildren.apply(tbody, voices.map(function(voice, i) {
      var row = document.createElement('tr');
      var id = 'voice-' + i;

      var radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'voice';
      radio.id = id;
      radio.value = voice.voiceURI;
      radio.checked = voice.voiceURI == selectedURI;

      row.append(
        makeCell(id, [radio]),
        makeCell(id, [makeSpan('voice-name', voice.name)]),
        makeCell(id, [languageName(voice.lang), makeSpan('lang-code', voice.lang)]),
        makeCell(id, [yesNo(voice.default)]),
        makeCell(id, [yesNo(voice.localService)])
      );
      return row;
    }));

    document.querySelectorAll('#voices th[data-sort]').forEach(function(th) {
      th.setAttribute('aria-sort', th.dataset.sort == sort.key ? (sort.ascending ? 'ascending' : 'descending') : 'none');
    });

    if (firstRender) scrollToSelected();
  }

  function setSpeaking(speaking) {
    status.classList.toggle('speaking', speaking);
    status.textContent = speaking ? 'Speaking' : 'Ready';
    stopButton.disabled = !speaking;
  }

  function speak() {
    var voice = selectedVoice();
    var utterance = new SpeechSynthesisUtterance(text.value);
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

  // Cmd+Enter or Ctrl+Enter speaks without leaving the text box
  text.addEventListener('keydown', function(event) {
    if (event.key == 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      speak();
    }
  });

  stopButton.addEventListener('click', function() {
    synth.cancel();
    setSpeaking(false);
  });

  // picking a voice says the text in that voice
  tbody.addEventListener('change', function(event) {
    selectedURI = event.target.value;
    speak();
  });

  search.addEventListener('input', function() {
    renderVoices();
    document.getElementById('voices-wrapper').scrollTop = 0;
  });

  // Enter in the search box shouldn't submit the form and start talking
  search.addEventListener('keydown', function(event) {
    if (event.key == 'Enter') event.preventDefault();
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
