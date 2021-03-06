import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Autocomplete from 'react-google-autocomplete'
import { geocodeByAddress } from 'react-places-autocomplete'
import { Dropdown, Input, Header, Image, Grid } from 'semantic-ui-react';
// import { Button, ButtonControl} from 'react-bootstrap';
import ServiceProviderList from './ServiceProviderList';

import _ from 'lodash';
import axios from 'axios';
import AddressSearchWithData  from '../containers/AddressSearchContainer'

class ServiceMap extends Component {
  constructor(props){
    super(props)

    this.state = {
      selectedServiceType: null,
      foundServiceUsers: [],
      serviceTypes: []
    }

    this.loadMap = this.loadMap.bind(this);
    this.putMarkersOnMap = this.putMarkersOnMap.bind(this);
    this.displaySelectedAddress = this.displaySelectedAddress.bind(this);
    this.changeSelectedService = this.changeSelectedService.bind(this);
    this.clearMarkers = this.clearMarkers.bind(this);
    this.loadServices = this.loadServices.bind(this);
    this.fetchRemainingServiceUsers = this.fetchRemainingServiceUsers.bind(this);
    // this.requestService = this.requestService.bind(this);

    this.googleMap = null;
    this.googleMapMarkers = [];

  }

  componentDidMount() {
    this.loadServicesTypes();
    this.loadMap();
    this.loadServices()
  }

  componentDidUpdate() {
    console.log('componentDidUpdate location', this.props.AddressSearch.lat, this.props.AddressSearch.long)
    // this.loadServicesTypes();
    this.loadMap();
    // this.loadServices()
  }


  loadServicesTypes() {
    axios.get(API_ENDPOINT + '/api/services')
      .then(result => {
        _.each(result.data, service => {
          this.setState({
            serviceTypes: this.state.serviceTypes.concat([{text: service.type, value: service.id, key: service.id}])
          })
        })
      }).catch(err => {
        console.log('Error loading serviceTypes: ', err);
      })
  }

  loadServices() {
    let axios_config = {
      params: {
        lat: this.props.AddressSearch.lat,
        long: this.props.AddressSearch.long,
        distance: 30,
      }
    };

    if(this.state.selectedServiceType) {
      axios_config.params['services'] = this.state.selectedServiceType;
    }
    
    console.log(axios_config)
    axios.get(API_ENDPOINT + '/api/services/find', axios_config)
      .then(result => {
        console.log('this is the result.data ', result.data)
        this.setState({foundServiceUsers: result.data}, () => {
          this.putMarkersOnMap(this.googleMap)
        })
      }).catch(err => {
      console.log('Error loading foundServiceUsers: ', err);
    })
  }

  clearMarkers() {
    _.each(this.googleMapMarkers, (marker) => {
      marker.setMap(null)
    })
    this.googleMapMarkers = [];
  }

  // requestService(event) {
  //   event.preventDefault();
  //   axios.post(API_ENDPOINT + '/api/engagements')
  //       .then(data => {
  //         console.log('Engagement Created! ', data);
  //       })
  //       .catch(err => {
  //         console.log('Error: ', err);
  //       })
  // }

  putMarkersOnMap(map) {
      const maps = google.maps;
      this.clearMarkers();
      _.each(this.state.foundServiceUsers, user => {
        let marker = new maps.Marker({
          position: {lat: user.geo_lat, lng: user.geo_long},
          map: map
        })
        this.googleMapMarkers.push(marker);
        let contentString = `<div id="content">` + `<div id="siteNotice">` + `</div>` +
        `<h1 id="firstHeading" class="firstHeading">${user.name}</h1>` +
        `<image wrapped size="medium" src="http://images4.wikia.nocookie.net/marveldatabase/images/9/9b/Ultimate_spiderman.jpg" height="85" width="85"/>` +
        `<div id="bodyContent">` + `<h2>${user.service.type}</h2>` + `</div>`;
        
//////////////////// If we want to add something so they can send a message with their request///////////////////////

        // `<form id="map-form">` + `<input id="request-engage" type="text" placeholder="Send a Request!"/>` + 
        // `<input type='submit' id="submit-request" />` + `</form>`

        let infoWindow = new maps.InfoWindow({
          content: contentString
        })
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        })
      })
    }

/////////////////////// Button to Request Service to the Provider on the marker/////////////////////////////


/////////////////////// Loads map at their location. Adds marker for their location too/////////////////////////////


  loadMap() {
    const homeUrl = "https://cdn3.iconfinder.com/data/icons/map-markers-1/512/residence-512.png";
      const google = window.google;
      const maps = google.maps;
      
      const mapRef = this.refs.map;
      const node = ReactDOM.findDOMNode(mapRef);

      let { zoom } = this.props;
      const center = new maps.LatLng(this.props.AddressSearch.lat, this.props.AddressSearch.long);
      const mapConfig = Object.assign({}, {
        center: center,
        zoom: zoom
      })
      this.map = new maps.Map(node, mapConfig);
      this.googleMap = this.map

      const home = {
        url: homeUrl,
        scaledSize: new google.maps.Size(40,40),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(20,20)
      }
      const marker = new maps.Marker({
        map: this.map,
        draggable: false,
        animation: maps.Animation.DROP,
        position: center,
        icon: home,
        title: "Your Location"
      })
      marker.setMap(this.map);
  }

  displaySelectedAddress(event) {
    event.preventDefault();
    this.loadMap();
    this.loadServices();
  }

  changeSelectedService(event, result) {
    event.preventDefault();
    this.setState({selectedServiceType: result.value}, () => {
      this.loadServices()
    });
  }

  fetchRemainingServiceUsers(serviceusers) {
    let requested;
    _.each(this.state.foundServiceUsers, (foundServiceUsers, index) => {
       _.each(foundServiceUsers, (value, key) => {
         value === serviceusers.receiver_id ? requested = index : null
       })
     })
     this.state.foundServiceUsers.splice(requested, 1);
     this.setState({currentEngagement: this.state.foundServiceUsers});
  }

  render() {
    return (
      <div style={{textAlign:'center'}}>
        <AddressSearchWithData />
        <br/>
        <form>
          <Dropdown onChange={this.changeSelectedService} placeholder="Select Your Service" fluid selection options={this.state.serviceTypes} style={{width: 600}}>
          </Dropdown>
        </form>
        <br/>
        <div className="google-maps" ref="map" style={{width: 'absolute', height: 600}}></div>
        <br/>
        <br/>
        <br/>
        <ServiceProviderList fetchRemainingServiceUsers={this.fetchRemainingServiceUsers} users={this.state.foundServiceUsers}/>
      </div>
    );
  }

}

ServiceMap.propTypes = {
  google: PropTypes.object,
  zoom: PropTypes.number,
  initialCenter: PropTypes.object
}

ServiceMap.defaultProps = {
  zoom: 12,
  initialCenter: {
    lat: 34.061811,
    long: -118.318316
  }
}

export default ServiceMap;

// When we have more services
// fluid search selection options={ServiceOptions}