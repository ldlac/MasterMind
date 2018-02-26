
import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import './css/file-finder.css';

let fs, isDev, path;
if(window.process !== undefined) {
  fs = window.require('fs');
  isDev = window.require('electron-is-dev');
  path = window.require('path');
}

class FileFinder extends Component {
  state = {
    selectedOption: ''
  }

  listMdtexFiles = myDir => {
    let mdtexFiles = [];
    fs.readdir(myDir, function(err, dir) {
      for(let filePath of dir) {
        let ext = filePath.split(".")[filePath.split(".").length - 1]
        if (ext === "mdtex") {
          mdtexFiles.push({ value: myDir+filePath, label: filePath })
        }
      }
    });
    return mdtexFiles;
  }

  onClickDiv = e => {
    this.props.onChange("", "");
  }

  onClickChildDiv = e => {
    e.stopPropagation();
  }

  handleSelectChange = (selectedOption) => {
    let selectedOptionContent = fs.readFileSync(selectedOption.value).toString();
    this.props.onChange(selectedOptionContent, selectedOption.value);
  }

  render() {
    const { selectedOption } = this.state;
    const value = selectedOption && selectedOption.value;
    let values = this.listMdtexFiles(path.join((isDev ? '' : window.process.resourcesPath), "public/"));

    return (
      <div onClick={this.onClickDiv} style={{height: document.body.clientHeight}} className="FileFinder">
        <div onClick={this.onClickChildDiv} className="FileFinderSelect">
          <Select
            autoFocus
            name="form-field-name"
            value={value}
            onChange={this.handleSelectChange}
            options={values}
          />
        </div>
      </div>
    );
  }
}

export default FileFinder;
