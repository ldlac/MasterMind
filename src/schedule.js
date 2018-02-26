// @flow
import React, { Component } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { ReactAgenda, ReactAgendaCtrl, Modal } from 'react-agenda'

let fs, isDev, path;
if(window.process !== undefined) {
  fs = window.require('fs');
  isDev = window.require('electron-is-dev');
  path = window.require('path');
}

require('moment/locale/fr.js');

let jsonfile_name, _events;
let events = [];
if(window.process !== undefined) {
  jsonfile_name = path.join((isDev ? '' : window.process.resourcesPath), "public/schedule.json");
  _events = JSON.parse(fs.readFileSync(jsonfile_name)).events;
  events = [];

  //Parse the string to Date before ReactAgenda get them
  for (let event of _events) {
    event.startDateTime = new Date(event.startDateTime);
    event.endDateTime = new Date(event.endDateTime);
    events.push(event);
  }
}

const colors= {
  'color-1':"rgba(102, 195, 131 , 1)" ,
  "color-2":"rgba(242, 177, 52, 1)" ,
  "color-3":"rgba(235, 85, 59, 1)" ,
  "color-4":"rgba(70, 159, 213, 1)",
  "color-5":"rgba(170, 59, 123, 1)"
}

export default class Agenda extends Component {
  state = {
    items:[],
    selected:[],
    cellHeight:(60 / 4),
    showModal:false,
    locale:"fr",
    rowsPerHour:4,
    numberOfDays:7,
    startDate: new moment("2018-07-01T12:00:00.000Z"),
  }

  componentDidMount(){
    this.setState({items: events});
  }

  componentWillReceiveProps(next , last){
    if(next.events){
      this.setState({items:next.events})
    }
  }

  handleItemEdit = (item, openModal) => {
    if(item && openModal === true){
      this.setState({selected:[item] })
      return this._openModal();
    }
  }

  handleCellSelection = (item, openModal) => {
    if(this.state.selected && this.state.selected[0] === item){
      return  this._openModal();
    }
     this.setState({selected:[item] })
  }

  zoomIn = () => {
    var num = this.state.cellHeight + 15
    this.setState({cellHeight:num})
  }

  zoomOut = () => {
    var num = this.state.cellHeight - 15
    this.setState({cellHeight:num})
  }

  handleDateRangeChange = (startDate, endDate) => {
    this.setState({startDate:startDate })
  }

  handleRangeSelection = (selected) => {
    this.setState({selected:selected , showCtrl:true})
    this._openModal();
  }

  _openModal = () => {
    this.setState({showModal:true})
  }

  _closeModal = (e) => {
    if(e){
      e.stopPropagation();
      e.preventDefault();
    }
    this.setState({showModal:false})
  }

  handleItemChange = (items, item) => {
    this.setState({items:items})
    this.save();
  }

  handleItemSize = (items, item) => {
    this.setState({items:items})
    this.save();
  }

  removeEvent = (items, item) => {
    let k = 0;
    for (let i of items) {
      if (_.isEqual(i, item)) {
        delete items[k]
      }
      k++;
    }
    this.setState({items:items});
    this.save();
  }

  addNewEvent = (items, newItems) => {
    this.setState({showModal:false ,selected:[] , items:items});
    this.save();
    this._closeModal();
  }

  editEvent = (items, item) => {
    this.setState({showModal:false ,selected:[] , items:items});
    this.save();
    this._closeModal();
  }

  changeView = (days, event ) =>{
    this.setState({numberOfDays:days})
  }

  save = () => {
    let content = {events: []};
    content.events = this.state.items;
    fs.writeFile(jsonfile_name, JSON.stringify(content), (err) => {
      if (err) console.log(err);
    })
  }

  render() {
    return (
      <div className="content-expanded ">
        <div className="control-buttons">
          <button  className="button-control" onClick={this.zoomIn}> <i className="zoom-plus-icon"></i> </button>
          <button  className="button-control" onClick={this.zoomOut}> <i className="zoom-minus-icon"></i> </button>
          <button  className="button-control" onClick={this._openModal}> <i className="schedule-icon"></i> </button>
          <button  className="button-control" onClick={this.changeView.bind(null , 7)}> {moment.duration(7, "days").humanize()}  </button>
          <button  className="button-control" onClick={this.changeView.bind(null , 4)}> {moment.duration(4, "days").humanize()}  </button>
          <button  className="button-control" onClick={this.changeView.bind(null , 3)}> {moment.duration(3, "days").humanize()}  </button>
          <button  className="button-control" onClick={this.changeView.bind(null , 1)}> {moment.duration(1, "day").humanize()} </button>
        </div>

        <ReactAgenda
          minDate={new moment("2018-07-01T12:00:00.000Z")}
          maxDate={new moment("2018-07-01T12:00:00.000Z").add(6, 'days')}
          startDate={this.state.startDate}
          startAtTime={10}
          cellHeight={this.state.cellHeight}
          locale="fr"
          items={this.state.items}
          numberOfDays={this.state.numberOfDays}
          headFormat={"ddd"}
          rowsPerHour={this.state.rowsPerHour}
          itemColors={colors}
          autoScale={false}
          fixedHeader={true}
          onRangeSelection={this.handleRangeSelection}
          onChangeEvent={this.handleItemChange}
          onChangeDuration={this.handleItemSize}
          onItemEdit={this.handleItemEdit}
          onCellSelect={this.handleCellSelection}
          onItemRemove={this.removeEvent}
          onDateRangeChange={this.handleDateRangeChange} />
        {
          this.state.showModal? <Modal clickOutside={this._closeModal} >
          <div className="modal-content">
             <ReactAgendaCtrl items={this.state.items} itemColors={colors} selectedCells={this.state.selected} Addnew={this.addNewEvent} edit={this.editEvent}  />
          </div>
         </Modal>:''
        }
      </div>
    );
  }
}
