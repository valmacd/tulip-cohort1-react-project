
import React, { Component } from "react";
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps";

import { fetchLcboEndpoint, fetchLcboStoreEndpoint } from "./api/lcbo.js";

const { GOOGLE_MAPS_API_KEY } = process.env;

const MapWithAMarker = withScriptjs(withGoogleMap(props =>
  <GoogleMap
    defaultZoom={4}
    defaultCenter={{ lat: 43.6532, lng: -79.3832 }}
  >
    {/* <Marker
      position={{ lat: 43.6532, lng: -79.3832 }}
    /> */}
  </GoogleMap>
));

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      location: []
    };
  }
  componentDidMount() {
    // example of making an API request to the LCBO API
    fetchLcboEndpoint("products", {
      q: "radler"
    }).then(data => {
      console.log(data);
    });
  }

  handleSubmit = (e) => {

    e.preventDefault();
    fetchLcboEndpoint("products", {
      q: e.target.name.value

    }).then( data => {
      //console.log(data.result);
      fetchLcboEndpoint("inventories", {
        product_id: data.result.map(drinkId => drinkId.id)

      }).then(locations => {
        //console.log(locations.result);
        let recure = locations.result.map(store => {
          fetchLcboStoreEndpoint("stores/" + store.store_id

          ).then(latLong => {
            //console.log(latLong.result);
            let locationObj = {
              lat:latLong.result.latitude,
              long:latLong.result.longitude
            }
            console.log(locationObj);
            this.setState({
              location: this.state.location.concat(locationObj)
            })
          }).catch (err => {
            console.log(err);

          })
        })
      }).catch (err => {
        console.log(err);

      })
    }).catch( err => {
      console.log(err);
    })
  }

  render() {
    return (
      <div>
        <p>
          Search for alcohol:
        </p>
        <form onSubmit={this.handleSubmit}>
          <input type="text" name="name"/>
          <button>Find me Booze</button>
        </form>
        <MapWithAMarker
          googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=3.exp&libraries=geometry,drawing,places`}
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: `400px` }} />}
          mapElement={<div style={{ height: `100%` }} />}
        />
      </div>
    );
  }
}

export default App;
