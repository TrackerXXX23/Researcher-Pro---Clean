# Changelog

## [Unreleased]

### Fixed
- WebSocket connection issues resolved:
  - Fixed 403 Forbidden errors by properly handling analysis-specific WebSocket connections
  - Implemented robust ConnectionManager for handling WebSocket connections per analysis
  - Added proper broadcast functionality for analysis updates
  - Updated frontend services to use correct WebSocket port
  - Added comprehensive WebSocket testing script

### Added
- New WebSocket features:
  - Analysis-specific WebSocket connections at `/ws/{analysis_id}`
  - Real-time update broadcasting to connected clients
  - Connection status tracking and management
  - Automatic reconnection handling
  - Improved error handling and logging

### Changed
- Updated frontend components:
  - Improved LiveUpdates component with better connection status handling
  - Enhanced useWebSocket hook with proper cleanup
  - Updated analysisService to use consistent port configuration
  - Added better error handling in StartNewAnalysis component

### Technical
- Moved WebSocket connection management to dedicated module
- Added comprehensive WebSocket testing capabilities
- Improved logging for WebSocket connections and updates
- Enhanced error handling and connection status management
