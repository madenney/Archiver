import React from 'react'
const { ipcRenderer } = require("electron");
const { readableDate } = require("../lib").default


class Files extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			isOpen: false,
			maxFiles: 100,
			processingFile: false,
			processMsg: ""
		};
	  }

	componentDidMount(){

	}
	
	async addFiles(){
		const { archive } = this.props
		const path = await ipcRenderer.invoke("showDialog", ["openDirectory"])
		archive.addFiles(path)
		this.forceUpdate()
	}

	process(){
		const { archive } = this.props
		this.setState({processingFiles: true})
		archive.processFiles((e) => {
			this.setState({processMsg: e.msg })
		})
		this.setState({processingFiles: false})
		this.forceUpdate()
	}

	renderFileList(){
		const { archive } = this.props
		return archive.files.slice(0,100).map((f,key) => {
			return <div key={key}>{f.path}</div>
		})
	}

	renderSection(){
		const { archive } = this.props
		
		return (
			<div className="section-content">
				<div className="row">
					<div className="label">Total files: </div>
					<div className="value">{archive.files.length}</div>
				</div>
				<div className="row">
					<div className="label">Processed: </div>
					<div className="value">{archive.files.filter(f=>f.isProcessed).length}</div>
				</div>
				<div className="row">
					<div className="label">Valid: </div>
					<div className="value">{archive.files.filter(f=>f.isValid).length}</div>
				</div>
				<div className="row">
					<div className="label">Created: </div>
					<div className="value">{readableDate(archive.createdAt)}</div>
				</div>
				<div className="row">
					<div className="label">Last Updated:</div>
					<div  className="value">{readableDate(archive.updatedAt)}</div>
				</div>
				<div className="row">
					<button className="normal-button" onClick={this.addFiles.bind(this)}>Add files</button>
					<button className="normal-button" onClick={this.process.bind(this)}>Process</button>
					<button hidden className="normal-button">Test</button>
					<div></div>
				</div>
				<div className={"row " + (archive.files.length ? "" : "hidden")} >
				  	<div className="files-list">{this.renderFileList()}</div>
				</div>
			</div>
		)
	}

	render(){
		const { isOpen } = this.state

		return (
			<div className="section">
				<div className="title" onClick={() => this.setState({isOpen: !isOpen})}>Files
					<span>{isOpen ? "▼" : "▲" }</span>
				</div>
				{ isOpen ? this.renderSection() : "" }
			</div>
		)
	}
}

export default Files
