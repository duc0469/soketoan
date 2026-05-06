/**
 * CLEAR ALL DATA
 * Script để xóa tất cả dữ liệu trong database
 */

const db = require("./src/config/db");

async function clearAllData() {
  console.log("=== CLEARING ALL DATA ===\n");

  try {
    // Xóa theo thứ tự đúng (child trước, parent sau)
    console.log("1. Deleting ledgers...");
    const [ledgersResult] = await db.query("DELETE FROM ledgers");
    console.log(`   ✓ Deleted ${ledgersResult.affectedRows} ledgers`);

    console.log("2. Deleting transactions...");
    const [transactionsResult] = await db.query("DELETE FROM transactions");
    console.log(`   ✓ Deleted ${transactionsResult.affectedRows} transactions`);

    console.log("3. Deleting upload_batches...");
    const [batchesResult] = await db.query("DELETE FROM upload_batches");
    console.log(`   ✓ Deleted ${batchesResult.affectedRows} batches`);

    console.log("\n✅ ALL DATA CLEARED SUCCESSFULLY!");

    // Verify
    console.log("\n=== VERIFICATION ===");
    const [[{ ledger_count }]] = await db.query(
      "SELECT COUNT(*) as ledger_count FROM ledgers",
    );
    const [[{ transaction_count }]] = await db.query(
      "SELECT COUNT(*) as transaction_count FROM transactions",
    );
    const [[{ batch_count }]] = await db.query(
      "SELECT COUNT(*) as batch_count FROM upload_batches",
    );

    console.log(`Ledgers: ${ledger_count}`);
    console.log(`Transactions: ${transaction_count}`);
    console.log(`Batches: ${batch_count}`);

    if (ledger_count === 0 && transaction_count === 0 && batch_count === 0) {
      console.log("\n✅ Database is clean!");
    } else {
      console.log("\n⚠️  Some data still remains!");
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
  } finally {
    await db.end();
  }
}

clearAllData();
