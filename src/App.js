import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import Players from './components/Players';
import dl from 'js-file-download';
import './App.css';
import editor from './editor';

const playerNameMap = i => i.name[0];

class App extends Component {
  state = {}

  playerSort(sortedPlayers) {
    this.setState({ players: sortedPlayers });
  }

  downloadSave() {
    editor.injectPlayers(this.state.players);
    const xml = editor.getSavefile();
    dl(xml, this.state.filename);
  }

  onDrop(af) {
    af.forEach(file => {
      const reader = new FileReader();
      this.setState({ filename: file.name });
      console.log(file);
      reader.onload = () => {
        let xml = reader.result;
        editor.readSave(xml, (err, result) => {
          if (err) {
            console.error(err);
            return;
          }
          const players = editor.getPlayers(result);
          this.setState({ result, players });
        });
      };
      reader.readAsText(file);
    });
  }

  onPlayerDrop(af) {
    af.forEach(file => {
      const reader = new FileReader();
      let statePlayerNames = [];
      reader.onload = () => {
        let xml = reader.result;
        editor.readSave(xml, (err, result) => {
          if (err) {
            console.error(err);
            return;
          }
          const players = editor.getPlayers(result);

          // Put names from state into array
          if (this.state.players) {
            statePlayerNames = this.state.players.map(playerNameMap);
          }

          // Iterate players to see if we need to show copies
          if (players) {
            console.log(players.length);
            players.forEach(i => {
              if (statePlayerNames.indexOf(i.name[0]) !== -1) {
                i.tmpHolder = file.lastModifiedDate;
              }
            });
            const newPlayers = [].concat(this.state.players, players);

            this.setState({ players: newPlayers });
            this.forceUpdate();
          }
          
        });
      }
      reader.readAsText(file);
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Stardew Valley Coop Editor</h1>
        </header>
        <Dropzone className={'dz'} onDrop={this.onDrop.bind(this)}>
          <p>Drop your savefile here</p>
        </Dropzone>
        <Dropzone className={'dz'} onDrop={this.onPlayerDrop.bind(this)}>
          <p>Drop more saves here to extract players</p>
        </Dropzone>
        <Players players={this.state.players} onSort={this.playerSort.bind(this)} />
        <div className={'dz'} onClick={this.downloadSave.bind(this)} >
          <p>Download modified savefile</p>
        </div>

      </div>
    );
  }
}

export default App;
