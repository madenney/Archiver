import React from 'react'
import { videoConfig } from "../constants/config.js"

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

	handleChange(key,value){
		this.setState({[key]:value})
		localStorage[key] = value
	}

	render(){

		return (
			<div className="video-section">
				<div className="video-buttons-section">
					<button className="normal-button">Generate</button>
				</div>
				<div className="video-config-options">
				{ videoConfig.map( c => {
					return (
						<div className="video-row" key={c.id}>
							<div className="video-row-label">{c.label}</div>
							{ c.type == "checkbox" ? 
								<input type="checkbox" className="video-row-checkbox" 
									checked={this.state[c.id] ? this.state[c.id] : c.default}
									onChange={e => this.handleChange(c.id, e.target.checked)}
								/>
							: 	<input className="video-row-input" value={this.state[c.id] ? this.state[c.id] : c.default}
									onChange={e => this.handleChange(c.id, e.target.value)}
								/>
							}
						</div>
					)
				})}
				</div>
			</div>
		)
	}
}

export default Video
