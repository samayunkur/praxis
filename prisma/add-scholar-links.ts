import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const filePath = dbUrl.replace(/^file:/, "");
const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
const adapter = new PrismaLibSql({ url: `file:${absolutePath}` });
const prisma = new PrismaClient({ adapter });

// タイトル → { evidence: 引用テキスト, scholarUrl: Google Scholar URL }
const updates: Record<string, { evidence: string; scholarUrl: string }> = {
  // 睡眠
  "就寝1時間前に入浴する": {
    evidence: "Haghayegh et al. (2019). Before-bedtime passive body heating by warm shower or bath to improve sleep: A systematic and meta-analytic review. *Sleep Medicine Reviews*, 46, 124-135.",
    scholarUrl: "https://scholar.google.com/scholar?q=Before-bedtime+passive+body+heating+warm+shower+bath+improve+sleep+Haghayegh+2019",
  },
  "寝る前90分スマホのブルーライトを避ける": {
    evidence: "Chang et al. (2015). Evening use of light-emitting eReaders negatively affects sleep, circadian timing, and next-morning alertness. *PNAS*, 112(4), 1232-1237.",
    scholarUrl: "https://scholar.google.com/scholar?q=Evening+use+light-emitting+eReaders+negatively+affects+sleep+Chang+2015",
  },
  "毎日同じ時刻に起床する": {
    evidence: "Wittmann et al. (2006). Social jetlag: Misalignment of biological and social time. *Chronobiology International*, 23(1-2), 497-509.",
    scholarUrl: "https://scholar.google.com/scholar?q=Social+jetlag+misalignment+biological+social+time+Wittmann+2006",
  },
  "寝室を18〜19℃に保つ": {
    evidence: "Okamoto-Mizuno & Mizuno (2012). Effects of thermal environment on sleep and circadian rhythm. *Journal of Physiological Anthropology*, 31(1), 14.",
    scholarUrl: "https://scholar.google.com/scholar?q=Effects+thermal+environment+sleep+circadian+rhythm+Okamoto-Mizuno+2012",
  },
  "カフェインは午後2時以降摂取しない": {
    evidence: "Drake et al. (2013). Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed. *Journal of Clinical Sleep Medicine*, 9(11), 1195-1200.",
    scholarUrl: "https://scholar.google.com/scholar?q=Caffeine+effects+on+sleep+taken+0+3+6+hours+before+going+to+bed+Drake+2013",
  },

  // 運動
  "4分間タバタトレーニング": {
    evidence: "Tabata et al. (1996). Effects of moderate-intensity endurance and high-intensity intermittent training on anaerobic capacity and VO2max. *Medicine & Science in Sports & Exercise*, 28(10), 1327-1330.",
    scholarUrl: "https://scholar.google.com/scholar?q=Effects+moderate-intensity+endurance+high-intensity+intermittent+training+anaerobic+capacity+VO2max+Tabata+1996",
  },
  "プログレッシブオーバーロードを実践する": {
    evidence: "Kraemer & Ratamess (2004). Fundamentals of resistance training: Progression and exercise prescription. *Medicine & Science in Sports & Exercise*, 36(4), 674-688.",
    scholarUrl: "https://scholar.google.com/scholar?q=Fundamentals+resistance+training+progression+exercise+prescription+Kraemer+Ratamess+2004",
  },
  "10分ウォーキングを1日3回に分割": {
    evidence: "Murphy et al. (2009). The accumulation of short bouts of exercise in healthy adults. *Journal of Applied Physiology*, 107(4), 1077-1082.",
    scholarUrl: "https://scholar.google.com/scholar?q=accumulation+short+bouts+exercise+healthy+adults+Murphy+2009+Journal+Applied+Physiology",
  },
  "筋肉痛部位に2分のセルフマッサージ": {
    evidence: "Pearcey et al. (2015). Foam rolling for delayed-onset muscle soreness and recovery of dynamic performance measures. *Journal of Athletic Training*, 50(1), 5-13.",
    scholarUrl: "https://scholar.google.com/scholar?q=Foam+rolling+delayed-onset+muscle+soreness+recovery+dynamic+performance+Pearcey+2015",
  },
  "腕立て伏せ1回から始めるPO習慣": {
    evidence: "Fogg, B.J. (2020). *Tiny Habits: The Small Changes That Change Everything*. Houghton Mifflin Harcourt.",
    scholarUrl: "https://scholar.google.com/scholar?q=Tiny+Habits+Small+Changes+Fogg+2020+behavior+design",
  },

  // 栄養
  "毎日野菜を一皿多く食べる": {
    evidence: "McDonald et al. (2018). American Gut: an Open Platform for Citizen Science Microbiome Research. *Cell Host & Microbe*, 23(4), 479-494.",
    scholarUrl: "https://scholar.google.com/scholar?q=American+Gut+Open+Platform+Citizen+Science+Microbiome+Research+McDonald+2018",
  },
  "植物性タンパクを1日1回摂取": {
    evidence: "Satija & Hu (2018). Plant-based diets and cardiovascular health. *Trends in Cardiovascular Medicine*, 28(7), 437-441.",
    scholarUrl: "https://scholar.google.com/scholar?q=Plant-based+diets+cardiovascular+health+Satija+Hu+2018",
  },
  "加工食品を週3回以下に制限": {
    evidence: "Monteiro et al. (2019). Ultra-processed foods: what they are and how to identify them. *Public Health Nutrition*, 22(5), 936-941.",
    scholarUrl: "https://scholar.google.com/scholar?q=Ultra-processed+foods+what+they+are+how+to+identify+them+Monteiro+2019",
  },
  "水を1日2L飲む習慣をつける": {
    evidence: "Popkin et al. (2010). Water, hydration and health. *Nutrition Reviews*, 68(8), 439-458.",
    scholarUrl: "https://scholar.google.com/scholar?q=Water+hydration+health+Popkin+2010+Nutrition+Reviews",
  },
  "食事の食べる速度を落とす（20分ルール）": {
    evidence: "Zhu & Hollis (2014). Meal frequency and meal duration. *Obesity Reviews*, 15(4), 305-314.",
    scholarUrl: "https://scholar.google.com/scholar?q=meal+frequency+duration+eating+speed+obesity+satiety+Zhu+Hollis+2014",
  },

  // メンタル
  "5分間Focused Attentionメディテーション": {
    evidence: "Hölzel et al. (2011). Mindfulness practice leads to increases in regional brain gray matter density. *Psychiatry Research: Neuroimaging*, 191(1), 36-43.",
    scholarUrl: "https://scholar.google.com/scholar?q=Mindfulness+practice+leads+increases+regional+brain+gray+matter+density+Holzel+2011",
  },
  "感情に名前をつける（脱フュージョン）": {
    evidence: "Hayes et al. (2006). Acceptance and Commitment Therapy: Model, processes and outcomes. *Behaviour Research and Therapy*, 44(1), 1-25.",
    scholarUrl: "https://scholar.google.com/scholar?q=Acceptance+Commitment+Therapy+model+processes+outcomes+Hayes+2006",
  },
  "1日3つの感謝を書き出す": {
    evidence: "Emmons & McCullough (2003). Counting blessings versus burdens: An experimental investigation of gratitude and subjective well-being. *Journal of Personality and Social Psychology*, 84(2), 377-389.",
    scholarUrl: "https://scholar.google.com/scholar?q=Counting+blessings+versus+burdens+gratitude+subjective+well-being+Emmons+McCullough+2003",
  },
  "バリューランタンで核心価値観を特定": {
    evidence: "Wilson & Murrell (2004). Values work in Acceptance and Commitment Therapy. In Hayes et al. (Eds.), *Mindfulness and Acceptance*, Guilford Press.",
    scholarUrl: "https://scholar.google.com/scholar?q=Values+work+Acceptance+Commitment+Therapy+Wilson+Murrell+2004+mindfulness",
  },
  "Forgivenessエクササイズ（許しの実践）": {
    evidence: "Worthington et al. (2007). Forgiveness, health, and well-being: A review of evidence for emotional versus decisional forgiveness. *Journal of Behavioral Medicine*, 30(4), 291-302.",
    scholarUrl: "https://scholar.google.com/scholar?q=Forgiveness+health+well-being+emotional+decisional+Worthington+2007",
  },

  // 人間関係
  "アクティブリスニング実践": {
    evidence: "Rogers, C.R. & Farson, R.E. (1957). *Active Listening*. University of Chicago. / Weger et al. (2014). The relative effectiveness of active listening in initial interactions. *International Journal of Listening*, 28(1), 13-31.",
    scholarUrl: "https://scholar.google.com/scholar?q=active+listening+effectiveness+initial+interactions+Weger+2014",
  },
  "週1回、感謝を言葉で伝える": {
    evidence: "Algoe et al. (2010). It's the little things: Everyday gratitude as a booster shot for romantic relationships. *Emotion*, 10(4), 337-345.",
    scholarUrl: "https://scholar.google.com/scholar?q=It%27s+the+little+things+everyday+gratitude+booster+shot+romantic+relationships+Algoe+2010",
  },
  "1人でできる楽しみを1つ増やす": {
    evidence: "Winnicott, D.W. (1958). The capacity to be alone. *International Journal of Psycho-Analysis*, 39, 416-420.",
    scholarUrl: "https://scholar.google.com/scholar?q=capacity+to+be+alone+Winnicott+1958+International+Journal+Psycho-Analysis",
  },
  "非言語コミュニケーションを意識する": {
    evidence: "Mehrabian, A. & Ferris, S.R. (1967). Inference of attitudes from nonverbal communication in two channels. *Journal of Consulting Psychology*, 31(3), 248-252.",
    scholarUrl: "https://scholar.google.com/scholar?q=Inference+attitudes+nonverbal+communication+two+channels+Mehrabian+Ferris+1967",
  },
  "週1回、対面での会話を増やす": {
    evidence: "Cacioppo, J.T. & Patrick, W. (2008). *Loneliness: Human Nature and the Need for Social Connection*. Norton. / Holt-Lunstad et al. (2015). Loneliness and social isolation as risk factors for mortality. *Perspectives on Psychological Science*, 10(2), 227-237.",
    scholarUrl: "https://scholar.google.com/scholar?q=Loneliness+social+isolation+risk+factors+mortality+Holt-Lunstad+2015",
  },

  // 認知・学習
  "スキマ時間学習：5分で1つ学ぶ": {
    evidence: "Cepeda et al. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin*, 132(3), 354-380.",
    scholarUrl: "https://scholar.google.com/scholar?q=Distributed+practice+verbal+recall+tasks+review+quantitative+synthesis+Cepeda+2006",
  },
  "学びを言語化する（深スマート）": {
    evidence: "Leonard, D. & Swap, W. (2005). *Deep Smarts: How to Cultivate and Transfer Enduring Business Wisdom*. Harvard Business School Press.",
    scholarUrl: "https://scholar.google.com/scholar?q=Deep+Smarts+Cultivate+Transfer+Enduring+Business+Wisdom+Leonard+Swap+2005",
  },
  "PREP法で思考を構造化する": {
    evidence: "Minto, B. (1987). *The Pyramid Principle: Logic in Writing and Thinking*. Financial Times Prentice Hall.",
    scholarUrl: "https://scholar.google.com/scholar?q=Pyramid+Principle+Logic+Writing+Thinking+Minto+1987",
  },
  "シングルタスク25分集中（ポモドーロ）": {
    evidence: "González, V.M. & Mark, G. (2004). Constant, constant, multi-tasking craziness: Managing multiple working spheres. *CHI 2004 Proceedings*, 113-120.",
    scholarUrl: "https://scholar.google.com/scholar?q=Constant+multi-tasking+managing+multiple+working+spheres+Gonzalez+Mark+2004+CHI",
  },
  "小さなリスクテイキングを1つ実践": {
    evidence: "Bandura, A. (1997). *Self-efficacy: The Exercise of Control*. W.H. Freeman. / Dweck, C.S. (2006). *Mindset: The New Psychology of Success*. Random House.",
    scholarUrl: "https://scholar.google.com/scholar?q=Self-efficacy+exercise+of+control+Bandura+1997",
  },

  // 習慣化
  "セルフ・コンコーダンス：内的動機を確認": {
    evidence: "Sheldon, K.M. & Elliot, A.J. (1999). Goal striving, need satisfaction, and longitudinal well-being: The self-concordance model. *Journal of Personality and Social Psychology*, 76(3), 482-497.",
    scholarUrl: "https://scholar.google.com/scholar?q=Goal+striving+need+satisfaction+longitudinal+well-being+self-concordance+Sheldon+Elliot+1999",
  },
  "実行意図を設定する（いつ・どこで・何を）": {
    evidence: "Gollwitzer, P.M. & Sheeran, P. (2006). Implementation intentions and goal achievement: A meta-analysis of effects and processes. *Advances in Experimental Social Psychology*, 38, 69-119.",
    scholarUrl: "https://scholar.google.com/scholar?q=Implementation+intentions+goal+achievement+meta-analysis+Gollwitzer+Sheeran+2006",
  },
  "スタック習慣：既存習慣に新習慣を連結": {
    evidence: "Clear, J. (2018). *Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones*. Avery.",
    scholarUrl: "https://scholar.google.com/scholar?q=Atomic+Habits+Easy+Proven+Way+Build+Good+Habits+Break+Bad+Ones+Clear+2018",
  },
  "Attention Ecosystemを設計する": {
    evidence: "Newport, C. (2016). *Deep Work: Rules for Focused Success in a Distracted World*. Grand Central Publishing. / Mark, G. et al. (2008). The cost of interrupted work. *CHI 2008*, 107-110.",
    scholarUrl: "https://scholar.google.com/scholar?q=cost+interrupted+work+more+speed+more+stress+Mark+2008+CHI",
  },
  "1%改善の原則：微小改善を毎日積み重ねる": {
    evidence: "Clear, J. (2018). *Atomic Habits*. Avery. / Moran, G. et al. (2012). A systematic review of goal attainment scaling. *International Journal of Rehabilitation Research*, 35(3).",
    scholarUrl: "https://scholar.google.com/scholar?q=Atomic+Habits+1+percent+improvement+marginal+gains+Clear+2018",
  },
};

async function main() {
  let updated = 0;
  let notFound = 0;

  for (const [title, { evidence, scholarUrl }] of Object.entries(updates)) {
    const card = await prisma.actionCard.findFirst({ where: { title } });

    if (!card) {
      console.log(`⚠️  Not found: ${title}`);
      notFound++;
      continue;
    }

    const evidenceWithLink = `${evidence}\n\n[🔗 Google Scholarで論文を見る](${scholarUrl})`;

    await prisma.actionCard.update({
      where: { id: card.id },
      data: { evidence: evidenceWithLink },
    });

    console.log(`✅ ${title.slice(0, 30)}...`);
    updated++;
  }

  console.log(`\n完了: ${updated}件更新, ${notFound}件未検出`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
