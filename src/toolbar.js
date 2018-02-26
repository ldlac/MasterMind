import React, { Component } from 'react';
// import FaBeer from 'react-icons/fa/beer';
import MdFormatAlignLeft from 'react-icons/lib/md/format-align-left'
import MdChromeReaderMode from 'react-icons/lib/md/chrome-reader-mode'
import TiEye from 'react-icons/lib/ti/eye'
import Close from 'react-icons/lib/md/close'
import Maximize from 'react-icons/lib/md/fullscreen'
import Minimize from 'react-icons/lib/md/remove'
import Save from 'react-icons/lib/md/save'
import Open from 'react-icons/lib/md/folder-open'
import Sep from 'react-icons/lib/md/chevron-right'
import './css/toolbar.css';

class Toolbar extends Component {
  state = { view: "split"}

  switchToEditor = e => this.props.onClick("editor");
  switchToSplit = e => this.props.onClick("split");
  switchToView = e => this.props.onClick("view");
  close = e => this.props.onClick("close");
  save = e => this.props.onClick("save");
  open = e => this.props.onClick("open");
  maximize = e => this.props.onClick("maximize");
  minimize = e => this.props.onClick("minimize");

  render() {
    return (
      <div className="toolbar">
        <div className="toolbar-left">
          <Save width="22" height="22" onClick={this.save}/>
          <Open width="22" height="22" onClick={this.open}/>
          <Sep width="22" height="22"/>
          <MdFormatAlignLeft width="22" height="22" onClick={this.switchToEditor}/>
          <MdChromeReaderMode width="22" height="22" onClick={this.switchToSplit}/>
          <TiEye width="22" height="22" onClick={this.switchToView}/>
        </div>
        <div className="toolbar-right">
          <Minimize width="22" height="22" onClick={this.minimize}/>
          <Maximize width="22" height="22" onClick={this.maximize}/>
          <Close width="22" height="22" onClick={this.close}/>
        </div>
      </div>
    );
  }
}

export default Toolbar;
