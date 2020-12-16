const fs = require('fs');
const { getAverageColor } = require('fast-average-color-node');
const { tint, shade } = require('tint-shade-color');

async function createColorsJson() {
  const json = {};

  for (let i = 1; i <= 151; i++) {
    const { hex: averageHex } = await getAverageColor(`./src/assets/images/species/${i}.png`);
    const hiHex = tint(averageHex, 0.35);
    const loHex = shade(averageHex, 0.35);

    json[i] = {
      averageHex,
      average: Number('0x' + averageHex.slice(1)),
      hiHex,
      hi: Number('0x' + hiHex.slice(1)),
      loHex,
      lo: Number('0x' + loHex.slice(1)),
    };
  }

  fs.writeFileSync('./src/assets/data/species-colors.json', JSON.stringify(json, null, ' ').concat('\n'));
};

createColorsJson().then(() => console.log('done'));
