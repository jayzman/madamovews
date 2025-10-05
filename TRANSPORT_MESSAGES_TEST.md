# Transport Messages API Test

## Test the transport message endpoints

### Prerequisites
- Make sure the application is running with `npm run start:dev`
- Have at least one transport with ID 1 in your database
- Have at least one client with ID 1 and one chauffeur with ID 1

### Test 1: Create a message for a transport
```bash
curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -d '{
    "contenu": "Test message pour le transport",
    "transportId": 1,
    "clientId": 1,
    "chauffeurId": 1,
    "expediteurType": "CLIENT"
  }'
```

### Test 2: Get transport messages
```bash
curl -X GET "http://localhost:3000/messages/conversation/transport/1"
```

### Test 3: Get client conversations (including transports)
```bash
curl -X GET "http://localhost:3000/messages/client/1/conversations"
```

### Test 4: Get chauffeur conversations (including transports)
```bash
curl -X GET "http://localhost:3000/messages/chauffeur/1/conversations"
```

### Test 5: Get unread count for client (including transport messages)
```bash
curl -X GET "http://localhost:3000/messages/client/1/unread"
```

### Test 6: Get unread count for chauffeur (including transport messages)
```bash
curl -X GET "http://localhost:3000/messages/chauffeur/1/unread"
```

## Expected Results

1. **Create message**: Should return the created message with transport information
2. **Get transport messages**: Should return all messages for the transport
3. **Get client conversations**: Should return transport conversations for the client
4. **Get chauffeur conversations**: Should return transport conversations for the chauffeur  
5. **Get unread counts**: Should return the count of unread messages including transport messages

## Validation Steps

1. ✅ Message creation works with transportId
2. ✅ Transport message retrieval works
3. ✅ Client can see transport conversations
4. ✅ Chauffeur can see transport conversations
5. ✅ Unread count includes transport messages
6. ✅ Access validation works (client/chauffeur must be associated with transport)

## API Endpoints Added/Modified

- `POST /messages` - Now supports `transportId` field
- `GET /messages/conversation/transport/:transportId` - New endpoint for transport messages
- `GET /messages/client/:clientId/conversations` - Now includes transport conversations
- `GET /messages/chauffeur/:chauffeurId/conversations` - Now includes transport conversations
- `GET /messages/client/:clientId/unread` - Now includes transport messages
- `GET /messages/chauffeur/:chauffeurId/unread` - Now includes transport messages
