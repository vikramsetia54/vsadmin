const { MongoClient } = require('mongodb');
const fs = require('fs');

async function main() {
  const uri = 'mongodb://localhost:27017/vsenterprises';
  const client = new MongoClient(uri);
  let out = "";
  try {
    await client.connect();
    const db = client.db('vsenterprises');
    const collections = await db.listCollections().toArray();
    out += JSON.stringify({ names: collections.map(c => c.name) }) + '\n';
    
    // For each collection, print a sample document
    for (const c of collections) {
      const sample = await db.collection(c.name).findOne({});
      out += `Sample from ${c.name}: ` + JSON.stringify(sample) + '\n';
    }
    fs.writeFileSync('db-out.txt', out, 'utf-8');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
