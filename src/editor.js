import React, { Component } from 'react';
import CodeMirror from '@skidding/react-codemirror';

require('codemirror/lib/codemirror.css');
require('codemirror/mode/markdown/markdown');
require('codemirror/theme/monokai.css');
require('codemirror/theme/3024-night.css');
require('codemirror/theme/icecoder.css');

class Editor extends Component {
  updateCode = e => this.props.onChange(e);

  render() {
    let options = {
      mode: this.props.mode,
      theme: this.props.theme,
    }
    return (
      <CodeMirror
        value={this.props.value} onChange={this.updateCode}
        options={options} height="100%"
      />
    );
  }
}

export default Editor;
