import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MapDisplay from './components/MapDisplay';
import { fetchDisasterData, fetchEventDetails } from './services/geminiService';
import { DisasterEvent, SearchState, Coordinates, ViewMode } from './types';
import { Menu, Map as MapIcon, X } from 'lucide-react';

export default function App() {
  const [localEvents, setLocalEvents] = useState<DisasterEvent[]>([]);
  const [globalEvents, setGlobalEvents] = useState<DisasterEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'LOCAL' | 'GLOBAL'>('LOCAL');
  
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  
  // Map State
  const [searchFocus, setSearchFocus] = useState<Coordinates | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(5);
  
  // Metadata
  const [userRegionName, setUserRegionName] = useState<string>("");
  const [lastSearchQuery, setLastSearchQuery] = useState<string>("");
  
  const [viewMode, setViewMode] = useState<ViewMode>('MAP'); 
  const [searchState, setSearchState] = useState<SearchState>({
    isSearching: false,
    lastUpdated: null,
    error: null
  });

  // Get User Location & Initial Global Data on Mount
  useEffect(() => {
    // 1. Fetch Global Events
    const loadGlobal = async () => {
        try {
            const globalRes = await fetchDisasterData("Major natural disasters globally");
            setGlobalEvents(globalRes.events);
        } catch (e) {
            console.error("Failed to load global events", e);
        }
    };
    loadGlobal();

    // 2. Get Location for Local Search
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          handleSearch(`lat:${latitude}, lng:${longitude}`);
        },
        (error) => {
          console.warn("Location permission denied", error);
          handleSearch("Global"); 
        }
      );
    } else {
      handleSearch("Global");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(async (region: string) => {
    setSearchState(prev => ({ ...prev, isSearching: true, error: null }));
    setSelectedEventId(null);
    setLastSearchQuery(region);
    
    // Switch to local tab on new search
    setActiveTab('LOCAL');
    
    try {
      const isCoord = region.includes('lat:');
      
      const response = await fetchDisasterData(region);
      
      setLocalEvents(response.events);
      setSearchFocus(response.searchCenter);
      setZoomLevel(response.zoomLevel);

      setSearchState({
        isSearching: false,
        lastUpdated: new Date(),
        error: null
      });

      if (!isCoord) {
          setUserRegionName(region);
      } else {
          setUserRegionName("Your Location");
      }

    } catch (err) {
      console.error(err);
      setSearchState(prev => ({ 
        ...prev, 
        isSearching: false, 
        error: "Unable to complete analysis. Please try a different region." 
      }));
    }
  }, []);

  const handleRefreshCurrent = async () => {
      if (activeTab === 'LOCAL') {
          if (lastSearchQuery) {
              await handleSearch(lastSearchQuery);
          }
      } else {
          setSearchState(prev => ({ ...prev, isSearching: true, error: null }));
          try {
              const globalRes = await fetchDisasterData("Major natural disasters globally");
              setGlobalEvents(globalRes.events);
              setSearchState({
                  isSearching: false,
                  lastUpdated: new Date(),
                  error: null
              });
          } catch (e) {
              setSearchState(prev => ({ ...prev, isSearching: false, error: "Failed to refresh global feed." }));
          }
      }
  };

  const handleUpdateEventDetails = async (eventId: string) => {
      const targetList = activeTab === 'LOCAL' ? localEvents : globalEvents;
      const setTargetList = activeTab === 'LOCAL' ? setLocalEvents : setGlobalEvents;

      const eventToUpdate = targetList.find(e => e.id === eventId);
      if (!eventToUpdate) return;

      try {
          const details = await fetchEventDetails(eventToUpdate);
          setTargetList(prev => prev.map(e => {
              if (e.id === eventId) {
                  return { ...e, detailedStatus: details };
              }
              return e;
          }));
      } catch (error) {
          console.error("Failed to update event details", error);
      }
  };

  const handleEventSelect = (event: DisasterEvent) => {
    setSelectedEventId(event.id);
    if (window.innerWidth < 768) {
        setViewMode('MAP'); 
    }
  };

  // Determine which events to show
  const displayedEvents = activeTab === 'LOCAL' ? localEvents : globalEvents;
  
  // Determine map center
  // If Local tab -> use searchFocus
  // If Global tab -> default center (or maybe a global view center)
  const mapCenter = activeTab === 'LOCAL' ? searchFocus : { lat: 20, lng: 0 };
  const mapZoom = activeTab === 'LOCAL' ? zoomLevel : 2;

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-gray-950 overflow-hidden">
      
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-[1000]">
          <button 
            onClick={() => setViewMode(prev => prev === 'MAP' ? 'LIST' : 'MAP')}
            className="bg-red-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:bg-red-700 transition-colors"
          >
             {viewMode === 'MAP' ? <Menu size={24} /> : <MapIcon size={24} />}
          </button>
      </div>

      {/* Sidebar */}
      <div className={`
        ${viewMode === 'LIST' ? 'flex' : 'hidden'} 
        md:flex flex-col h-full w-full md:w-[400px] md:relative absolute z-20
      `}>
          {viewMode === 'LIST' && (
              <button 
                onClick={() => setViewMode('MAP')}
                className="md:hidden absolute top-4 right-4 z-50 p-2 bg-gray-800 text-white rounded-full"
              >
                  <X size={20} />
              </button>
          )}
        <Sidebar 
          events={displayedEvents}
          selectedEventId={selectedEventId}
          onEventSelect={handleEventSelect}
          searchState={searchState}
          onSearch={handleSearch}
          userLocationName={activeTab === 'LOCAL' ? userRegionName : "Global Watch"}
          onEventRefresh={handleUpdateEventDetails}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onRefreshFeed={handleRefreshCurrent}
        />
      </div>

      {/* Map Area */}
      <div className="flex-1 h-full relative">
        <MapDisplay 
          events={displayedEvents}
          selectedEventId={selectedEventId}
          onEventSelect={handleEventSelect}
          userLocation={userLocation}
          searchFocus={mapCenter}
          zoomLevel={mapZoom}
        />
        
        {/* Overlay Gradients */}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] z-[400]" />
      </div>

    </div>
  );
}