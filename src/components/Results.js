
import React from 'react'
import path from "path"
const { characters } = require("../constants/characters")
const { stages } = require("../constants/stages")
const { importAll } = require('../lib').default

const images = importAll(require.context('../images', true, /\.(png|jpe?g|svg)$/));

console.log(images)
class Results extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			numPerPage: 8,
			currentPage: 0
		};
	  }

	renderStats(results){
		const time = (results.reduce((n,c)=>{
				const a = c.endFrame - c.startFrame;
				return n+a
			},0)/60).toFixed(1)

		return <div className="results-stats">
			<div className="results-stats-row">
				<div className="results-label">Total: </div>
				<div className="results-data">{results.length}</div>
			</div>
			<div className="results-stats-row">
				<div className="results-label">Time: </div>
				<div className="results-data">{time}</div>
			</div>
		</div>
	}

	renderList(results){
        const darkStages = [2,3,31,32]
		const { currentPage, numPerPage } = this.state
		const slicedResults = 
			results.slice(currentPage*numPerPage,(currentPage*numPerPage)+numPerPage)

		return slicedResults.map( (result,index) => {
			const { stage, comboer, comboee } = result
			const stageImage = images[stages[stage].img].default
			const arrowImage = images[(darkStages.indexOf(stage) != -1 ? "white":"") + "next.png"].default
			let p1Image, p2Image
			if(comboer){
				const p1Char = comboer.characterId
				const p1Color = comboer.characterColor
				p1Image = images[characters[p1Char].img + characters[p1Char].colors[p1Color] + ".png"].default
				const p2Char = comboee.characterId
				const p2Color = comboee.characterColor
				p2Image = images[characters[p2Char].img + characters[p2Char].colors[p2Color] + ".png"].default
			} else {
				const p1Char = result.players[0].characterId
				const p1Color = result.players[0].characterColor
				p1Image = images[characters[p1Char].img + characters[p1Char].colors[p1Color] + ".png"].default
				const p2Char = result.players[1].characterId
				const p2Color = result.players[1].characterColor
				p2Image = images[characters[p2Char].img + characters[p2Char].colors[p2Color] + ".png"].default
			}

			return ( <div className="result" key={index}>
				<div className="result-image-container">
					<div className='characters-container'>
						<img className='char1-image' src={p1Image}/>
						<img className='arrow-image' src={arrowImage}/>
						<img className='char2-image' src={p2Image}/>
					</div>
					<img className='stage-image' src={stageImage}/>
				</div>
				<div className="result-info-container">
					{ result.moves ? <div className='result-info-row'>
		 				<div className='result-info-label'>Moves:</div>
		 				<div className='result-info-data'>{result.moves.length}</div>
		 			</div> : ""}
		 			{ (result.startFrame && result.endFrame) ? <div className='result-info-row'>
		 				<div className='result-info-label'>Time:</div>
		 				<div className='result-info-data'>{((result.endFrame - result.startFrame)/60).toFixed(1)}</div>
		 			</div> : ""}
				</div>
			</div> )
		})
	}

	renderPagination(results){
		const { currentPage, numPerPage } = this.state
		return <div className="pagination">
			{ currentPage == 0 ? 
				<div className="prev disabled">Prev</div> :
				<div className="prev" 
					onClick={() => this.setState({currentPage: currentPage - 1})}
				>Prev</div> }
			<div className="current-page">{currentPage}</div>
			{ ( numPerPage * ( currentPage + 1 )) > results.length ? 
				<div className="next disabled">Next</div> :
				<div className="next" 
					onClick={() => this.setState({currentPage: currentPage + 1})}
				>Next</div> }
		</div>
	}

	render(){
		const { selectedResults } = this.props
		const { numPerPage } = this.state
		console.log("RENDER? ", selectedResults)
		return (
			<div className="results-section">
				{ this.renderStats(selectedResults) }
				{ selectedResults.length > numPerPage ? this.renderPagination(selectedResults) : ""}
				<div className="results-list">
					{ this.renderList(selectedResults) }
				</div>
			</div>
		)
	}
}

export default Results
