const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs').promises;

(async () => {
  let sububrbs = await fetch(
    'https://raw.githubusercontent.com/michalsn/australian-suburbs/master/data/suburbs.json',
  );

  sububrbs = await sububrbs.json();

  const lgaList = [];

  sububrbs.data.forEach(sububrb => {
    const lgaName = sububrb.local_goverment_area.toLowerCase();
    const suburbName = sububrb.suburb.toLowerCase();
    const lga = lgaList.find(lga => lga.name === lgaName);

    if (!lga) {
      lgaList.push({
        name: lgaName,
        suburbs: [suburbName],
      });
    } else {
      lga.suburbs.push(suburbName);
    }
  });

  fs.writeFile(
    path.join(__dirname, '../public/lga_list.json'),
    JSON.stringify(lgaList, null, 2),
  );
})();
