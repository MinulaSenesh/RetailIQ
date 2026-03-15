const http = require('http');
const fs = require('fs');
const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/v1/reports/export/sales/pdf?start_date=2024-01-01&end_date=2024-12-31',
  method: 'GET',
};
const req = http.request(options, (res) => {
  console.log('STATUS:', res.statusCode);
  if (res.statusCode === 200) {
    const file = fs.createWriteStream('test_sales.pdf');
    res.pipe(file);
    file.on('finish', () => { file.close(); console.log('Download complete.'); });
  } else {
    res.on('data', (d) => process.stdout.write(d));
  }
});
req.on('error', (e) => { console.error('problem with request:', e.message); });
req.end();
