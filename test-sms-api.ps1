# Script PowerShell pour tester les endpoints SMS/OTP Twilio
# Utilisation: .\test-sms-api.ps1

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$PhoneNumber = "+33123456789"
)

# Couleurs pour l'affichage
function Write-Success { 
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green 
}

function Write-Error { 
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red 
}

function Write-Info { 
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan 
}

function Write-Warning { 
    param([string]$Message)
    Write-Host $Message -ForegroundColor Yellow 
}

Write-Info "🚀 Test des endpoints SMS/OTP Twilio"
Write-Info "URL de base: $BaseUrl"
Write-Info "Numéro de test: $PhoneNumber"
Write-Host ""

# Test 1: Inscription chauffeur via SMS
Write-Info "📱 Test 1: Inscription chauffeur via SMS"
$chauffeurData = @{
    nom = "TestChauffeur"
    prenom = "SMS"
    telephone = $PhoneNumber
    statut = "SALARIE"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/chauffeurs/register-sms" -Method POST -Body $chauffeurData -ContentType "application/json"
    Write-Success "✅ Inscription réussie: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Warning "⚠️ Chauffeur peut déjà exister: $($_.Exception.Message)"
}

Write-Host ""

# Test 2: Demande d'OTP pour chauffeur
Write-Info "📲 Test 2: Demande d'OTP pour chauffeur"
$otpRequest = @{
    telephone = $PhoneNumber
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/chauffeurs/send-otp" -Method POST -Body $otpRequest -ContentType "application/json"
    Write-Success "✅ OTP envoyé: $($response.message)"
    
    # Demander à l'utilisateur de saisir l'OTP reçu
    Write-Warning "📨 Vérifiez votre téléphone pour le code OTP"
    $otpCode = Read-Host "Entrez le code OTP reçu"
    
    if ($otpCode) {
        # Test 3: Vérification OTP et connexion
        Write-Info "🔐 Test 3: Vérification OTP et connexion"
        $verifyData = @{
            telephone = $PhoneNumber
            otp = $otpCode
        } | ConvertTo-Json
        
        try {
            $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/chauffeurs/verify-otp" -Method POST -Body $verifyData -ContentType "application/json"
            Write-Success "✅ Connexion réussie!"
            Write-Success "Token: $($loginResponse.token.Substring(0, 20))..."
            Write-Success "Chauffeur: $($loginResponse.chauffeur.nom) $($loginResponse.chauffeur.prenom)"
            
            $token = $loginResponse.token
            
            # Test 4: Envoi SMS personnalisé (nécessite authentification)
            Write-Info "💬 Test 4: Envoi SMS personnalisé"
            $customSmsData = @{
                to = @($PhoneNumber)
                message = "Test SMS personnalisé depuis l'API MADAMOVE - $(Get-Date -Format 'HH:mm:ss')"
            } | ConvertTo-Json
            
            $headers = @{
                'Authorization' = "Bearer $token"
                'Content-Type' = 'application/json'
            }
            
            try {
                $smsResponse = Invoke-RestMethod -Uri "$BaseUrl/chauffeurs/send-custom-sms" -Method POST -Body $customSmsData -Headers $headers
                Write-Success "✅ SMS personnalisé envoyé: $($smsResponse.success)"
                $smsResponse.results | ForEach-Object {
                    if ($_.success) {
                        Write-Success "  📱 SMS envoyé à $($_.to) - SID: $($_.sid)"
                    } else {
                        Write-Error "  ❌ Échec pour $($_.to): $($_.error)"
                    }
                }
            } catch {
                Write-Error "❌ Erreur envoi SMS personnalisé: $($_.Exception.Message)"
            }
            
        } catch {
            Write-Error "❌ Erreur vérification OTP: $($_.Exception.Message)"
        }
    }
    
} catch {
    Write-Error "❌ Erreur demande OTP: $($_.Exception.Message)"
}

Write-Host ""

# Test 5: Inscription client via SMS
Write-Info "👤 Test 5: Inscription client via SMS"
$clientData = @{
    nom = "TestClient"
    prenom = "SMS"
    telephone = $PhoneNumber
    email = "test.client@example.com"
    ville = "Paris"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/clients/register-sms" -Method POST -Body $clientData -ContentType "application/json"
    Write-Success "✅ Inscription client réussie: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Warning "⚠️ Client peut déjà exister: $($_.Exception.Message)"
}

Write-Host ""

# Test 6: Test du module SMS générique
Write-Info "🔧 Test 6: Module SMS générique"
Write-Warning "Note: Les tests suivants nécessitent une authentification admin"

Write-Host ""
Write-Info "📋 Résumé des endpoints testés:"
Write-Host "  ✓ POST /chauffeurs/register-sms" -ForegroundColor Green
Write-Host "  ✓ POST /chauffeurs/send-otp" -ForegroundColor Green
Write-Host "  ✓ POST /chauffeurs/verify-otp" -ForegroundColor Green
Write-Host "  ✓ POST /chauffeurs/send-custom-sms" -ForegroundColor Green
Write-Host "  ✓ POST /clients/register-sms" -ForegroundColor Green

Write-Host ""
Write-Info "🎯 Pour tester d'autres endpoints:"
Write-Host "  • POST /clients/send-otp"
Write-Host "  • POST /clients/verify-otp"
Write-Host "  • POST /clients/login-sms"
Write-Host "  • POST /sms/send (nécessite auth)"
Write-Host "  • POST /sms/send-otp (nécessite auth)"

Write-Host ""
Write-Success "✨ Tests terminés!"
