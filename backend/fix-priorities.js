/**
 * FIX PRIORITY DATABASE
 * Script để sửa lại priorities trong database
 * - Loại bỏ duplicates
 * - Lấp các gaps
 * - Đảm bảo priorities liên tục từ 1 đến N
 */

const db = require("./src/config/db");

async function fixPriorities() {
  console.log("=== FIX PRIORITY DATABASE ===\n");

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Lấy tất cả rules, sắp xếp theo priority hiện tại
    console.log("1. Fetching all rules...");
    const [rules] = await connection.query(
      "SELECT id, rule_name, priority FROM accounting_rules ORDER BY priority ASC, id ASC",
    );
    console.log(`   Found ${rules.length} rules`);
    console.log(
      "   Current priorities:",
      rules.map((r) => r.priority).join(", "),
    );

    // 2. Gán lại priority từ 1 đến N
    console.log("\n2. Reassigning priorities...");
    for (let i = 0; i < rules.length; i++) {
      const newPriority = i + 1;
      const rule = rules[i];

      if (rule.priority !== newPriority) {
        console.log(
          `   Updating: "${rule.rule_name}" from priority ${rule.priority} -> ${newPriority}`,
        );
        await connection.query(
          "UPDATE accounting_rules SET priority = ? WHERE id = ?",
          [newPriority, rule.id],
        );
      }
    }

    // 3. Verify kết quả
    console.log("\n3. Verifying results...");
    const [updatedRules] = await connection.query(
      "SELECT id, rule_name, priority FROM accounting_rules ORDER BY priority ASC",
    );
    console.log(`   Total rules: ${updatedRules.length}`);
    console.log(
      "   New priorities:",
      updatedRules.map((r) => r.priority).join(", "),
    );

    // Check duplicates
    const priorities = updatedRules.map((r) => r.priority);
    const duplicates = priorities.filter((p, i) => priorities.indexOf(p) !== i);
    if (duplicates.length > 0) {
      console.log("   ❌ Still have duplicates:", [...new Set(duplicates)]);
      throw new Error("Failed to fix duplicates");
    } else {
      console.log("   ✅ No duplicates");
    }

    // Check gaps
    const gaps = [];
    for (let i = 1; i < priorities.length; i++) {
      if (priorities[i] - priorities[i - 1] > 1) {
        gaps.push(`${priorities[i - 1]} -> ${priorities[i]}`);
      }
    }
    if (gaps.length > 0) {
      console.log("   ❌ Still have gaps:", gaps.join(", "));
      throw new Error("Failed to fix gaps");
    } else {
      console.log("   ✅ No gaps");
    }

    // Check sequence
    const expectedSequence = Array.from(
      { length: updatedRules.length },
      (_, i) => i + 1,
    );
    const actualSequence = priorities;
    const isCorrect =
      JSON.stringify(expectedSequence) === JSON.stringify(actualSequence);

    if (isCorrect) {
      console.log(
        "   ✅ Priority sequence is correct: 1 to",
        updatedRules.length,
      );
    } else {
      console.log("   ❌ Priority sequence is incorrect");
      throw new Error("Priority sequence mismatch");
    }

    // 4. Commit changes
    await connection.commit();
    console.log("\n✅ DATABASE FIXED SUCCESSFULLY!");
    console.log("\nFinal rule list:");
    updatedRules.forEach((r) => {
      console.log(`   ${r.priority}. ${r.rule_name}`);
    });
  } catch (error) {
    await connection.rollback();
    console.error("\n❌ Error:", error.message);
    console.error(error);
  } finally {
    connection.release();
    await db.end();
  }
}

fixPriorities();
