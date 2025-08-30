# Simple PowerShell test for the test worker
$url = "https://test-searchtermux-worker.tech-a14.workers.dev"
$body = @{
    query = "test"
    options = @{
        limit = 1
    }
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

try {
    Write-Host "🧪 Testing worker at: $url"
    Write-Host "📤 Request body: $body"
    
    $response = Invoke-RestMethod -Uri $url -Method POST -Body $body -Headers $headers
    
    Write-Host "✅ Success!"
    Write-Host "📥 Response: $($response | ConvertTo-Json -Depth 5)"
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
    Write-Host "📄 Response: $($_.Exception.Response)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "📄 Error body: $responseBody"
    }
}
















