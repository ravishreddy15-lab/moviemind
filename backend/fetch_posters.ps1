$ErrorActionPreference = "Continue"
$apiKey = "60b1315b3031dc9c8091011a927d17e3"
$imgBase = "https://image.tmdb.org/t/p/w500"
$cacheFile = Join-Path $PSScriptRoot "data\poster_cache.json"

$existing = @{}
if (Test-Path $cacheFile) {
    $raw = Get-Content $cacheFile -Raw -Encoding UTF8
    if ($raw) {
        $obj = $raw | ConvertFrom-Json
        foreach ($prop in $obj.PSObject.Properties) {
            $existing[$prop.Name] = $prop.Value
        }
    }
    Write-Host "Loaded $($existing.Count) cached posters."
}

$movies = Get-Content (Join-Path $PSScriptRoot "data\movies.json") -Raw -Encoding UTF8 | ConvertFrom-Json
Write-Host "Total movies: $($movies.Count)"

$toFetch = @()
foreach ($m in $movies) {
    $title = $m.title
    if ($title -and -not $existing.ContainsKey($title)) {
        $toFetch += $m
    }
}
Write-Host "Movies to fetch: $($toFetch.Count)"

function Save-Cache {
    $parts = @()
    foreach ($key in $existing.Keys) {
        $escapedKey = $key.Replace('\', '\\').Replace('"', '\"')
        $escapedVal = $existing[$key].Replace('\', '\\').Replace('"', '\"')
        $parts += "`"$escapedKey`": `"$escapedVal`""
    }
    $json = "{`n" + ($parts -join ",`n") + "`n}"
    [System.IO.File]::WriteAllText($cacheFile, $json, [System.Text.Encoding]::UTF8)
}

$count = 0
foreach ($m in $toFetch) {
    $title = $m.title
    $year = $m.year
    $posterPath = ""

    try {
        $encoded = [System.Uri]::EscapeDataString($title)
        $url = "https://api.themoviedb.org/3/search/movie?api_key=$apiKey&query=$encoded"
        $resp = Invoke-RestMethod -Uri $url -TimeoutSec 10 -ErrorAction SilentlyContinue
        if ($resp.results -and $resp.results.Count -gt 0) {
            if ($year -gt 0) {
                foreach ($r in $resp.results) {
                    $rYear = 0
                    if ($r.release_date -and $r.release_date.Length -ge 4) {
                        [int]::TryParse($r.release_date.Substring(0,4), [ref]$rYear) | Out-Null
                    }
                    if ([Math]::Abs($rYear - $year) -le 1 -and $r.poster_path) {
                        $posterPath = $r.poster_path
                        break
                    }
                }
            }
            if (-not $posterPath -and $resp.results[0].poster_path) {
                $posterPath = $resp.results[0].poster_path
            }
        }

        if (-not $posterPath) {
            $url2 = "https://api.themoviedb.org/3/search/tv?api_key=$apiKey&query=$encoded"
            $resp2 = Invoke-RestMethod -Uri $url2 -TimeoutSec 10 -ErrorAction SilentlyContinue
            if ($resp2.results -and $resp2.results.Count -gt 0 -and $resp2.results[0].poster_path) {
                $posterPath = $resp2.results[0].poster_path
            }
        }
    } catch {}

    if ($posterPath) {
        $existing[$title] = "$imgBase$posterPath"
    } else {
        $existing[$title] = ""
    }

    $count++
    if ($count % 50 -eq 0) {
        Write-Host "Progress: $count/$($toFetch.Count) - Saving..."
        Save-Cache
    }

    Start-Sleep -Milliseconds 160
}

Write-Host "Saving final cache..."
Save-Cache
$real = 0
foreach ($v in $existing.Values) { if ($v -like "https://*") { $real++ } }
Write-Host "Done! $count fetched, $real posters found out of $($existing.Count) total."
