# Transport Messages API Test Script
# Run this script to test the transport message functionality

Write-Host "=== Testing Transport Messages API ===" -ForegroundColor Green

# Base URL
$baseUrl = "http://localhost:3000"

# Test data
$clientId = 1
$chauffeurId = 1
$transportId = 1

Write-Host "`n1. Testing message creation for transport..." -ForegroundColor Yellow

$createMessageBody = @{
    contenu = "Test message pour le transport depuis PowerShell"
    transportId = $transportId
    clientId = $clientId
    chauffeurId = $chauffeurId
    expediteurType = "CLIENT"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/messages" -Method POST -Body $createMessageBody -ContentType "application/json"
    Write-Host "✅ Message created successfully" -ForegroundColor Green
    Write-Host "Message ID: $($response.id)" -ForegroundColor Cyan
    Write-Host "Transport ID: $($response.transportId)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error creating message: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing transport message retrieval..." -ForegroundColor Yellow

try {
    $messages = Invoke-RestMethod -Uri "$baseUrl/messages/conversation/transport/$transportId" -Method GET
    Write-Host "✅ Transport messages retrieved successfully" -ForegroundColor Green
    Write-Host "Total messages: $($messages.meta.total)" -ForegroundColor Cyan
    Write-Host "Messages count: $($messages.items.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error retrieving transport messages: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Testing client conversations (including transports)..." -ForegroundColor Yellow

try {
    $clientConversations = Invoke-RestMethod -Uri "$baseUrl/messages/client/$clientId/conversations" -Method GET
    Write-Host "✅ Client conversations retrieved successfully" -ForegroundColor Green
    Write-Host "Transport conversations: $($clientConversations.transports.Count)" -ForegroundColor Cyan
    
    if ($clientConversations.transports.Count -gt 0) {
        Write-Host "First transport conversation:" -ForegroundColor Cyan
        Write-Host "  - ID: $($clientConversations.transports[0].id)" -ForegroundColor Cyan
        Write-Host "  - Trajet: $($clientConversations.transports[0].trajet)" -ForegroundColor Cyan
        Write-Host "  - Status: $($clientConversations.transports[0].status)" -ForegroundColor Cyan
        Write-Host "  - Message count: $($clientConversations.transports[0].messageCount)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Error retrieving client conversations: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. Testing chauffeur conversations (including transports)..." -ForegroundColor Yellow

try {
    $chauffeurConversations = Invoke-RestMethod -Uri "$baseUrl/messages/chauffeur/$chauffeurId/conversations" -Method GET
    Write-Host "✅ Chauffeur conversations retrieved successfully" -ForegroundColor Green
    Write-Host "Transport conversations: $($chauffeurConversations.transports.Count)" -ForegroundColor Cyan
    
    if ($chauffeurConversations.transports.Count -gt 0) {
        Write-Host "First transport conversation:" -ForegroundColor Cyan
        Write-Host "  - ID: $($chauffeurConversations.transports[0].id)" -ForegroundColor Cyan
        Write-Host "  - Trajet: $($chauffeurConversations.transports[0].trajet)" -ForegroundColor Cyan
        Write-Host "  - Status: $($chauffeurConversations.transports[0].status)" -ForegroundColor Cyan
        Write-Host "  - Message count: $($chauffeurConversations.transports[0].messageCount)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Error retrieving chauffeur conversations: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n5. Testing client unread count (including transport messages)..." -ForegroundColor Yellow

try {
    $clientUnread = Invoke-RestMethod -Uri "$baseUrl/messages/client/$clientId/unread" -Method GET
    Write-Host "✅ Client unread count retrieved successfully" -ForegroundColor Green
    Write-Host "Unread messages count: $($clientUnread.count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error retrieving client unread count: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n6. Testing chauffeur unread count (including transport messages)..." -ForegroundColor Yellow

try {
    $chauffeurUnread = Invoke-RestMethod -Uri "$baseUrl/messages/chauffeur/$chauffeurId/unread" -Method GET
    Write-Host "✅ Chauffeur unread count retrieved successfully" -ForegroundColor Green
    Write-Host "Unread messages count: $($chauffeurUnread.count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error retrieving chauffeur unread count: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Transport Messages API Test Complete ===" -ForegroundColor Green
Write-Host "Check the results above to verify the transport message functionality is working correctly." -ForegroundColor Cyan
