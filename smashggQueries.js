
const tournamentQuery = `query TournamentQuery($slug: String) {
	tournament(slug: $slug){
		id
		name
		events {
			id
			name
		}
	}
}`

const eventsQuery = `query EventSets($eventId: ID!, $page:Int!, $perPage:Int!){
  event(id:$eventId){
    id
    name
    sets(
      page: $page
      perPage: $perPage
      sortType: STANDARD
    ){
      pageInfo{
        total
      }
      nodes{
        id
        fullRoundText
      	completedAt
        winnerId
        slots{
          id
          entrant{
            id
            name
          }
          standing{
            placement
            stats{
              score {
                label
                value
              }
            }
          }
        }
      }
    }
  }
}`

module.exports = {
	tournamentQuery,
	eventsQuery
}