"use strict";

// props:
//  min - minimum value
//  max - maximum value
//  step - step between values
//  initial - initial value
//  format - function to format the value for the tooltip (optional)
//  label - label for the control
var Slider = React.createClass({
  componentDidMount: function() {
    var wrapper = ReactDOM.findDOMNode(this);
    $(wrapper).children('.slider-control-wrapper').slider({
      value: this.state.value,
      min: parseFloat(this.props.min),
      max: parseFloat(this.props.max),
      step: parseFloat(this.props.step),
      orientation: 'horizontal',
      range: 'min',
      animate: true,
      create: this.handleChange,
      slide: this.handleChange,
      change: this.handleChange
    });

    $(wrapper).children('.slider-label-wrapper').text(this.props.label);
  },

  handleChange: function(event, ui) {
    if(ui.hasOwnProperty('value')) {
      this.setState({
        value: ui.value,
      });
    }

    var formatFunction = this.props.format || function(value) {return value};

    var tooltip =
          '<div class="tooltip">'
          + '<div class="tooltip-inner">'
            + formatFunction(this.state.value)
          + '</div>'
          + '<div class="tooltip-arrow">'
          + '</div>'
        + '</div>';

    $(event.target).children('.ui-slider-handle').html(tooltip); //attach tooltip to the slider handle
  },

  getInitialState: function(){
    return {
      value: parseFloat(this.props.initial),
    };
  },

  render: function() {
    return (
      <div className="slider-wrapper">
        <div className="slider-label-wrapper" />
        <div className="slider-control-wrapper" />
      </div>
    );
  }
});

var SpeakButton = React.createClass({
  componentDidMount: function() {
    var wrapper = ReactDOM.findDOMNode(this);
    $(wrapper).button({
      click: this.handleClick
    });
  },

  handleClick: function(event, ui) {
  },

  render: function() {
    return (
      <button type="submit" id="speak-button"><img id="sound-image" src="sound.png" />Speak</button>
    );
  }
});

var Volume = React.createClass({
  render: function() {
    var formatFunction = function(value) {return value.toFixed(1); };
    return (
      <Slider ref="slider" label="Volume" min="0.1" max="1" step="0.1" initial="1" format={formatFunction} />
    );
  }
});

var Pitch = React.createClass({
  render: function() {
    var formatFunction = function(value) {return value.toFixed(1); };
    return (
      <Slider ref="slider" label="Pitch" min="0" max="2" step="0.1" initial="1" format={formatFunction} />
    );
  }
});

var Rate = React.createClass({
  render: function() {
    var formatFunction = function(value) {return value.toFixed(1); };
    return (
      <Slider ref="slider" label="Rate" min="0.1" max="10" step="0.1" initial="0.9" format={formatFunction} />
    );
  }
});


var Text = React.createClass({
  getInitialState: function() {
    return {
      value: 'The Fast and The Furious: Tokyo Drift'
    };
  },
  handleChange: function(event) {
    this.setState({
      value: event.target.value
    });
  },
  render: function() {
    return (
      <textarea id="text" value={this.state.value} onChange={this.handleChange}  />
    );
  }
});


var Voices = React.createClass({
  generateState: function(voice) {
    return {
      value: voice
    };
  },

  getInitialState: function() {
    var allVoices = window.speechSynthesis.getVoices();

    var filtered = allVoices.filter(function(voice) { return (voice.lang == 'ja-JP' || voice.lang == 'ja_JP') && !voice.localService; });
    if (filtered.length > 0) {
      return this.generateState(filtered[0]);
    }

    filtered = allVoices.filter(function(voice) { return (voice.lang == 'ja-JP' || voice.lang == 'ja_JP'); });
    if (filtered.length > 0) {
      return this.generateState(filtered[0]);
    }

    filtered = allVoices.filter(function(voice) { return (voice.lang == 'en-US' || voice.lang == 'en_US') && voice.localService; });
    if (filtered.length > 0) {
      return this.generateState(filtered[0]);
    }

    return this.generateState(allVoices[0]);
  },

  handleChange: function(event) {
    var voiceURI = event.target.value;

    var allVoices = window.speechSynthesis.getVoices();
    var filtered = allVoices.filter(function(voice) { return voice.voiceURI == voiceURI; });
    this.setState(this.generateState(filtered[0]));

    if (this.props.onChange) {
      this.forceUpdate(function() {
        this.props.onChange(null);
      });
    }
  },

  componentDidMount: function() {
    var table = ReactDOM.findDOMNode(this);
    sorttable.makeSortable(table);
    var nameColumn = document.getElementById('name');
    sorttable.innerSortFunction.apply(nameColumn);
  },

  render: function() {
    var allVoices = window.speechSynthesis.getVoices();

    var index = 0;
    var voiceNodes = allVoices.map(function(voice) {
      var radioId = 'voice-' + index++;
      var defaultChecked = voice.voiceURI == this.state.value.voiceURI;
      return (
        <tr key={radioId}>
          <td><label htmlFor={radioId}><input defaultChecked={defaultChecked} type="radio" name="voice" value={voice.voiceURI} id={radioId} onChange={this.handleChange} /></label></td>
          <td><label htmlFor={radioId}>{voice.name}</label></td>
          <td><label htmlFor={radioId}>{voice.lang}</label></td>
          <td><label htmlFor={radioId}>{voice.default ? 'yes' : 'no'}</label></td>
          <td><label htmlFor={radioId}>{voice.localService ? 'yes' : 'no'}</label></td>
        </tr>
      );
    }.bind(this));
    return (
      <table id="voices" className="sortable">
        <thead>
          <tr>
            <th className="sorttable_nosort" id="choose"></th>
            <th id="name">Name</th>
            <th id="lang">Language</th>
            <th id="default">Default?</th>
            <th id="localService">Local Service?</th>
          </tr>
        </thead>
        <tbody>
          {voiceNodes}
        </tbody>
      </table>
    );
  }
});

var SpeechStatus = React.createClass({
  getInitialState: function() {
    return {
      value: false
    };
  },

  start: function() {
    this.setState({
      value: true
    });
  },

  stop: function() {
    this.setState({
      value: false
    });
  },

  speaking: function() {
    return this.state.value;
  },

  render: function() {
    return (
      <div id="speech-status" className={this.state.value ? 'speaking' : 'not-speaking'} />
    );
  }
});

var SpeechForm = React.createClass({
  handleSubmit: function(event) {
    if (event) event.preventDefault();

    /*
    if (this.refs.speechStatus.speaking()) {
      return;
    }
    */

    var volume = this.refs.volume.refs.slider.state.value;
    var pitch = this.refs.pitch.refs.slider.state.value;
    var rate = this.refs.rate.refs.slider.state.value;
    var voice = this.refs.voices.state.value;
    var text = this.refs.text.state.value;

    var utterance = new window.SpeechSynthesisUtterance();
    utterance.voice = voice;
    utterance.volume = volume;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.text = text;
    utterance.lang = voice.lang;

    this.refs.speechStatus.start();
    utterance.onend = function(e) {
      this.refs.speechStatus.stop();
    }.bind(this);

    window.speechSynthesis.speak(utterance);
  },

  render: function() {
    if (!window.speechSynthesis) {
      alert('This browser does not support the Speech Synthesis API. Try chrome or firefox.');
      return (
        <div />
      );
    }

    return (
      <form id="form" action="#" onSubmit={this.handleSubmit}>
        <Text ref="text" />
        <SpeakButton />
        <SpeechStatus ref="speechStatus" />
        <Volume ref="volume" />
        <Pitch ref="pitch" />
        <Rate ref="rate" />
        <Voices ref="voices" onChange={this.handleSubmit} />
      </form>
    );
  }
});

ReactDOM.render((
    <div>
      <h1>
        Text-to-speech using the Speech Synthesis API
      </h1>
      <h2>
        This demo only works in <img src="dolphin.png" /> android default browser and <img src="chrome.png" /> chrome. It works in <img src="firefox.png" /> firefox (desktop only) if you turn on <span className="code">mediawebspeech.synth.enabled</span> in <a href="about:config">about:config</a>. See the browser section of <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API">the MDN page</a> for more info.
      </h2>
      <SpeechForm />
    </div>
  ),
  document.getElementById('content')
);


