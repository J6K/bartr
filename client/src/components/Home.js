import React from 'react';
import NavBar from './NavBar';
import './styles/styles.css'
import { connect } from 'react-redux';
import { getProfile } from '../actions/actionCreator';
import store from '../store';
import * as actionCreator from '../actions/actionCreator';
import { bindActionCreators } from 'redux';


class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      
    }
  }
  componentDidMount() {
    this.props.getProfile();
  }

  render () {
      console.log("this is props.profilereducer on line 28", this.props.ProfileReducer)
            console.log("this is props on line 29", this.props)


    return (
      <div className="home" >
        <h1>
Hi
{/*{this.props.ProfileReducer.map((profile,key) => (
            <div>
              <p>{profile.email}</p>
              <p>{profile.name}</p>
            </div>
            ))}*/}
        </h1>
      </div>
    )
  }
}


const mapStateToProps = (state) => {
  console.log(state);
  return {
    ProfileReducer : state.ProfileReducer
  }
}

// function mapDispatchToProps(dispatch) {
//   return bindActionCreators(actionCreator, dispatch);
// }

export default connect(mapStateToProps, { getProfile })(Home);
