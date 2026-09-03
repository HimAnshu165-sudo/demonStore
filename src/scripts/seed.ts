import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { PRODUCTS } from '@/data/products';

async function seed() {
  console.log('--- Starting MongoDB Seed Process ---');
  console.log(`Source data contains ${PRODUCTS.length} products in src/data/products.ts`);

  // Check for duplicate slugs in the source data itself
  const seenSlugs = new Set<string>();
  const duplicateSlugs: string[] = [];
  for (const item of PRODUCTS) {
    if (seenSlugs.has(item.slug)) {
      duplicateSlugs.push(item.slug);
    } else {
      seenSlugs.add(item.slug);
    }
  }

  if (duplicateSlugs.length > 0) {
    console.warn('⚠️ Warning: Duplicate slugs detected in source data:', duplicateSlugs);
  } else {
    console.log('✓ Source data verification: 0 duplicate slugs found.');
  }

  // Connect to database
  console.log('Connecting to local MongoDB via src/lib/mongodb...');
  const mongoose = await connectToDatabase();
  console.log(`✓ Connected to database: "${mongoose.connection.name}"`);

  // Clean up obsolete / stale products not in the canonical source dataset
  const validSlugs = PRODUCTS.map((p) => p.slug);
  const deleteResult = await Product.deleteMany({ slug: { $nin: validSlugs } });
  if (deleteResult.deletedCount > 0) {
    console.log(`✓ Removed ${deleteResult.deletedCount} obsolete / legacy product records from database.`);
  }

  let upsertedCount = 0;
  let modifiedCount = 0;

  for (const productData of PRODUCTS) {
    const result = await Product.updateOne(
      { slug: productData.slug },
      { $set: productData },
      { upsert: true, runValidators: true }
    );

    if (result.upsertedCount > 0) {
      upsertedCount++;
      console.log(`  [INSERTED] ${productData.slug} (${productData.name})`);
    } else {
      modifiedCount++;
      console.log(`  [SYNCED/UPDATED] ${productData.slug} (${productData.name})`);
    }
  }

  // Verify total count in collection
  const totalInDb = await Product.countDocuments();
  console.log('\n--- Seed Verification Summary ---');
  console.log(`Total products in source data:  ${PRODUCTS.length}`);
  console.log(`Newly inserted products:       ${upsertedCount}`);
  console.log(`Updated / synchronized items:   ${modifiedCount}`);
  console.log(`Total products in MongoDB:      ${totalInDb}`);

  if (totalInDb === PRODUCTS.length) {
    console.log('✓ Verification successful: Database product count matches source data count.');
  } else {
    console.warn(`⚠️ Count mismatch: Expected ${PRODUCTS.length}, found ${totalInDb} in database.`);
  }

  await mongoose.disconnect();
  console.log('✓ Disconnected cleanly from MongoDB.\n');
}

seed().catch((err) => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
