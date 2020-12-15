const fs = require('fs');
const { getAverageColor } = require('fast-average-color-node');
const { tint, shade } = require('tint-shade-color');

async function createColorsJson() {
  const json = {};

  for (let i = 1; i <= 151; i++) {
    const { hex: average } = await getAverageColor(`./src/assets/images/species/${i}.png`);

    json[i] = {
      average,
      hi: tint(average, 0.5),
      lo:shade(average, 0.5),
    };
  }

  fs.writeFileSync('./src/assets/data/species-colors.json', JSON.stringify(json, null, ' ').concat('\n'));
};

createColorsJson().then(() => console.log('done'));
