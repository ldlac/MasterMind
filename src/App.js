import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
import ReactMarkdown from 'react-markdown';
import katex from 'katex';
import ReactCalendar from 'react-calendar';
import Moment from 'moment';
import assign from 'lodash.assign';
import Editor from './editor.js';
import Agenda from './agenda.js';
import Schedule from './schedule.js';
import CodeBlock from './code-block.js';
import Toolbar from './toolbar.js';
import FileFinder from './file-finder.js';
import './App.css';
import './css/scrollbar.css';
import './css/splitpane.css';

// import logo from './logo.svg';

require('highlight.js/styles/monokai.css');
require('katex/dist/katex.css');

let fs, isDev, electron, path, ipc, remote, dialog;
if(window.process !== undefined) {
  fs = window.require('fs');
  isDev = window.require('electron-is-dev');
  electron = window.require('electron');
  path = window.require('path');
  ipc = electron.ipcRenderer;
  remote = electron.remote;
  dialog = remote.dialog;
}
// const electron_process = electron.process;
// const electron_app = electron.app;

class App extends Component {
  state = {
    contentSrc: "",
    currentFile: "",
    splitPaneSize: "50%",
    theme: 'monokai',
    rview: 'view',
    panes: true,
    lview: 'editor',
    mode: 'markdown',
    calendar: false,
    schedule: false,
    maximized: false,
    fileFinder: false,
    nowDate: new Date(),
    selDate: new Date()
  };

  componentDidMount() {
    let mdcontent = "test";
    let mdfile_name = "";
    if(window.process !== undefined) {
      ipc.on('rview', (event, panel) => {
        this.setState({
          rview: panel
        })
      });

      ipc.on('show-calendar', (event, value) => {
        if (this.state.calendar) {
          this.setState({
            calendar: false
          })
        } else {
          this.setState({
            calendar: true
          })
        }
      });

      ipc.on('show-filefinder', (event, value) => {
        if (this.state.fileFinder) {
          this.setState({
            fileFinder: false
          })
        } else {
          this.setState({
            fileFinder: true
          })
        }
      });

      ipc.on('show-schedule', (event, value) => {
        if (this.state.schedule) {
          this.setState({
            schedule: false,
            panes: true,
          })
        } else {
          this.setState({
            schedule: true,
            panes: false,
          })
        }
      });

      ipc.on('lview', (event, panel) => {
        this.setState({
          lview: panel
        })
      });

      ipc.on('change-theme', (event, theme) => {
        this.setState({
          theme: theme
        })
      });

      ipc.on('file-opened', (event, file, content) => {
        this.setState({
          contentSrc: content
        });
      });

      ipc.on('save-file', (event) => {
        dialog.showSaveDialog((filename) => {
          if(filename === undefined){
            return;
          }

          var content = this.state.contentSrc;

          fs.writeFile(filename, content, (err) => {
            if (err) console.log(err);
            alert("The file has been successfully saved.");
          })
        });
      });
      mdfile_name = path.join((isDev ? '' : window.process.resourcesPath), "public/welcome.mdtex");
      mdcontent = fs.readFileSync(mdfile_name).toString();
    }
    this.setState({
      contentSrc: mdcontent,
      currentFile: mdfile_name
    });
  }

  onMarkdownChange  = md => {
    this.setState({
      contentSrc: md
    });
  }

  onToolbarClick = e => {
    switch(e) {
      case "editor":
        this.setState({ splitPaneSize: "100%"})
        break;
      case "split":
        this.setState({ splitPaneSize: "50%"})
        break;
      case "view":
        this.setState({ splitPaneSize: "0%"})
        break;
      case "close":
        remote.getCurrentWindow().close();
        break;
      case "maximize":
        if (!this.state.maximized) {
          remote.getCurrentWindow().maximize();
          this.setState({
            maximized: true
          });
        } else {
          this.setState({
            maximized: false
          });
          remote.getCurrentWindow().unmaximize();
        }
        break;
      case "minimize":
        remote.getCurrentWindow().minimize();
        break;
      case "save":
        dialog.showSaveDialog((filename) => {
          if(filename === undefined){
            return;
          }

          var content = this.state.contentSrc;

          fs.writeFile(filename, content, (err) => {
            if (err) console.log(err);
            // alert("The file has been successfully saved.");
          })
        });
        break;
      case "open":
        const files = dialog.showOpenDialog({
          properties: ['openFile'],
          filters: [
            { name: 'Markdown/Tex Files', extensions: ['md', 'markdown', 'txt', 'mdtex'] }
          ]
        })

        if (!files) return

        const file = files[0]
        const content = fs.readFileSync(file).toString()
        this.setState({
          contentSrc: content
        });
        break;
      default:
        break;
    }
  }

  onDateChange = date => {
    this.setState({ selDate:date, lview: 'agenda', calendar: false, splitPaneSize: "100%" });

    //This should be in react-agenda but there is no function in the component to let me do it. Refs power.
    if(this.refs.agenda) {
      let refReactAgenda = this.refs.agenda.refs.reactAgenda;
      let nextStartDate = Moment(date);
      if (refReactAgenda.state.hasOwnProperty('maxDate')) {
        nextStartDate = Moment.min(nextStartDate, refReactAgenda.state.maxDate);
      }

      let newStart = nextStartDate;
      let newEnd = Moment(newStart).add(refReactAgenda.state.numberOfDays - 1, 'days');

      if (nextStartDate !== refReactAgenda.state.date) {
        refReactAgenda.setState({date: nextStartDate});
      }

      if (refReactAgenda.props.onDateRangeChange) {
        refReactAgenda.props.onDateRangeChange(newStart.startOf('day').toDate(), newEnd.endOf('day').toDate());
      }
    }
  }

  renderView = side => {
    console.log(document.body.clientHeight);

    switch(side) {
      case "editor":
        return <Editor className="editor" mode={this.state.mode} theme={this.state.theme} value={this.state.contentSrc} onChange={this.onMarkdownChange}/>;
      case "agenda":
        return <Agenda ref="agenda" selDate={this.state.selDate}/>;
      case "view":
        let textBlocks = (this.state.contentSrc).split("#EQ");
        let reshtml = [];
        for (let [index, textBlock] of textBlocks.entries()) {
          if (textBlock.startsWith(">")) {
            let math = katex.renderToString(textBlock.slice(1)) + "</br>";
            reshtml.push(<p className="result" key={index} dangerouslySetInnerHTML={ {__html: math } }/>);
          } else {
            reshtml.push(<ReactMarkdown key={index} className="result"
                    source={textBlock}
                    renderers={assign({}, ReactMarkdown.renderers, {CodeBlock: CodeBlock})}
                    />);
          }
        }
        return reshtml
      default:
        break;
    }
  }

  onFileFinderChange = (fileContent, filePath) => {
    if (fileContent !== "") {
      this.setState({contentSrc: fileContent, currentFile: filePath});
    }
    this.setState({fileFinder: false})
    console.log(fileContent);
  }

  render() {
    let rpane = null;
    let lpane = null;

    try {
      lpane = this.renderView(this.state.lview);
    } catch(e) {
      console.log(e);
      lpane = <p>Syntax error unable to render this</p>
    }

    try {
      rpane = this.renderView(this.state.rview);
    } catch(e) {
      rpane = <p>Syntax error unable to render this</p>
    }

    let showReactCalendar = this.state.calendar ? <ReactCalendar className="calendar" value={this.state.nowDate} onClickDay={this.onDateChange}/> : <div/>;
    let showSchedule = this.state.schedule ? <Schedule className="schedule" ref="agenda" selDate={this.state.selDate}/> : <div/>;
    let showFileFinder = this.state.fileFinder ? <FileFinder onChange={this.onFileFinderChange} className="fileFinder"/> : <div/>;

    const style = {
      position: "relative",
      height: "calc(100%)"
    }

    return (
      <div className="App">
        <Toolbar onClick={this.onToolbarClick}/>
        <div className="Content">
          {showFileFinder}
          {
            this.state.panes ?
            <SplitPane style={style} split="vertical" size={this.state.splitPaneSize}>
              <div className="lpane">
                {lpane}
              </div>
              <div className="rpane">
                {rpane}
              </div>
            </SplitPane> : <div/>
          }
          {showSchedule}
          {showReactCalendar}
        </div>
      </div>
    );
  }
}

export default App;
