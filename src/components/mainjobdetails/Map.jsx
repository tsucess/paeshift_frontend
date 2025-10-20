import React, { useState, useEffect } from "react";
import "./Jobdetails.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faChevronLeft, 
  faPhone, 
  faBars, 
  faLocationDot,
  faDirections
} from "@fortawesome/free-solid-svg-icons";
import { faBookmark } from "@fortawesome/free-regular-svg-icons";
import GoogleMapReact from "google-map-react";
import Stars from "../../assets/images/stars.png";
import Axios from "axios";
import ProfileImage from "../../assets/images/profile.png";
import { getApiUrl } from "../../config.js";
import { useParams } from "react-router";
import getCurrentUser from "../../auth/getCurrentUser";
import { Modal, Button } from 'react-bootstrap';
// Marker Component for Google Map
const Marker = ({ text, isUser = false }) => ( 
  <div style={{
    color: 'white',
    background: isUser ? '#1976D2' : '#FF5722',
    padding: '8px 16px',
    borderRadius: '20px',
    display: 'inline-flex',
    textAlign: 'center',
    alignItems: 'center',
    transform: 'translate(-50%, -50%)',
    fontWeight: 'bold'
  }}>
    <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: '5px' }} />
    {text}
  </div>
);

const Map = () => {
  const { id: jobId } = useParams();
  const [profile, setProfile] = useState(null);
  const [directions, setDirections] = useState(null);
  const [jobDetails, setJobDetails] = useState({
    latitude: null,
    longitude: null
  });
  const [userLocation, setUserLocation] = useState({
    lat: 6.5244,  // Lagos coordinates
    lng: 3.3792
  });
  const [userLocationName, setUserLocationName] = useState("Your Location");
  const [map, setMap] = useState(null);
  const [maps, setMaps] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [marker, setMarker] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingLocationUpdate, setPendingLocationUpdate] = useState(null);

  // Add this function to save location changes to the backend
  const saveLocationToBackend = async (newPosition, address) => {
    try {
      const response = await Axios.post(
        getApiUrl(`/jobs/${jobId}/location/update/`),
        {
          latitude: newPosition.lat,
          longitude: newPosition.lng,
          location: address
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Location updated successfully:', response.data);
      return true;
    } catch (error) {
      console.error('Error updating location:', error);
      if (error.response?.status === 403) {
        alert('You do not have permission to update job location. Only clients can update job locations.');
      }
      return false;
    }
  };

  

  // Handle location update confirmation
  const handleLocationUpdateConfirm = async () => {
    if (pendingLocationUpdate) {
      const { newPosition, address } = pendingLocationUpdate;
      const success = await saveLocationToBackend(newPosition, address);
      if (success) {
        setJobDetails(prev => ({
          ...prev,
          latitude: newPosition.lat,
          longitude: newPosition.lng,
          location: address
        }));
        updateDirections(newPosition);
      }
      setShowConfirmModal(false);
      setPendingLocationUpdate(null);
    }
  };

  // Update the handleApiLoaded function to include confirmation dialog
  const handleApiLoaded = ({ map, maps }) => {
    setMap(map);
    setMaps(maps);
    
    // Create and configure the directions renderer
    const renderer = new maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#4285F4",
        strokeOpacity: 1,
        strokeWeight: 4
      }
    });
    
    setDirectionsRenderer(renderer);

    // Create a draggable marker for the job location
    if (jobDetails.latitude && jobDetails.longitude) {
      const jobMarker = new maps.Marker({
        position: { lat: jobDetails.latitude, lng: jobDetails.longitude },
        map: map,
        draggable: true, // Allow all users to drag the marker

        // draggable: user?.role === 'client', // Only allow dragging if user is a client
        title: "Job Location"
      });

      // Add drag event listeners
      jobMarker.addListener('dragend', (event) => {
        const newPosition = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        
        // Get address from new coordinates
        const geocoder = new maps.Geocoder();
        geocoder.geocode({ location: newPosition }, (results, status) => {
          if (status === "OK" && results[0]) {
            const address = results[0].formatted_address;
            
            // Show confirmation dialog
            setPendingLocationUpdate({ newPosition, address });
            setShowConfirmModal(true);
          }
        });
      });

      setMarker(jobMarker);
    }
    
    // Only calculate route if we have valid coordinates
    if (jobDetails.latitude && jobDetails.longitude && userLocation.lat && userLocation.lng) {
      updateDirections({ lat: jobDetails.latitude, lng: jobDetails.longitude });
    }
  };

  const updateDirections = (destination) => {
    if (maps && map && directionsRenderer && userLocation.lat && userLocation.lng) {
      const directionsService = new maps.DirectionsService();
      directionsService.route(
        {
          origin: userLocation,
          destination: destination,
          travelMode: maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") {
            setDirections(result);
            directionsRenderer.setDirections(result);
            setShowDirections(true);
          } else {
            console.error("Error fetching directions", status);
          }
        }
      );
    }
  };

  // Update route when location changes
  useEffect(() => {
    if (jobDetails.latitude && jobDetails.longitude) {
      updateDirections({ lat: jobDetails.latitude, lng: jobDetails.longitude });
    }
  }, [userLocation, jobDetails.latitude, jobDetails.longitude]);

  // Fetch job and user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user data without setting profile
        const user = await getCurrentUser();
        if (user) {
          setProfile(user);
        }

        // Log the jobId to verify we have it
        // console.log('Job ID:', jobId);
        
        // Make sure we're using the correct jobId format
        const jobIdToUse = typeof jobId === 'object' ? jobId.id : jobId;
        
        // Remove trailing slash from URL
        const response = await Axios.get(getApiUrl(`/jobs/${jobIdToUse}`));
        
        // Check if we have valid coordinates in the response
        const jobData = response.data;
        
        if (jobData && 
            (jobData.latitude !== undefined && jobData.latitude !== null) && 
            (jobData.longitude !== undefined && jobData.longitude !== null)) {
          
          const lat = parseFloat(jobData.latitude);
          const lng = parseFloat(jobData.longitude);
        
          
          if (!isNaN(lat) && !isNaN(lng)) {
            setJobDetails({
              ...jobData,
              latitude: lat,
              longitude: lng
            });
          } else {
            console.error("Coordinates are not valid numbers:", { lat, lng });
            setJobDetails({
              ...jobData,
              latitude: null,
              longitude: null
            });
          }
        } else {
          console.error("Job location coordinates not found in response:", {
            latitude: jobData?.latitude,
            longitude: jobData?.longitude
          });
          setJobDetails({
            ...jobData,
            latitude: null,
            longitude: null
          });
        }

      } catch (error) {
        console.error("Error fetching job details:", error);
        if (error.response) {
          console.error("Error response:", error.response.data);
          console.error("Error status:", error.response.status);
        }
        setJobDetails({
          latitude: null,
          longitude: null
        });
      }
    };
    fetchData();
  }, [jobId]);

  // Get user's location name using Geocoding
  const getUserLocationName = async (lat, lng) => {
    if (maps && map) {
      const geocoder = new maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          // Extract city or area name from the address components
          const addressComponents = results[0].address_components;
          const cityComponent = addressComponents.find(component => 
            component.types.includes("locality") || 
            component.types.includes("administrative_area_level_2")
          );
          
          if (cityComponent) {
            setUserLocationName(cityComponent.long_name);
          } else {
            // Fallback to the first part of the formatted address
            const addressParts = results[0].formatted_address.split(",");
            setUserLocationName(addressParts[0].trim());
          }
        } else {
          console.error("Geocoding error:", status);
          setUserLocationName("Your Location");
        }
      });
    }
  };

  // Track user location
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      pos => {
        const newLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setUserLocation(newLocation);
        getUserLocationName(newLocation.lat, newLocation.lng);
      },
      err => {
        console.error("Geolocation error:", err);
        // Keep Lagos as default location if geolocation fails
        setUserLocation({
          lat: 3.5244,
          lng: 9.3792
        });
        setUserLocationName("Your Location");
      },
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, maps]);

  // Calculate center point between locations
  const getMapCenter = () => {
    return {
      lat: (userLocation.lat + jobDetails.latitude) / 2,
      lng: (userLocation.lng + jobDetails.longitude) / 2
    };
  };

  // Calculate distance between points (in km)
  const calculateDistance = () => {
    const R = 6371;
    const dLat = (jobDetails.latitude - userLocation.lat) * Math.PI / 180;
    const dLon = (jobDetails.longitude - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * 
      Math.cos(jobDetails.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className="row m-0 p-0 map_wrapper">
      {jobDetails.latitude && jobDetails.longitude && userLocation.lat && userLocation.lng ? (
        <div className="col-12 m-0 p-0" style={{ height: '500px', width: '100%', position: 'relative' }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: "AIzaSyCiCDANDMScIcsm-d0QMDaAXFS8M-0GdLU" }}
            center={getMapCenter()}
            defaultZoom={8}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={handleApiLoaded}
          >
            <Marker 
              lat={userLocation.lat} 
              lng={userLocation.lng} 
              text={`You (${userLocationName})`} 
              isUser={true} 
            />
          </GoogleMapReact>
          
          <div className="mt-2 text-center">
            <strong>Distance: {calculateDistance().toFixed(2)} km</strong>
          </div>

          {showDirections && directions && (
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'white',
              padding: '15px',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              maxWidth: '300px',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              <h4 style={{ marginBottom: '10px' }}>
                <FontAwesomeIcon icon={faDirections} style={{ marginRight: '8px' }} />
                Directions from {userLocationName} to {jobDetails.location || "Job Location"}
              </h4>
              {directions.routes[0].legs[0].steps.map((step, index) => (
                <div key={index} style={{ marginBottom: '10px', padding: '8px', borderBottom: '1px solid #eee' }}>
                  <div dangerouslySetInnerHTML={{ __html: step.instructions }} />
                  <small style={{ color: '#666' }}>{step.distance.text}</small>
                </div>
              ))}
            </div>
          )}

          {/* Confirmation Modal */}
          <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Location Update</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to update the job location? 
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleLocationUpdateConfirm}>
                Confirm Update
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      ) : (
        <div className="col-12 text-center p-4">
          <h4>Location Information Unavailable</h4>
          <p>
            {!jobDetails.latitude || !jobDetails.longitude 
              ? "Job location coordinates are not available."
              : "Your current location could not be determined. Please enable location services."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Map;

