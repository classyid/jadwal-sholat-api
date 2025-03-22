// Fungsi untuk mencatat log akses ke spreadsheet
function logAccess(e, action, kota) {
  const spreadsheetId = '<ID-SPREADSHEET>';
  const sheetName = 'logAPI';
  
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    // Buat sheet jika belum ada
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      sheet.appendRow([
        'Timestamp', 
        'IP', 
        'UserAgent', 
        'Action', 
        'Kota', 
        'Query Parameters', 
        'Status', 
        'Response Time (ms)'
      ]);
      
      // Format header
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#f3f3f3');
      sheet.setFrozenRows(1);
    }
    
    // Mendapatkan informasi request
    const timestamp = new Date();
    
    // Coba dapatkan informasi client dari berbagai properti
    let userIP = 'Unknown';
    if (e.userAddress) {
      userIP = e.userAddress;
    } else if (e.parameters && e.parameters['X-Forwarded-For']) {
      userIP = e.parameters['X-Forwarded-For'];
    } else if (e.headers && e.headers['X-Forwarded-For']) {
      userIP = e.headers['X-Forwarded-For'];
    }
    
    // Coba dapatkan user agent
    let userAgent = 'Unknown';
    if (e.userAgent) {
      userAgent = e.userAgent;
    } else if (e.headers && e.headers['User-Agent']) {
      userAgent = e.headers['User-Agent'];
    }
    
    // Log semua headers untuk debugging (opsional)
    let allHeaders = {};
    if (e.headers) {
      allHeaders = e.headers;
    } else if (e.parameter) {
      // Coba cari header yang mungkin dilewatkan sebagai parameter
      Object.keys(e.parameter).forEach(key => {
        if (key.toLowerCase().includes('header') || key.startsWith('X-')) {
          allHeaders[key] = e.parameter[key];
        }
      });
    }
    
    const headersStr = JSON.stringify(allHeaders);
    const queryParams = e && e.parameter ? JSON.stringify(e.parameter) : '{}';
    
    // Tambahkan data ke spreadsheet
    sheet.appendRow([
      timestamp, 
      userIP, 
      userAgent, 
      action, 
      kota, 
      `${queryParams} | Headers: ${headersStr}`, // Tambahkan headers untuk debugging
      'success', 
      0
    ]);
    
  } catch (error) {
    console.error('Error logging access:', error.message);
  }
}

// Fungsi untuk mencatat log error ke spreadsheet
function logError(e, errorMessage) {
  const spreadsheetId = '1u1DZxfOvllGb94SD1dRi-pMlRZvj-EWAN_x7U-m8c9s';
  const sheetName = 'logAPI';
  
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    // Buat sheet jika belum ada (sama seperti di logAccess)
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      sheet.appendRow([
        'Timestamp', 
        'IP', 
        'UserAgent', 
        'Action', 
        'Kota', 
        'Query Parameters', 
        'Status', 
        'Response Time (ms)'
      ]);
      
      // Format header
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#f3f3f3');
      sheet.setFrozenRows(1);
    }
    
    // Mendapatkan informasi request
    const timestamp = new Date();
    
    // Coba dapatkan informasi client dari berbagai properti (seperti di logAccess)
    let userIP = 'Unknown';
    if (e && e.userAddress) {
      userIP = e.userAddress;
    } else if (e && e.parameters && e.parameters['X-Forwarded-For']) {
      userIP = e.parameters['X-Forwarded-For'];
    } else if (e && e.headers && e.headers['X-Forwarded-For']) {
      userIP = e.headers['X-Forwarded-For'];
    }
    
    // Coba dapatkan user agent
    let userAgent = 'Unknown';
    if (e && e.userAgent) {
      userAgent = e.userAgent;
    } else if (e && e.headers && e.headers['User-Agent']) {
      userAgent = e.headers['User-Agent'];
    }
    
    const action = e && e.parameter && e.parameter.action ? e.parameter.action : 'jadwal';
    const kotaParam = e && e.parameter && e.parameter.kota ? e.parameter.kota : 'kediri';
    const queryParams = e && e.parameter ? JSON.stringify(e.parameter) : '{}';
    
    // Catat log error
    sheet.appendRow([
      timestamp, 
      userIP, 
      userAgent, 
      action, 
      kotaParam, 
      queryParams, 
      'error: ' + errorMessage, 
      0 // Response time tidak diukur untuk error
    ]);
      
  } catch (error) {
    console.error('Error logging error:', error.message);
  }
}// API untuk mendapatkan jadwal sholat dengan fitur tambahan
function doGet(e) {
  try {
    // Mendapatkan parameter dari URL
    const params = e.parameter;
    const action = params.action || 'jadwal';
    const kota = params.kota || 'kediri';

    // Catat log akses
    logAccess(e, action, kota);

    // Menentukan tindakan berdasarkan parameter
    switch (action) {
      case 'daftar-kota':
        // Menampilkan daftar kota yang tersedia
        return getListKota();
      case 'jadwal':
      default:
        // Menampilkan jadwal sholat berdasarkan kota (default: Kediri)
        return getJadwalSholat(kota);
    }
  } catch (error) {
    // Catat log error
    logError(e, error.message);
    
    // Mengembalikan pesan error jika terjadi kesalahan
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi untuk menampilkan daftar kota yang tersedia
function getListKota() {
  const baseUrl = 'https://jadwalsholat.org/jadwal-sholat/monthly.php';
  const cities = getCities(baseUrl);
  
  // Format data kota menjadi array
  const cityList = Object.entries(cities).map(([id, name]) => {
    return {
      id: id,
      name: name
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
  
  // Mengembalikan respons JSON
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    total: cityList.length,
    data: cityList
  })).setMimeType(ContentService.MimeType.JSON);
}

// Fungsi untuk mendapatkan jadwal sholat berdasarkan nama kota
function getJadwalSholat(cityName) {
  const cityId = getCityId(cityName);
  if (!cityId) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: `Kota '${cityName}' tidak ditemukan. Gunakan action=daftar-kota untuk melihat daftar kota yang tersedia.`
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // Mendapatkan bulan saat ini (1-based index)
  const date = today.getDate();
  
  // Mendapatkan data adzan untuk bulan ini
  const adzans = getAdzans(cityId, month, year);
  
  // Mencari data untuk hari ini
  const todayAdzan = adzans.find(adzan => {
    const tanggalParts = adzan.tanggal.split('-');
    return parseInt(tanggalParts[2]) === date;
  });
  
  if (!todayAdzan) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Jadwal sholat hari ini tidak ditemukan'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Format tanggal menjadi lebih mudah dibaca dalam Bahasa Indonesia
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  const dayOfWeek = dayNames[today.getDay()];
  const dayOfMonth = today.getDate();
  const monthName = monthNames[today.getMonth()];
  const yearNum = today.getFullYear();
  
  const formattedDate = `${dayOfWeek}, ${dayOfMonth} ${monthName} ${yearNum}`;
  
  // Mengembalikan data jadwal sholat hari ini
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    data: {
      kota: cityName.charAt(0).toUpperCase() + cityName.slice(1), // Kapitalisasi nama kota
      tanggal: formattedDate,
      jadwal: {
        imsyak: todayAdzan.imsyak,
        shubuh: todayAdzan.shubuh,
        terbit: todayAdzan.terbit,
        dhuha: todayAdzan.dhuha,
        dzuhur: todayAdzan.dzuhur,
        ashr: todayAdzan.ashr,
        magrib: todayAdzan.magrib,
        isya: todayAdzan.isya
      }
    }
  })).setMimeType(ContentService.MimeType.JSON);
}

// Fungsi untuk mendapatkan ID kota berdasarkan nama kota
function getCityId(cityName) {
  const baseUrl = 'https://jadwalsholat.org/jadwal-sholat/monthly.php';
  const cities = getCities(baseUrl);
  
  const normalizedCityName = cityName.toLowerCase().replace(/\W+/g, '');
  
  // Mencari ID kota berdasarkan nama
  for (const [id, name] of Object.entries(cities)) {
    if (name === normalizedCityName) {
      return id;
    }
  }
  
  return null;
}

// Fungsi untuk mendapatkan daftar kota dan ID-nya
function getCities(baseUrl) {
  // Caching untuk mengurangi request ke server
  const cache = CacheService.getScriptCache();
  const cacheKey = 'city_list';
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return JSON.parse(cachedData);
  }
  
  const response = UrlFetchApp.fetch(baseUrl);
  const content = response.getContentText();
  
  const optionRegex = /<option value="(\d+)">([^<]+)<\/option>/g;
  const cities = {};
  let match;
  
  while ((match = optionRegex.exec(content)) !== null) {
    const id = match[1];
    const name = match[2].toLowerCase().replace(/\W+/g, ''); // membersihkan nama kota
    cities[id] = name;
  }
  
  // Menyimpan data ke cache selama 6 jam
  cache.put(cacheKey, JSON.stringify(cities), 21600);
  
  return cities;
}

// Fungsi untuk mendapatkan jadwal adzan berdasarkan ID kota, bulan, dan tahun
function getAdzans(cityId, month, year) {
  // Menggunakan cache untuk mengurangi request
  const cache = CacheService.getScriptCache();
  const cacheKey = `adzan_${cityId}_${month}_${year}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return JSON.parse(cachedData);
  }
  
  const url = `https://jadwalsholat.org/jadwal-sholat/monthly.php?id=${cityId}&m=${month}&y=${year}`;
  
  try {
    const response = UrlFetchApp.fetch(url);
    const content = response.getContentText();
    
    const rowRegex = /<tr.*?class=".*?">([\s\S]*?)<\/tr>/g;
    const cellRegex = /<td.*?>(.*?)<\/td>/g;
    
    const result = [];
    let rowMatch;
    
    while ((rowMatch = rowRegex.exec(content)) !== null) {
      const rowData = [];
      let cellMatch;
      
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        rowData.push(stripHTML(cellMatch[1].trim())); // Bersihkan tag HTML
      }
      
      if (rowData.length === 9 && !rowData[0].includes("Tanggal")) { // Abaikan baris judul seperti "Tanggal"
        result.push({
          'tanggal': `${year}-${month}-${rowData[0].replace(/\s+/g, '')}`,
          'imsyak': rowData[1],
          'shubuh': rowData[2],
          'terbit': rowData[3],
          'dhuha': rowData[4],
          'dzuhur': rowData[5],
          'ashr': rowData[6],
          'magrib': rowData[7],
          'isya': rowData[8]
        });
      }
    }
    
    // Menyimpan data ke cache selama 1 hari
    cache.put(cacheKey, JSON.stringify(result), 86400);
    
    return result;
  } catch (error) {
    throw new Error(`Failed to fetch data for cityId ${cityId}: ${error.message}`);
  }
}

// Fungsi untuk menghapus tag HTML dari teks
function stripHTML(input) {
  return input.replace(/<\/?[^>]+(>|$)/g, "");
}
