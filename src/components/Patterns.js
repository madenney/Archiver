import React from 'react'
import { patternsConfig } from "../constants/config.js"

class Patterns extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			isOpen: false,
			patterns: props.archive.patterns,
			showEditPatternModal: false,
			currentPattern: null
		};
	}

	runPattern(pattern){
		console.log("RUN: ", pattern)
	}

	addNewPattern(e){
		const { archive } = this.props
		const type = e.target.value
		console.log(type)
		archive.addNewPattern(type)
		this.forceUpdate();
	}

	renderEditOptions(pattern){
		const config = patternsConfig.find(p => p.type == pattern.type)
		return config.options.map( option => {
			
			let input = "";
			switch(option.type){
				case "textInput":
				case "int":
					input = <input className="modal-row-input"
						onChange={e => {pattern.method[option.id] = e.target.value; this.forceUpdate()}}
						value={pattern.method[option.id]}
					/>
					break;
				case "dropdown":
					input = <select value={pattern.method[option.id]} className="modal-row-input" 
						onChange={e => {pattern.method[option.id] = e.target.value; this.forceUpdate()}}>
						<option value="">Any</option>
						{option.options.map(o => <option key={o.id} value={o.id}>{o.shortName}</option> )}
					</select>
					break;
				case "checkbox":
					input = <input 
						className="modal-row-input modal-row-checkbox" type="checkbox"
						checked={pattern.method[option.id]}
						onChange={(e) => { pattern.method[option.id] = e.target.checked; this.forceUpdate()}}
					/>
					break;
				case "nthMoves":
					input = <div className="nth-moves">
						<button className="add-nth-move-button" 
							onClick={() => {pattern.method[option.id].push({moveId: "", n: ""}); this.forceUpdate()}}
						>Add Move</button>
						{ pattern.method[option.id].map((move,index) => {
							return <div key={index} className="nth-move">
								<div className="nth-move-label">N</div>
								<input className="nth-move-input" value={move.n} 
									onChange={e => {move.n = e.target.value; this.forceUpdate()}}
								/>
								<div className="nth-move-label">Move</div>
								<select className="nth-move-input" value={move.moveId} 
									onChange={e => {move.moveId = e.target.value; this.forceUpdate()}}
								>{option.options.map(o => <option key={o.id} value={o.id}>{o.shortName}</option> )}
								</select>
								<div className="nth-move-delete"
									onClick={() => {pattern.method[option.id].splice(index,1); this.forceUpdate()}}>
								✕</div>
							</div>
						})}
					</div>
					break;
			}
			return ( 
				<div className="modal-row" key={option.id}>
					<div className="modal-row-label">{option.name}</div>
					{input}
				</div>
			)	
		})
	}

	renderEditPatternModal(){
		const { currentPattern } = this.state
		console.log("EDITNG: ", currentPattern)
		return (
			<div className="modal-container" onClick={() => this.setState({ showEditPatternModal: false})}>
				<div className="modal" onClick={(e) => e.stopPropagation()}>
					{ this.renderEditOptions(currentPattern) }
				</div>
			</div>
		)
	}

	renderPatterns(){
		const { patterns } = this.state
		return patterns.map( (pattern, index) => {
			return (
				<div key={index} className="pattern-row">
					<input 
						className="pattern-checkbox" type="checkbox"
						checked={pattern.isActive}
						onChange={(e) => { pattern.isActive = e.target.checked; this.forceUpdate()}}
					/>
					<div onClick={() => console.log(pattern)} className="pattern-title">{pattern.type}</div>
					<button className="pattern-button" 
						onClick={() => this.setState({
							showEditPatternModal: true,
							currentPattern: pattern
						})}
					>Edit</button>
					<button className="pattern-button" onClick={() => this.runPattern(pattern)}>Run</button>
					<div className="pattern-results">{pattern.results.length}</div>
					<div 
						className="pattern-delete"
						onClick={() => {patterns.splice(patterns.indexOf(pattern),1); this.forceUpdate()}}>
					✕</div>
				</div>
			)
		})
	}

	renderSection(){
		return (
			<div className="section-content">
					<div className="add-pattern-label">Add - </div>
					<select value="default" className="add-pattern-dropdown" onChange={this.addNewPattern.bind(this)}>
						<option value="default" disabled>Select Pattern</option>
						{patternsConfig.map(p => <option key={p.type}>{p.type}</option> )}
					</select> 
				<div id="patterns-list">{this.renderPatterns()}</div>
			</div>
		)
	}

	render(){
		const { isOpen, showEditPatternModal } = this.state

		return (
			<div className="section">
				<div className="title" onClick={() => this.setState({isOpen: !isOpen})}>Patterns
					<span>{isOpen ? "▼" : "▲" }</span>
				</div>
				{ isOpen ? this.renderSection() : "" }
				{ showEditPatternModal ? this.renderEditPatternModal() : "" }
			</div>
		)
	}
}

export default Patterns
