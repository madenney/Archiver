import React from 'react'

class Video extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			isOpen: false
			
		};
	  }

	componentDidMount(){

	}

	renderSection(){
		return (
			<div className="section-content">
				<div>content</div>
			</div>
		)
	}

	render(){
		const { isOpen } = this.state

		return (
			<div className="section">
				<div className="title" onClick={() => this.setState({isOpen: !isOpen})}>Video
					<span>{isOpen ? "▼" : "▲" }</span>
				</div>
				{ isOpen ? this.renderSection() : "" }
			</div>
		)
	}
}

export default Video
