import React from 'react'
import ReactDOM from 'react-dom'
 
// Main app component
class App extends React.PureComponent {

    /** Called on app startup */
    componentDidMount() {



    }
    
    /** Render the app UI */
    render = () => <>
        <h1>{{APP_NAME}}</h1>
        <div>Hello world</div>
    </>
    
}
 
// Render the app
let div = document.createElement('div')
document.body.appendChild(div)
ReactDOM.render(<App />, div)
