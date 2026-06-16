try {
  Add-Type -AssemblyName System.Drawing;
  $src = 'c:\Users\gulab\Documents\GitHub\TextTile\frontend\public\logo.jpg';
  $img = [System.Drawing.Image]::FromFile($src);
  $fmt = [System.Drawing.Imaging.ImageFormat]::Png;
  
  $targets = @(
    'c:\Users\gulab\Documents\GitHub\TextTile\frontend\public\icon-192.png',
    'c:\Users\gulab\Documents\GitHub\TextTile\frontend\public\icon-512.png',
    'c:\Users\gulab\Documents\GitHub\TextTile\frontend\public\icon-192-maskable.png',
    'c:\Users\gulab\Documents\GitHub\TextTile\frontend\public\icon-512-maskable.png',
    'c:\Users\gulab\Documents\GitHub\TextTile\frontend\app\icon.png',
    'c:\Users\gulab\Documents\GitHub\TextTile\frontend\app\apple-icon.png'
  );
  
  foreach ($t in $targets) {
    $img.Save($t, $fmt);
    Write-Host "Saved $t"
  }
  $img.Dispose();
} catch {
  Write-Error $_.Exception.Message
}
