import React from 'react'
import path from "path";
import fs from "fs";
import Archive from '../models/Archive';
const { ipcRenderer } = require("electron");

class App extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			createNew: false,
			newArchiveName: "new_archive",
			newArchiveDirectory: ""
		};
	  }

	
	async openExistingArchive(){
		const path = await ipcRenderer.invoke("showDialog", ["openFile"])
		const archive = new Archive(path[0])
		localStorage.last_archive = path[0]
		this.props.setArchive(archive)
	}

	async chooseArchivePath(){
		const path =  await ipcRenderer.invoke("showDialog",['openDirectory','createDirectory']);
		this.setState({newArchiveDirectory: path[0]})
	}

	createNewArchive(){
		const { newArchiveDirectory, newArchiveName } = this.state
		const newArchivePath = newArchiveDirectory + "/" + newArchiveName + ".json"
		const archiveJSON = JSON.parse(fs.readFileSync(path.resolve('./src/constants/jsonTemplates/archiveTemplate.json')));
		archiveJSON.name = newArchiveName;
		fs.writeFileSync(newArchivePath, JSON.stringify(archiveJSON));
		const archive = new Archive(newArchivePath)
		localStorage.last_archive = path[0]
		this.props.setArchive(archive)
	}

	render(){
		const { createNew, newArchiveDirectory, newArchiveName } = this.state
		const { setArchive } = this.props

		if( createNew ){
			return (
				<div className="main-content no-archive">
					<div className="form-row">
						<label className="label">Name:</label>
						<input type="text" 
							onChange={(e) => this.setState({newArchiveName: e.target.value})}
							value={newArchiveName}
						/>
					</div>
					<div className="form-row">
						<label className="label">Save Location:</label>
						<button onClick={this.chooseArchivePath.bind(this)}>Choose</button>
					</div>
					<div>{newArchiveDirectory + "/" + newArchiveName + ".json"}</div>
					<button className="normal-button" onClick={()=> this.setState({createNew: false})}>Back</button>
					<button className="normal-button" onClick={this.createNewArchive.bind(this)}>Create</button>
				</div>
			)
		} else {
			return (
				<div className='main-content no-archive'>
					<button className="normal-button" onClick={()=> this.setState({createNew: true})}>New Archive</button>
					<button className="normal-button" onClick={this.openExistingArchive.bind(this)}>Open Existing Archive</button>
				</div>
			)
		}
	}
}

export default App
