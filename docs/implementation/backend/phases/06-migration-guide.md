# Backend Migration Guide

## Overview
This guide outlines the process of migrating from Next.js API routes to the new FastAPI backend while ensuring zero downtime and maintaining system stability.

## Current Architecture

### Next.js API Routes
```typescript
// Current structure in src/pages/api/
├── getAnalysis.ts
├── process-results.ts
├── process-updates.ts
├── saveInsights.ts
├── socketio.ts
├── start-analysis.ts
└── openai.ts
```

### Services
```typescript
// Current services in src/services/
├── aiAnalysisService.ts
├── analysisService.ts
├── perplexityService.ts
├── reportService.ts
└── templateService.ts
```

## Migration Strategy

### 1. Parallel Running
Run both Next.js and FastAPI backends simultaneously during migration:

```typescript
// Update Next.js API routes to proxy requests
// src/pages/api/[...all].ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const backendUrl = process.env.BACKEND_URL;
    
    // Check if new backend should handle request
    if (shouldUseNewBackend(req.url)) {
        try {
            const response = await fetch(`${backendUrl}${req.url}`, {
                method: req.method,
                headers: req.headers as HeadersInit,
                body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
            });
            
            const data = await response.json();
            res.status(response.status).json(data);
        } catch (error) {
            // Fallback to old implementation
            return handleLegacyRequest(req, res);
        }
    } else {
        return handleLegacyRequest(req, res);
    }
}
```

### 2. Feature Flag System
Implement feature flags to control migration:

```python
# app/core/features.py
class FeatureFlags:
    def __init__(self):
        self.redis = Redis.from_url(settings.REDIS_URL)
    
    async def is_enabled(
        self,
        feature: str,
        default: bool = False
    ) -> bool:
        """
        Check if feature is enabled
        """
        try:
            value = await self.redis.get(f"feature:{feature}")
            return value.decode() == "true" if value else default
        except Exception:
            return default
```

### 3. Data Migration
Implement data migration scripts:

```python
# app/migration/data.py
class DataMigration:
    def __init__(self):
        self.old_db = OldDatabase()
        self.new_db = NewDatabase()
    
    async def migrate_analysis_data(self):
        """
        Migrate analysis data
        """
        try:
            # 1. Get old data
            old_records = await self.old_db.get_all_analyses()
            
            # 2. Transform data
            new_records = [
                self._transform_analysis(record)
                for record in old_records
            ]
            
            # 3. Insert into new database
            await self.new_db.bulk_insert_analyses(new_records)
            
            # 4. Verify migration
            await self._verify_migration(old_records, new_records)
        except Exception as e:
            await self._handle_migration_error(e)
```

### 4. WebSocket Migration
Implement WebSocket migration strategy:

```python
# app/migration/websocket.py
class WebSocketMigration:
    def __init__(self):
        self.old_manager = OldSocketManager()
        self.new_manager = NewSocketManager()
    
    async def handle_connection(
        self,
        websocket: WebSocket,
        client_id: str
    ):
        """
        Handle WebSocket connection with fallback
        """
        try:
            # Try new WebSocket handler
            if await feature_flags.is_enabled("new_websocket"):
                await self.new_manager.handle(websocket, client_id)
            else:
                await self.old_manager.handle(websocket, client_id)
        except Exception:
            # Fallback to old handler
            await self.old_manager.handle(websocket, client_id)
```

### 5. Testing Strategy

```python
# app/tests/migration/test_migration.py
class TestMigration:
    async def test_data_consistency(self):
        """
        Test data consistency between old and new systems
        """
        # 1. Insert test data in old system
        old_data = await self.create_test_data_old()
        
        # 2. Run migration
        await data_migration.migrate_analysis_data()
        
        # 3. Verify data in new system
        new_data = await self.get_test_data_new()
        assert self.compare_data(old_data, new_data)
    
    async def test_request_handling(self):
        """
        Test request handling with feature flags
        """
        # Test with old system
        await feature_flags.disable("new_backend")
        old_response = await self.make_test_request()
        
        # Test with new system
        await feature_flags.enable("new_backend")
        new_response = await self.make_test_request()
        
        assert old_response == new_response
```

### 6. Rollback Plan

```python
# app/migration/rollback.py
class RollbackManager:
    async def rollback_if_needed(
        self,
        feature: str,
        error_threshold: float = 0.05
    ):
        """
        Automatically rollback if error rate exceeds threshold
        """
        try:
            # Check error rate
            error_rate = await self.get_error_rate(feature)
            
            if error_rate > error_threshold:
                # Disable feature
                await feature_flags.disable(feature)
                
                # Notify team
                await self.notify_rollback(feature, error_rate)
                
                # Log rollback
                await self.log_rollback(feature, error_rate)
        except Exception as e:
            logger.error(f"Rollback check failed: {str(e)}")
```

## Migration Phases

### Phase 1: Infrastructure Setup
1. Set up FastAPI backend
2. Configure databases
3. Implement feature flags
4. Set up monitoring

### Phase 2: Data Migration
1. Create migration scripts
2. Test data consistency
3. Run initial migration
4. Verify data integrity

### Phase 3: API Migration
1. Implement new endpoints
2. Set up request proxying
3. Enable feature flags
4. Monitor performance

### Phase 4: WebSocket Migration
1. Implement new WebSocket handlers
2. Set up connection management
3. Test real-time updates
4. Monitor connections

### Phase 5: Cleanup
1. Verify all systems
2. Remove old endpoints
3. Clean up legacy code
4. Update documentation

## Success Criteria

1. Zero downtime during migration
2. Data consistency maintained
3. All features working correctly
4. Performance metrics stable
5. Monitoring showing no issues
6. Rollback plan tested

## Rollback Procedure

1. **Immediate Rollback**
   - Disable feature flags
   - Route all traffic to old system
   - Notify team

2. **Gradual Rollback**
   - Gradually reduce traffic to new system
   - Monitor error rates
   - Verify system stability

3. **Data Rollback**
   - Verify data consistency
   - Restore from backups if needed
   - Validate restored data

## Monitoring During Migration

1. **Key Metrics**
   - Error rates
   - Response times
   - System resources
   - Data consistency

2. **Alerts**
   - Error rate spikes
   - Performance degradation
   - System resource issues
   - Data inconsistencies

This migration guide ensures a smooth transition while maintaining system stability and providing fallback options if needed.
