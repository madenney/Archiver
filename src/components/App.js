import React from 'react'
import Header from "./Header"
import Files from "./Files"
import Patterns from "./Patterns"
import Results from "./Results"
import Video from "./Video"
import fs from "fs";
import Archive from '../models/Archive';
import NoArchive from './NoArchive'

class App extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			archive: null
		};
	  }

	componentDidMount(){
		if(localStorage.last_archive && fs.existsSync(localStorage.last_archive)){
			this.setState({
				archive: new Archive(localStorage.last_archive)
			})
		}
	}

	closeArchive() {
		this.setState({ archive: null })
	}

	render(){
		const { archive } = this.state
		console.log("render-archive:", archive)
		if(archive){
			return (
				<div className='main-content'>
					<Header archive={archive} closeArchive={this.closeArchive.bind(this)}/>
					<Files archive={archive}/>
					<Patterns archive={archive}/>
					<Results archive={archive}/>
					<Video archive={archive}/>
				</div>
			)
		} else {
			return <NoArchive setArchive={(archive) => this.setState({archive})}/>
		}
	}
}

export default App
