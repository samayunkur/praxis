import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const filePath = dbUrl.replace(/^file:/, "");
const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
const adapter = new PrismaLibSql({ url: `file:${absolutePath}` });
const prisma = new PrismaClient({ adapter });

// 誤っていた3件を正確な引用に修正
const corrections: Record<string, { evidence: string; scholarUrl: string }> = {
  // ❌ 誤: Obesity Reviews → ✅ 正: Journal of the Academy of Nutrition and Dietetics
  "食事の食べる速度を落とす（20分ルール）": {
    evidence: "Zhu, Y. & Hollis, J.H. (2014). Increasing the number of chews before swallowing reduces meal size in normal-weight, overweight, and obese adults. *Journal of the Academy of Nutrition and Dietetics*, 114(6), 926-931.",
    scholarUrl: "https://scholar.google.com/scholar?q=Increasing+number+chews+before+swallowing+reduces+meal+size+Zhu+Hollis+2014+Journal+Academy+Nutrition+Dietetics",
  },

  // ❌ 誤: Journal of Applied Physiology → ✅ 正: Sports Medicine
  "10分ウォーキングを1日3回に分割": {
    evidence: "Murphy, M.H., Blair, S.N. & Murtagh, E.M. (2009). Accumulated versus continuous exercise for health benefit: A review of empirical studies. *Sports Medicine*, 39(1), 29-43.",
    scholarUrl: "https://scholar.google.com/scholar?q=Accumulated+versus+continuous+exercise+health+benefit+review+empirical+studies+Murphy+Blair+Murtagh+2009+Sports+Medicine",
  },

  // ❌ 誤: Emotion → ✅ 正: Personal Relationships
  "週1回、感謝を言葉で伝える": {
    evidence: "Algoe, S.B., Gable, S.L. & Maisel, N.C. (2010). It's the little things: Everyday gratitude as a booster shot for romantic relationships. *Personal Relationships*, 17(2), 217-233.",
    scholarUrl: "https://scholar.google.com/scholar?q=It%27s+the+little+things+everyday+gratitude+booster+shot+romantic+relationships+Algoe+Gable+Maisel+2010+Personal+Relationships",
  },
};

async function main() {
  let updated = 0;

  for (const [title, { evidence, scholarUrl }] of Object.entries(corrections)) {
    const card = await prisma.actionCard.findFirst({ where: { title } });

    if (!card) {
      console.log(`⚠️  Not found: ${title}`);
      continue;
    }

    const evidenceWithLink = `${evidence}\n\n[🔗 Google Scholarで論文を見る](${scholarUrl})`;

    await prisma.actionCard.update({
      where: { id: card.id },
      data: { evidence: evidenceWithLink },
    });

    console.log(`✅ 修正完了: ${title}`);
    updated++;
  }

  console.log(`\n${updated}件修正完了`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
