const fs = require('fs');

const API_KEY = process.env.AIRTABLE_API_KEY || 'patQsUUVvd5DbRBnY.613d805a328b71f5d3966c59994035a0db1a89f0dd029b61e1717539f9902a4b';
const BASE_ID = 'applI3tAeZR7UltWP';
const PRACTICES_TABLE = 'tblAHxLRVfmZ58gKA';

const FIELDS = ['org_pac_id','Practice Name','City_St','Stability Score','Stability Score Delta','latest_roster_size','latitude','longitude','phone','practice_URL']
  .map(f => 'fields[]=' + encodeURIComponent(f)).join('&');

const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${PRACTICES_TABLE}?${FIELDS}&pageSize=100`;

async function airtableFetch(url) {
  const res = await fetch(url, { 
    headers: { Authorization: `Bearer ${API_KEY}` } 
  });
  if (!res.ok) throw new Error(`Airtable error ${res.status}`);
  return res.json();
}

async function fetchAllPractices() {
  console.log('Fetching practices from Airtable...');
  
  let allRecords = [];
  let offset = null;
  let pageCount = 0;

  try {
    const firstData = await airtableFetch(BASE_URL);
    allRecords = firstData.records || [];
    offset = firstData.offset;
    pageCount = 1;
    console.log(`  Page ${pageCount}: ${allRecords.length} records`);

    while (offset) {
      const data = await airtableFetch(`${BASE_URL}&offset=${offset}`);
      const newRecords = data.records || [];
      allRecords = allRecords.concat(newRecords);
      offset = data.offset;
      pageCount++;
      console.log(`  Page ${pageCount}: ${allRecords.length} total records`);
      await new Promise(r => setTimeout(r, 100));
    }

    console.log(`✓ Fetched ${allRecords.length} practices in ${pageCount} pages`);

    const output = { records: allRecords };
    fs.writeFileSync('practices.json', JSON.stringify(output, null, 2));
    console.log(`✓ Saved to practices.json`);
    console.log(`✓ File size: ${(fs.statSync('practices.json').size / 1024 / 1024).toFixed(2)} MB`);

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fetchAllPractices();
