import { averageScore, toFixedScore } from "./rating.js";

export function buildExtraction(item) {
  const score = toFixedScore(averageScore(item));
  const comments = item.ratings
    .map((rating, index) => `${index + 1}. ${rating.createdBy || "匿名"}：${rating.comment}`)
    .join("\n");
  const methodName = item.categories[0] || "自媒體方法";
  const audience = item.tags.includes("保險業可用") ? "保險業務員與個人品牌經營者" : "自媒體同學會成員";

  return `# ${item.title}

> 來源：${item.url || item.sourceFileName || "手動投稿"}
> 平均分：${score}
> 主分類：${item.categories.join("、")}
> 建議存放：DEMO CLAUDE / wiki / concepts

## 一、內容定位
這筆內容適合沉澱成「${methodName}」相關的方法論。它的價值不是單純好看，而是可以被同學會成員拿來拆解、模仿、改寫並放進自己的自媒體流程。

## 二、核心方法
1. 先指出受眾正在卡住的具體問題。
2. 用一個明確案例或反差開場，讓觀眾知道這不是空泛觀念。
3. 拆成 3 個可執行步驟，降低模仿門檻。
4. 收尾導向互動、私訊、收藏或下一步行動。

## 三、可模仿腳本
開場：
「很多人以為做自媒體是要一直拍影片，但真正重要的是你有沒有把一個方法講到別人聽得懂。」

中段：
「你可以照這三步拆：第一，先說痛點；第二，給一個真實案例；第三，給對方一個今天就能用的小動作。」

收尾：
「如果你也想把專業變成可複製的內容，可以先收藏這支，下一次拍片就照這個框架改。」

## 四、PPT 大綱
1. 封面：${methodName} 拆解
2. 問題：為什麼好內容很難被複製
3. 案例：這筆內容的有效之處
4. 框架：可模仿的 3 步流程
5. 練習：把自己的專業改成一支短影音
6. 收尾：從內容收藏變成方法庫

## 五、適用對象
${audience}

## 六、同學會評語
${comments || "尚未累積文字評語。"}

## 七、原始投稿理由
${item.reason}

## 八、補充摘要
${item.notes || "尚無補充摘要。"}
`;
}
