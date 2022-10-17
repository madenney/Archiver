import React from 'react'
import { videoConfig } from "../constants/config.js"
import slpToVideo from '../slpToVideo.js'
//console.log(slpToVideo)
const crypto = require("crypto")
const fs = require("fs")
const os = require("os")
const { ipcRenderer } = require("electron");
const path = require("path")
const { shuffleArray } = require("../lib").default

class Video extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			isOpen: false
			
		};
	  }

	componentDidMount(){
		const localState = {}
		videoConfig.forEach( c => {
			if(c.type == "checkbox"){
				if(localStorage[c.id] == "true") localState[c.id] = true
				if(localStorage[c.id] == "false") localState[c.id] = false
				if(!localStorage[c.id]) localState[c.id] = c.default
			} else {
				localState[c.id] = localStorage[c.id] ? localStorage[c.id] : c.default
			}
		})
		this.setState(localState)
	}

	async generateVideo(){
		console.log("GENERATING VIDEO")
		const { selectedResults } = this.props
		const { numCPUs, dolphinPath, ssbmIsoPath, gameMusic, hideHud, hideTags,
			hideNames, fixedCamera, enableChants, bitrateKbps, resolution, concatenate,
			outputPath, addStartFrames, addEndFrames, slice, shuffle, lastClipOffset,
			dolphinCutoff, disableScreenShake } = this.state
			

		let outputDirectoryName = "output";
		let count = 1;
		while(fs.existsSync(path.resolve(`${outputPath}/${outputDirectoryName}`))){
			outputDirectoryName = `output${count++}`
		}
		fs.mkdirSync(path.resolve(outputPath + "/" + outputDirectoryName))

		const config = {
			outputPath: path.resolve(outputPath + "/" + outputDirectoryName),
			numProcesses: numCPUs,
			dolphinPath: path.resolve(dolphinPath),
			ssbmIsoPath: path.resolve(ssbmIsoPath),
			gameMusicOn: gameMusic,
			hideHud: hideHud,
			hideTags: hideTags,
			hideNames: hideNames,
			disableScreenShake: disableScreenShake,
			disableChants: !enableChants,
			fixedCamera: fixedCamera,
			bitrateKbps: bitrateKbps,
			resolution: resolution,
			dolphinCutoff: dolphinCutoff
		}

		let finalResults = selectedResults;
		if( shuffle ) finalResults = shuffleArray(finalResults)
		if( parseInt(slice) ) finalResults = finalResults.slice(0,parseInt(slice))
		const replays = []
		finalResults.forEach((result, index) => {
			replays.push({
				index,
				path: result.path,
				startFrame: result.startFrame - parseInt(addStartFrames),
				endFrame: result.endFrame + parseInt(addEndFrames)
			})
		})
		if( parseInt(lastClipOffset) ) replays[replays.length-1].endFrame += parseInt(lastClipOffset)

		console.log("RUNNING.")
		console.log("Replays: ", replays)
		console.log("Config: ", config)
		await slpToVideo(replays, config)

		console.log("DONZO")
	}

	handleChange(key,value){
		this.setState({[key]:value})
		localStorage[key] = value
	}

	async handleGetPath(c){
		const path = await ipcRenderer.invoke("showDialog", [c.type])

		this.setState({[c.id]: path[0]})
		localStorage[c.id] = path[0]
	}

	renderInput(c){
		switch(c.type){
			case "checkbox":
				return <input type="checkbox" className="video-row-checkbox" 
					checked={this.state[c.id] ? this.state[c.id] : c.default}
					onChange={e => this.handleChange(c.id, e.target.checked)}
				/>
			case "openFile":
			case "openDirectory":
				return <input className="video-row-input"
					value={this.state[c.id] ? this.state[c.id] : c.default}
					onChange={() => {}}
					onClick={() => this.handleGetPath(c)}
				/>
			case "textInput":
			case "int":
				return <input className="video-row-input" 
					value={this.state[c.id] ? this.state[c.id] : c.default}
					onChange={e => this.handleChange(c.id, e.target.value)}
				/>
		}
	}

	render(){
		return (
			<div className="video-section">
				<div className="video-buttons-section">
					<button className="normal-button" onClick={() => this.generateVideo()}>Generate</button>
				</div>
				<div className="video-config-options">
				{ videoConfig.map( c => {
					return (
						<div className="video-row" key={c.id}>
							<div className="video-row-label">{c.label}</div>
							{ this.renderInput(c) }
						</div>
					)
				})}
				</div>
			</div>
		)
	}
}

export default Video
