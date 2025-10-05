# Script de test automatisé pour l'API Transport Real-Time
param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$ClientEmail = "client@example.com",
    [string]$ClientPassword = "password123",
    [string]$DriverEmail = "chauffeur@example.com",
    [string]$DriverPassword = "password123"
)

# Couleurs pour l'affichage
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Write-TestResult {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Color
}

function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Token = $null
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $uri = "$BaseUrl$Endpoint"
    
    try {
        $params = @{
            Uri = $uri
            Method = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        return @{
            Success = $true
            Data = $response
            StatusCode = 200
        }
    }
    catch {
        $statusCode = 0
        $errorMessage = $_.Exception.Message
        
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
        }
        
        return @{
            Success = $false
            Error = $errorMessage
            StatusCode = $statusCode
        }
    }
}

function Test-Authentication {
    Write-TestResult "=== Test d'authentification ===" $InfoColor
    
    # Test login client
    Write-TestResult "Test login client..." $InfoColor
    $clientLogin = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body @{
        email = $ClientEmail
        password = $ClientPassword
    }
    
    if ($clientLogin.Success) {
        Write-TestResult "✓ Login client réussi" $SuccessColor
        $script:ClientToken = $clientLogin.Data.access_token
    } else {
        Write-TestResult "✗ Échec login client: $($clientLogin.Error)" $ErrorColor
        return $false
    }
    
    # Test login chauffeur
    Write-TestResult "Test login chauffeur..." $InfoColor
    $driverLogin = Invoke-ApiRequest -Method "POST" -Endpoint "/chauffeurs/login" -Body @{
        email = $DriverEmail
        password = $DriverPassword
    }
    
    if ($driverLogin.Success) {
        Write-TestResult "✓ Login chauffeur réussi" $SuccessColor
        $script:DriverToken = $driverLogin.Data.access_token
    } else {
        Write-TestResult "✗ Échec login chauffeur: $($driverLogin.Error)" $ErrorColor
        return $false
    }
    
    return $true
}

function Test-TransportCreation {
    Write-TestResult "=== Test création de transport ===" $InfoColor
    
    $transportData = @{
        clientId = 1
        vehiculeId = 1
        adresseDepart = "123 Rue de Rivoli, Paris"
        adresseDestination = "456 Avenue des Champs-Élysées, Paris"
        departLatitude = 48.8566
        departLongitude = 2.3522
        destinationLatitude = 48.8738
        destinationLongitude = 2.2950
    }
    
    $result = Invoke-ApiRequest -Method "POST" -Endpoint "/transports" -Body $transportData -Token $script:ClientToken
    
    if ($result.Success) {
        Write-TestResult "✓ Transport créé avec ID: $($result.Data.id)" $SuccessColor
        $script:TransportId = $result.Data.id
        return $true
    } else {
        Write-TestResult "✗ Échec création transport: $($result.Error)" $ErrorColor
        return $false
    }
}

function Test-TransportValidation {
    Write-TestResult "=== Test validation transport ===" $InfoColor
    
    $result = Invoke-ApiRequest -Method "POST" -Endpoint "/transports/$script:TransportId/valider/1" -Token $script:DriverToken
    
    if ($result.Success) {
        Write-TestResult "✓ Transport validé" $SuccessColor
        return $true
    } else {
        Write-TestResult "✗ Échec validation transport: $($result.Error)" $ErrorColor
        return $false
    }
}

function Test-PositionUpdates {
    Write-TestResult "=== Test mises à jour de position ===" $InfoColor
    
    # Simuler plusieurs mises à jour de position
    $positions = @(
        @{ lat = 48.8606; lng = 2.3376; info = "Départ du garage" },
        @{ lat = 48.8586; lng = 2.3345; info = "En route vers le client" },
        @{ lat = 48.8576; lng = 2.3325; info = "Proche du point de ramassage" },
        @{ lat = 48.8566; lng = 2.3522; info = "Arrivé au point de ramassage" }
    )
    
    foreach ($pos in $positions) {
        Write-TestResult "Mise à jour position: $($pos.info)" $InfoColor
        
        $result = Invoke-ApiRequest -Method "PATCH" -Endpoint "/transports/$script:TransportId/position" -Body @{
            latitude = $pos.lat
            longitude = $pos.lng
            statusInfo = $pos.info
        } -Token $script:DriverToken
        
        if ($result.Success) {
            Write-TestResult "✓ Position mise à jour: $($pos.lat), $($pos.lng)" $SuccessColor
        } else {
            Write-TestResult "✗ Échec mise à jour position: $($result.Error)" $ErrorColor
        }
        
        # Attendre 2 secondes entre chaque mise à jour
        Start-Sleep -Seconds 2
        
        # Vérifier la position actuelle
        $currentPos = Invoke-ApiRequest -Method "GET" -Endpoint "/transports/$script:TransportId/position" -Token $script:ClientToken
        if ($currentPos.Success) {
            Write-TestResult "Position actuelle confirmée: $($currentPos.Data.position.lat), $($currentPos.Data.position.lng)" $InfoColor
        }
    }
}

function Test-StatusUpdates {
    Write-TestResult "=== Test changements de statut ===" $InfoColor
    
    $statuses = @(
        "EN_ROUTE_RAMASSAGE",
        "ARRIVE_RAMASSAGE",
        "EN_COURSE"
    )
    
    foreach ($status in $statuses) {
        Write-TestResult "Changement de statut: $status" $InfoColor
        
        $result = Invoke-ApiRequest -Method "PATCH" -Endpoint "/transports/$script:TransportId/status" -Body @{
            status = $status
        } -Token $script:DriverToken
        
        if ($result.Success) {
            Write-TestResult "✓ Statut changé vers: $status" $SuccessColor
        } else {
            Write-TestResult "✗ Échec changement statut: $($result.Error)" $ErrorColor
        }
        
        Start-Sleep -Seconds 1
    }
}

function Test-AutoTracking {
    Write-TestResult "=== Test suivi automatique ===" $InfoColor
    
    # Démarrer le suivi automatique
    Write-TestResult "Démarrage du suivi automatique..." $InfoColor
    $startResult = Invoke-ApiRequest -Method "POST" -Endpoint "/transports/$script:TransportId/tracking/start" -Token $script:DriverToken
    
    if ($startResult.Success) {
        Write-TestResult "✓ Suivi automatique démarré" $SuccessColor
    } else {
        Write-TestResult "✗ Échec démarrage suivi: $($startResult.Error)" $ErrorColor
    }
    
    # Attendre quelques secondes
    Write-TestResult "Attente de 10 secondes pour observer le suivi..." $InfoColor
    Start-Sleep -Seconds 10
    
    # Obtenir les statistiques
    $statsResult = Invoke-ApiRequest -Method "GET" -Endpoint "/transports/tracking/statistics" -Token $script:DriverToken
    
    if ($statsResult.Success) {
        Write-TestResult "✓ Statistiques de suivi récupérées" $SuccessColor
        Write-TestResult "Transports actifs: $($statsResult.Data.activeTransports)" $InfoColor
    } else {
        Write-TestResult "✗ Échec récupération statistiques: $($statsResult.Error)" $ErrorColor
    }
    
    # Arrêter le suivi automatique
    Write-TestResult "Arrêt du suivi automatique..." $InfoColor
    $stopResult = Invoke-ApiRequest -Method "POST" -Endpoint "/transports/$script:TransportId/tracking/stop" -Token $script:DriverToken
    
    if ($stopResult.Success) {
        Write-TestResult "✓ Suivi automatique arrêté" $SuccessColor
    } else {
        Write-TestResult "✗ Échec arrêt suivi: $($stopResult.Error)" $ErrorColor
    }
}

function Test-TransportCompletion {
    Write-TestResult "=== Test fin de transport ===" $InfoColor
    
    # Terminer le transport
    $result = Invoke-ApiRequest -Method "POST" -Endpoint "/transports/$script:TransportId/end" -Token $script:DriverToken
    
    if ($result.Success) {
        Write-TestResult "✓ Transport terminé" $SuccessColor
        Write-TestResult "Montant final: $($result.Data.montantFinal)€" $InfoColor
    } else {
        Write-TestResult "✗ Échec fin transport: $($result.Error)" $ErrorColor
    }
}

# Variables globales pour les tokens et transport ID
$script:ClientToken = $null
$script:DriverToken = $null
$script:TransportId = $null

# Exécution des tests
Write-TestResult "🚀 Démarrage des tests API Transport Real-Time" $InfoColor
Write-TestResult "URL de base: $BaseUrl" $InfoColor
Write-TestResult "=============================================" $InfoColor

if (Test-Authentication) {
    if (Test-TransportCreation) {
        if (Test-TransportValidation) {
            Test-PositionUpdates
            Test-StatusUpdates
            Test-AutoTracking
            Test-TransportCompletion
        }
    }
}

Write-TestResult "=============================================" $InfoColor
Write-TestResult "🏁 Tests terminés" $InfoColor

# Afficher un résumé
Write-TestResult "" $InfoColor
Write-TestResult "📊 RÉSUMÉ DES TESTS:" $InfoColor
Write-TestResult "- Token client: $($script:ClientToken -ne $null ? '✓' : '✗')" ($script:ClientToken -ne $null ? $SuccessColor : $ErrorColor)
Write-TestResult "- Token chauffeur: $($script:DriverToken -ne $null ? '✓' : '✗')" ($script:DriverToken -ne $null ? $SuccessColor : $ErrorColor)
Write-TestResult "- Transport créé: $($script:TransportId -ne $null ? "✓ (ID: $script:TransportId)" : '✗')" ($script:TransportId -ne $null ? $SuccessColor : $ErrorColor)

Write-TestResult "" $InfoColor
Write-TestResult "💡 Pour tester les WebSockets, ouvrez le fichier 'test-websocket.html' dans votre navigateur" $WarningColor
Write-TestResult "   et utilisez les tokens suivants:" $WarningColor
if ($script:ClientToken) {
    Write-TestResult "   Token Client: $script:ClientToken" $InfoColor
}
if ($script:DriverToken) {
    Write-TestResult "   Token Chauffeur: $script:DriverToken" $InfoColor
}
