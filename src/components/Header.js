import React from 'react'

class Header extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			archive: props.archive
		};
	  }

	componentDidMount(){

	}

	save(){
		const { archive } = this.props
		archive.save()
	}

	render(){
		const { archive } = this.state
		return (
            <div className="header">
                <div className="header-project-title" onClick={() => console.log(archive)}>{archive.name}</div>
				<button onClick={this.save.bind(this)} id="save-archive-button">Save</button>
				<button onClick={this.props.closeArchive} id="close-archive-button">Close</button>

            </div>
        )
	}
}

export default Header