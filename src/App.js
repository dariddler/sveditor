import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import Players from './components/Players';
import dl from 'js-file-download';
import cx from 'classnames';
import './App.css';
import editor from './editor';

const playerNameMap = i => i.name[0];

class App extends Component {
  state = {}

  toggleHelp() {
    const { help } = this.state;

    this.setState({ help: !help });
  }

  playerSort(sortedPlayers) {
    this.setState({ players: sortedPlayers });
  }

  downloadSave() {
    if (!this.state.result || !this.state.players) {
      alert('Please upload a savefile before attempting to download');
      return;
    }
    editor.injectPlayers(this.state.players);
    const xml = editor.getSavefile();
    dl(xml, this.state.filename);
  }

  onDrop(af) {
    af.forEach(file => {
      const reader = new FileReader();
      this.setState({ filename: file.name });

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

    const helpClassNames = ['h'];
    const dlClassNames = ['dz','dl'];

    if (this.state.help) {
      helpClassNames.push('active');
    }
    if (this.state.result && this.state.players) {
      dlClassNames.push('enabled');
    }


    return (
      <div className="App">
        <header className="header">
          <h1 className="title">
            <div className="t">Stardew Valley Coop Editor</div>
            <div className={cx(helpClassNames)} onClick={this.toggleHelp.bind(this)}>?</div>
          </h1>
        </header>
        {this.state.help && <div>
          <p>Where can i find the saves?</p>
          <ul className={'helpList'}>
            <li><p>Copy the command below</p><p className={'help'}>%appData%\stardewvalley\saves</p></li>
            <li>Hit Win+R</li>
            <li>Paste the command here, it will open an explorer window to the saves directory</li>
            <li>Locate the COOP save that you wish to edit</li>
            <li>Drop the COOP save in the first dropzone</li>
            <li>Drop any other save in the second dropzone</li>
            <li>You can now drag and drop the players in the list</li>
            <li>
                <p>The first 4 players will be the ones enabled in the save once you download it</p>
                <p className={'hostHelp'}>Green is the host</p>
                <p className={'farmhandHelp'}>Blue is the characters that will be available to play for those joining your session</p>
                <p className={'duplicateHelp'}>Orange is characters that is present in more than 1 savefile, you can identify which is the newest copy using the timestamp displayed</p>
            </li>
          </ul>
        </div>
        }
        <Dropzone className={'dz'} onDrop={this.onDrop.bind(this)}>
          <p>Drop your savefile here</p>
        </Dropzone>
        <Dropzone className={'dz'} onDrop={this.onPlayerDrop.bind(this)}>
          <p>Drop more saves here to extract players</p>
        </Dropzone>
        <Players players={this.state.players} onSort={this.playerSort.bind(this)} />
        <div className={cx(dlClassNames)} onClick={this.downloadSave.bind(this)} >
          <p>Download modified savefile</p>
        </div>

      </div>
    );
  }
}

export default App;
