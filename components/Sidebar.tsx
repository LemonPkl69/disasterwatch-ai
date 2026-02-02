import React, { useState } from 'react';
import { DisasterEvent, SearchState } from '../types';
import { DISASTER_ICONS, DISASTER_COLORS, SEVERITY_ICONS, SEVERITY_COLORS } from '../constants';
import { Search, MapPin, ExternalLink, AlertOctagon, RefreshCw, Filter, Globe, FileText, Sparkles, Radio } from 'lucide-react';

interface SidebarProps {
  events: DisasterEvent[];
  selectedEventId: string | null;
  onEventSelect: (event: DisasterEvent) => void;
  searchState: SearchState;
  onSearch: (region: string) => void;
  userLocationName: string;
  onEventRefresh: (eventId: string) => Promise<void>;
  activeTab: 'LOCAL' | 'GLOBAL';
  setActiveTab: (tab: 'LOCAL' | 'GLOBAL') => void;
  onRefreshFeed: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  events, 
  selectedEventId, 
  onEventSelect, 
  searchState, 
  onSearch,
  userLocationName,
  onEventRefresh,
  activeTab,
  setActiveTab,
  onRefreshFeed
}) => {
  const [searchInput, setSearchInput] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);
  const [loadingDetailsId, setLoadingDetailsId] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
        onSearch(searchInput);
        setSearchInput(''); // Clear input after search to show title
    }
  };

  const handleDetailedRefresh = async (e: React.MouseEvent, eventId: string) => {
      e.stopPropagation();
      setLoadingDetailsId(eventId);
      await onEventRefresh(eventId);
      setLoadingDetailsId(null);
  };

  const filteredEvents = activeFilter 
    ? events.filter(e => e.type === activeFilter) 
    : events;

  const eventTypes = Array.from(new Set(events.map(e => e.type)));

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800 text-gray-100 w-full md:w-[400px] shadow-xl z-10">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <AlertOctagon className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              DisasterWatch AI
            </h1>
            <p className="text-xs text-gray-500">Real-time Verified Alerts</p>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative mb-3">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search city, state, or country..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all placeholder-gray-500"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <button 
             type="submit"
             disabled={searchState.isSearching || !searchInput.trim()}
             className="absolute right-2 top-1.5 p-1.5 hover:bg-gray-700 rounded transition-colors disabled:opacity-50 text-gray-400"
          >
             <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-gray-800/50 rounded-lg">
            <button
                onClick={() => setActiveTab('LOCAL')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === 'LOCAL' 
                    ? 'bg-gray-700 text-white shadow' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
            >
                Local Search
            </button>
            <button
                onClick={() => setActiveTab('GLOBAL')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === 'GLOBAL' 
                    ? 'bg-gray-700 text-white shadow' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
            >
                Global Watch
            </button>
        </div>
      </div>

      {/* Stats/Status & Refresh */}
      <div className="bg-gray-800/50 px-4 py-2 flex justify-between items-center border-b border-gray-800">
          <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-300">
                 {activeTab === 'LOCAL' ? (userLocationName || 'Local Region') : 'Global Calamities'}
              </span>
              <span className="text-[10px] text-gray-500">
                  {searchState.isSearching ? 'Scanning...' : searchState.lastUpdated ? `Updated ${searchState.lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Waiting for scan'}
              </span>
          </div>
          <button 
            onClick={onRefreshFeed}
            disabled={searchState.isSearching}
            className="p-1.5 hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50 group"
            title="Refresh List"
          >
             <RefreshCw className={`w-4 h-4 text-gray-400 group-hover:text-blue-400 ${searchState.isSearching ? 'animate-spin text-blue-400' : ''}`} />
          </button>
      </div>

      {/* Filters (only show if we have events) */}
      {events.length > 0 && (
          <div className="px-4 py-2 border-b border-gray-800 flex gap-2 overflow-x-auto no-scrollbar">
              <button
                  onClick={() => setActiveFilter(null)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors whitespace-nowrap ${
                      !activeFilter 
                      ? 'bg-gray-100 text-gray-900 border-gray-100' 
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
              >
                  All
              </button>
              {eventTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveFilter(type === activeFilter ? null : type)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors whitespace-nowrap flex items-center gap-1 ${
                        type === activeFilter
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                      {type}
                  </button>
              ))}
          </div>
      )}

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {searchState.error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg m-2 text-red-400 text-sm text-center">
                {searchState.error}
            </div>
        )}

        {filteredEvents.length === 0 && !searchState.isSearching && !searchState.error && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-sm p-4 text-center">
                <div className="bg-gray-800/50 p-3 rounded-full mb-3">
                    <Filter className="w-6 h-6 opacity-50" />
                </div>
                <p className="font-medium text-gray-300">No active disasters detected</p>
                <p className="text-xs text-gray-500 mt-1">
                    {activeTab === 'LOCAL' 
                        ? "No confirmed reports in this area recently." 
                        : "No major global events reported right now (which is good news!)."}
                </p>
                {activeTab === 'LOCAL' && (
                    <button onClick={() => setActiveTab('GLOBAL')} className="mt-4 text-blue-400 hover:text-blue-300 text-xs border border-blue-500/30 px-3 py-1.5 rounded-full transition-colors">
                        View Global Alerts
                    </button>
                )}
            </div>
        )}

        {searchState.isSearching && filteredEvents.length === 0 && (
             <div className="space-y-3 p-2">
                 {[1,2,3].map(i => (
                     <div key={i} className="h-24 bg-gray-800/50 rounded-lg animate-pulse"></div>
                 ))}
             </div>
        )}

        {filteredEvents.map((event) => {
          const Icon = DISASTER_ICONS[event.type];
          const color = DISASTER_COLORS[event.type];
          const isSelected = selectedEventId === event.id;
          const isLoadingDetails = loadingDetailsId === event.id;
          
          const SeverityIcon = SEVERITY_ICONS[event.severity] || SEVERITY_ICONS['LOW'];
          const severityColor = SEVERITY_COLORS[event.severity];

          return (
            <div
              key={event.id}
              onClick={() => onEventSelect(event)}
              className={`
                group relative p-4 rounded-xl border cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'bg-gray-800 border-gray-600 shadow-lg translate-x-1' 
                  : 'bg-gray-900 hover:bg-gray-800 border-gray-800 hover:border-gray-700'}
              `}
            >
              {/* Severity Strip */}
              <div 
                className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                    event.severity === 'CRITICAL' ? 'animate-pulse' : ''
                }`}
                style={{ backgroundColor: severityColor }}
              />

              <div className="flex justify-between items-start mb-2 pl-2">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-gray-800" style={{ color: color }}>
                        <Icon size={16} />
                    </div>
                    <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                        {event.type}
                    </span>
                </div>
                
                {/* Severity Badge with Icon */}
                <div 
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border shadow-sm"
                    style={{ 
                        backgroundColor: `${severityColor}15`, 
                        borderColor: `${severityColor}30` 
                    }}
                >
                    <SeverityIcon size={14} color={severityColor} />
                    <span className="text-[10px] font-bold" style={{ color: severityColor }}>
                        {event.severity}
                    </span>
                </div>
              </div>

              <div className="pl-2">
                <h3 className="font-semibold text-gray-200 mb-1 leading-tight group-hover:text-blue-400 transition-colors">
                    {event.title}
                </h3>
                
                <p className="text-sm text-gray-400 line-clamp-3 mb-3">
                    {event.description}
                </p>

                {/* Detailed Status Section */}
                {isSelected && event.detailedStatus && (
                    <div className="mb-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                        <div className="flex items-center gap-2 mb-2 text-blue-300 text-xs font-semibold">
                            <Sparkles size={12} />
                            <span>AI Situation Report</span>
                        </div>
                        <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {event.detailedStatus}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-800 pt-2 mt-2">
                    <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        <span className="truncate max-w-[120px]">{event.locationName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                         {event.sourceUrl && (
                             <a 
                                href={event.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-gray-500 hover:text-white flex items-center gap-1"
                                title="Source"
                             >
                                 <Globe size={12} />
                                 <span>Source</span>
                             </a>
                        )}
                    </div>
                </div>

                {/* Refresh/Details Button - Only visible when selected */}
                {isSelected && (
                    <button
                        onClick={(e) => handleDetailedRefresh(e, event.id)}
                        disabled={isLoadingDetails}
                        className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-medium text-blue-300 transition-colors"
                    >
                        {isLoadingDetails ? (
                            <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span>Generating Report...</span>
                            </>
                        ) : (
                            <>
                                <FileText className="w-3 h-3" />
                                <span>{event.detailedStatus ? 'Refresh Full Report' : 'Generate Full Report'}</span>
                            </>
                        )}
                    </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;