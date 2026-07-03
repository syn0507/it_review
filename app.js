// ============================================================
// 設定：Supabaseの値に書き換えてください
// ============================================================
const SUPABASE_URL = 'https://wvhwxpookqktbzfofxcy.supabase.co';       // 例: https://xxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2aHd4cG9va3FrdGJ6Zm9meGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzM4ODAsImV4cCI6MjA5NjY0OTg4MH0.wzKen3asNkQ0zttVvUnpzmJZRUjTf7fzHBd3Go23ptE'; // anon publicキー
const ADMIN_PASSWORD = 'Shitan21@';             // 管理者パスワード（任意で変更）

// ============================================================
// Supabase初期化
// ============================================================
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// 診断データ定義
// ============================================================
const SCATS = [
  { id: 'asset',  name: '資産管理',     icon: '🖥️' },
  { id: 'sec',    name: 'セキュリティ', icon: '🛡️' },
  { id: 'backup', name: 'バックアップ', icon: '☁️' },
  { id: 'lic',    name: 'ライセンス',   icon: '📄' },
  { id: 'dx',     name: '書類・DX',     icon: '📂' },
];

const SQS = [
  { cat:'asset', q:'PC・スマートフォン・タブレットなど社内のIT機器を一覧で把握できていますか？', hint:'台数・型番・担当者の割り当てが管理されているかどうかが目安です。', opts:['台帳やシステムで管理できている','Excelで管理しているが古いかもしれない','担当者の記憶頼みになっている','特に管理していない'], sc:[3,2,1,0],
    actions:['','半年に1回、棚卸しして台帳を最新化する運用を決めましょう','今すぐ全機器をリストアップし、台帳（Excel等）に書き出しましょう','まず社内のPC・スマホ・タブレットを1台ずつ数えるところから始めましょう'] },
  { cat:'asset', q:'退職者のアカウント（メール・各種クラウドサービス）は速やかに削除・無効化できていますか？', opts:['手順が決まっており速やかに対応できる','都度対応しているが漏れが心配','対応が遅れることがある','管理できていない'], sc:[3,2,1,0],
    actions:['','退職時のチェックリストを作り、確認漏れを防ぎましょう','退職日当日にアカウント削除する運用に変更しましょう','退職者の利用していたサービス一覧を今すぐ洗い出しましょう'] },
  { cat:'asset', q:'社員が使うPCのOSやアプリは定期的にアップデートされていますか？', opts:['自動更新などで常に最新化できている','ある程度対応している','バラバラで把握できていない','ほとんど更新していない'], sc:[3,2,1,0],
    actions:['','自動更新の設定を全PCで統一しましょう','アップデート状況を確認する仕組み（月1回の確認等）を作りましょう','セキュリティリスクが高いため、まず重要なPCから更新しましょう'] },
  { cat:'asset', q:'会社のWi-Fiルーターやネットワーク機器は把握・管理できていますか？', opts:['機器一覧があり管理できている','おおよそ把握している','よくわからない','管理できていない'], sc:[3,2,1,0],
    actions:['','ネットワーク機器の一覧と設置場所を記録しましょう','配線・機器を確認し、簡単な構成図を作りましょう','まず社内にあるルーター・スイッチの台数を確認しましょう'] },
  { cat:'asset', q:'IT機器の購入・廃棄のルールや手順が決まっていますか？', opts:['ルールが明確にある','なんとなく決まっている','担当者任せになっている','特にルールはない'], sc:[3,2,1,0],
    actions:['','購入申請・廃棄手順を文書化しましょう','誰が承認するか、ルールを明確にしましょう','機器購入時の簡単な承認フローだけでも決めましょう'] },
  { cat:'sec', q:'社員が使うPCにウイルス対策ソフトは導入されていますか？', opts:['全台に導入・有効期限も管理している','一部は導入している','導入しているか不明','導入していない'], sc:[3,2,1,0],
    actions:['','未導入のPCを洗い出し、優先的に導入しましょう','全PCの状況を確認しましょう','重大リスクのため、最優先で導入を検討しましょう'] },
  { cat:'sec', q:'業務上重要なシステムやサービスのパスワードは安全に管理されていますか？', hint:'付箋・共有メモ・使い回し等は要注意です。', opts:['パスワードマネージャー等で管理している','ある程度ルールがある','担当者任せで共有方法が曖昧','付箋や共有スプレッドシートに書いている'], sc:[3,2,1,0],
    actions:['','パスワードマネージャーの導入を検討しましょう','パスワード共有のルールを文書化しましょう','危険な状態です。今すぐ付箋を撤去し、管理方法を見直しましょう'] },
  { cat:'sec', q:'業務データや情報の持ち出しルール（USBメモリ・クラウド利用等）はありますか？', opts:['明確なルールがある','なんとなくのルールはある','ルールがあいまい','特にルールはない'], sc:[3,2,1,0],
    actions:['','USBメモリ・クラウド利用のルールを文書化しましょう','持ち出し可否の基準を明確にしましょう','機密情報の持ち出しルールを最低限決めましょう'] },
  { cat:'sec', q:'不審なメールや添付ファイルへの対応についてスタッフに周知できていますか？', opts:['定期的に研修・周知している','一度は説明したことがある','あまり周知できていない','特に対応していない'], sc:[3,2,1,0],
    actions:['','定期的な注意喚起（年1〜2回）の仕組みを作りましょう','簡単な注意点をまとめて共有しましょう','不審メールの典型例を社内共有しましょう'] },
  { cat:'sec', q:'万が一セキュリティ事故が起きたときの連絡・対応フローは決まっていますか？', opts:['マニュアルや連絡先が整備されている','おおよそは決まっている','ほぼ決まっていない','まったく決まっていない'], sc:[3,2,1,0],
    actions:['','連絡先・対応手順を文書化しましょう','緊急連絡網だけでも整備しましょう','「何かあったら誰に連絡するか」だけ今すぐ決めましょう'] },
  { cat:'backup', q:'会社の重要データはバックアップを取っていますか？', opts:['自動バックアップで定期的に取れている','手動で時々取っている','たまに取るが不定期','バックアップを取っていない'], sc:[3,2,1,0],
    actions:['','自動バックアップに切り替えましょう','バックアップの頻度・タイミングを決めましょう','最優先で重要データのバックアップを始めましょう'] },
  { cat:'backup', q:'バックアップデータから実際に復元できるか確認（テスト）したことがありますか？', opts:['定期的にテスト復元している','一度は試したことがある','試したことはない','バックアップ自体していない'], sc:[3,2,1,0],
    actions:['','年1回の復元テストを習慣化しましょう','一度、実際に復元できるか試してみましょう','まずバックアップを開始しましょう'] },
  { cat:'backup', q:'バックアップデータは元データと別の場所（クラウドや別拠点）に保管していますか？', opts:['別の場所に保管している','同じPC・サーバー内に保存している','わからない','バックアップしていない'], sc:[3,2,1,0],
    actions:['','別の場所（クラウド・外部HDD）に複製しましょう','バックアップの保存先を確認しましょう','まずバックアップを開始しましょう'] },
  { cat:'backup', q:'基幹システムやファイルサーバーが突然使えなくなった場合、業務をどう継続するか決まっていますか？', opts:['BCP・対応手順が決まっている','なんとなく決まっている','ほぼ決まっていない','考えたことがない'], sc:[3,2,1,0],
    actions:['','対応手順を簡単に文書化しましょう','最低限の連絡フローだけ決めましょう','「システムが止まったらどうするか」を一度話し合いましょう'] },
  { cat:'backup', q:'クラウドサービス（Google Workspace・Microsoft 365等）のデータもバックアップしていますか？', opts:['別途バックアップツールで対応している','クラウド任せにしている（バックアップなし）','クラウドサービス自体使っていない','わからない'], sc:[3,2,1,0],
    actions:['','クラウド側は誤削除等を保護しないため、別途バックアップを検討しましょう','',  '利用中のクラウドサービスのバックアップ機能を確認しましょう'] },
  { cat:'lic', q:'会社で使用しているソフトウェアのライセンスを一覧で管理していますか？', opts:['ライセンス台帳があり管理している','おおよそ把握している','担当者任せで把握できていない','特に管理していない'], sc:[3,2,1,0],
    actions:['','ライセンス一覧表を作成し、最新化しましょう','今使っているソフトを全て洗い出しましょう','まず主要なソフトだけでもリスト化しましょう'] },
  { cat:'lic', q:'ライセンスの更新期限を把握・管理できていますか？', opts:['期限管理ができており更新漏れはない','都度確認しているが不安がある','期限切れに気づかないことがある','管理できていない'], sc:[3,2,1,0],
    actions:['','更新期限のカレンダー登録・アラート設定をしましょう','更新管理の仕組みを今すぐ作りましょう','主要な契約だけでも期限を確認しましょう'] },
  { cat:'lic', q:'退職者のSaaSアカウント（Adobe、Slack等）のライセンス解放を適切に行っていますか？', opts:['ルールに基づき適切に対応できている','都度対応しているが漏れが心配','よく見落とすことがある','管理できていない'], sc:[3,2,1,0],
    actions:['','退職時のチェックリストにライセンス確認を追加しましょう','退職者対応フローを見直しましょう','現在のアカウント保有者を一度洗い出しましょう'] },
  { cat:'lic', q:'無料トライアルで始めたサービスが有料課金に切り替わっていないか把握できていますか？', opts:['契約サービスを一覧管理している','大きいものは把握している','あまり把握できていない','まったく把握できていない'], sc:[3,2,1,0],
    actions:['','小規模なサービスも含めて契約一覧を作りましょう','クレジットカードの請求を確認し、契約中のサービスを洗い出しましょう','不要な課金がないか、今すぐ確認しましょう'] },
  { cat:'lic', q:'サポートが終了したソフトウェア（Windows旧バージョン等）を使い続けていませんか？', opts:['最新・サポート内のものを使っている','ほぼ問題ない','一部使い続けている','よくわからない'], sc:[3,2,1,0],
    actions:['','念のため主要ソフトのサポート期限を確認しましょう','セキュリティリスクがあるため、リプレース計画を立てましょう','使用中のOS・ソフトのバージョンを確認しましょう'] },
  { cat:'dx', q:'契約書・注文書・見積書などの書類は紙で保管していますか？', opts:['すべてデジタルで管理している','一部デジタル化している','ほとんど紙で保管している','紙とデジタルが混在して把握しにくい'], sc:[3,2,1,0],
    actions:['','残りの紙書類もデジタル化を進めましょう','スキャンしてデジタル保管する仕組みを作りましょう','まず保管場所を一元化しましょう'] },
  { cat:'dx', q:'契約の更新期限や満了日を手動（カレンダー・Excel等）で管理していますか？', opts:['契約管理ツールを使って一元管理している','Excelやカレンダーで管理している','担当者の記憶や付箋に頼っている','特に管理していない'], sc:[3,2,1,0],
    actions:['','リマインダー機能のあるツールに移行しましょう','期限一覧表を今すぐ作りましょう','主要な契約だけでも期限を確認しましょう'] },
  { cat:'dx', q:'領収書・経費精算は紙で行っていますか？', opts:['電子申請・クラウド経費システムを使っている','一部デジタル化している','ほぼ紙で行っている','よくわからない'], sc:[3,2,1,0],
    actions:['','残りの紙運用もデジタル化を検討しましょう','クラウド経費精算ツールの導入を検討しましょう','現在の経費精算フローを一度確認しましょう'] },
  { cat:'dx', q:'社内の申請・承認（休暇・購入等）はメールや紙で行っていますか？', opts:['ワークフローシステムで電子化している','一部メール・チャットで対応','ほぼ紙や口頭','システムがなく属人的'], sc:[3,2,1,0],
    actions:['','承認記録が残る仕組みに統一しましょう','申請・承認の流れを書き出しましょう','まず誰が何を承認しているか整理しましょう'] },
  { cat:'dx', q:'取引先とのやり取り（見積書・請求書送付等）を電子化できていますか？', opts:['電子取引で完結している','一部電子化している','ほぼ郵送・FAX','まったく電子化していない'], sc:[3,2,1,0],
    actions:['','残りの取引先にも電子化を提案しましょう','電子化できる取引先から優先的に切り替えましょう','取引先との連絡方法を一度見直しましょう'] },
];

const OT_CATS = [
  { id: 'ot_asset',  name: '資産・可視化',     icon: '🏭' },
  { id: 'ot_net',    name: 'ネットワーク分離', icon: '🔌' },
  { id: 'ot_cont',   name: '運用継続・復旧',   icon: '⚙️' },
  { id: 'ot_vendor', name: 'ベンダー・保守',   icon: '🔧' },
  { id: 'ot_org',    name: '組織・教育',       icon: '👷' },
];

const OQS = [
  { cat:'ot_asset', q:'工場・拠点内のPLC・SCADA・センサー等の制御機器を、機種・IPアドレス・設置場所まで一覧で把握できていますか？', hint:'制御機器の「棚卸ができているか」が最初のチェックポイントです。',
    opts:['台帳やシステムで詳細まで管理している','Excel等で大まかに把握している','主要な設備のみ把握している','ほとんど把握できていない'], sc:[3,2,1,0],
    risk:['','棚卸の精度が粗いと、障害時に機器特定へ時間がかかります','把握漏れの機器が攻撃の侵入口や単一障害点になり得ます','制御機器の全体像が不明で、影響範囲の特定ができないまま対応することになります'] },
  { cat:'ot_asset', q:'制御システムに接続する外部機器（保守用PC・USBメモリ・リモート端末等）の持ち込み・接続を把握・管理していますか？',
    opts:['接続の都度、申請・記録する運用がある','大きな機器のみ把握している','現場任せで実態を把握していない','まったく管理していない'], sc:[3,2,1,0],
    risk:['','記録の抜け漏れが原因特定を難しくする場合があります','管理外の機器がマルウェア持ち込みの経路になり得ます','外部機器を通じた感染・不正操作を検知できない状態です'] },
  { cat:'ot_asset', q:'制御機器のOS・ファームウェアのバージョンや、メーカーサポート終了時期（EOL）を把握していますか？',
    opts:['バージョン・EOL情報を一覧で管理している','主要機器のみ把握している','導入時の情報のみで更新していない','把握していない'], sc:[3,2,1,0],
    risk:['','情報が古いと更新計画の精度が下がります','サポート切れ機器を知らずに使い続けるリスクがあります','既知の脆弱性が残ったまま長期間稼働している可能性があります'] },
  { cat:'ot_asset', q:'制御ネットワークに接続されている機器の中に、インターネットへ直接接続されているものがないか確認したことがありますか？',
    opts:['定期的に確認し、直接接続はない','過去に一度確認したことがある','確認したことがない','わからない（把握していない）'], sc:[3,2,1,0],
    risk:['','定期確認がないと構成変化に気づけません','把握していない期間に構成が変わっている可能性があります','外部から直接到達可能な制御機器が存在するかもしれません'] },
  { cat:'ot_asset', q:'新しい制御機器・センサーを導入する際、資産台帳への登録や記録が徹底されていますか？',
    opts:['導入時に必ず登録するルールが定着している','だいたい登録されている','担当者の判断に委ねられている','特にルールはない'], sc:[3,2,1,0],
    risk:['','登録漏れが積み重なると台帳の精度が徐々に低下します','機器種別によって登録有無にばらつきが出ます','台帳と実態が乖離し、把握している資産の信頼性が下がります'] },

  { cat:'ot_net', q:'OT（制御系）ネットワークとIT（情報系）ネットワークは、物理的または論理的に分離されていますか？',
    opts:['明確に分離され、境界も設計書で確認できる','分離しているはずだが設計書は古い/ない','一部の経路で接続されている','分離されておらず同一ネットワークとして運用している'], sc:[3,2,1,0],
    risk:['','設計書がないと分離状態の検証・維持が難しくなります','意図しない経路が抜け道になる可能性があります','IT側の侵害がそのままOT側に波及するリスクがあります'] },
  { cat:'ot_net', q:'OT・ITネットワークの境界に、ファイアウォール等のアクセス制御機器を設置していますか？',
    opts:['設置し、通信ルールも定期的に見直している','設置しているが設定の見直しはしていない','簡易的なルーターのみで制御は限定的','設置していない'], sc:[3,2,1,0],
    risk:['','ルールが古いと不要な通信を許可したままになりがちです','限定的な制御では想定外の通信を防ぎきれません','境界防御がなく、侵入時に制御系まで一気に到達され得ます'] },
  { cat:'ot_net', q:'ベンダーや保守員が制御システムへリモートアクセスする際の経路・権限は管理されていますか？', hint:'常時接続のVPNや共有パスワードでの接続が残っていないかがポイントです。',
    opts:['都度申請・許可制で、接続後は無効化している','許可制だが常時接続を許可している回線がある','ベンダー側の裁量に任せている','リモート接続の実態を把握していない'], sc:[3,2,1,0],
    risk:['','常時接続の回線は攻撃の常設の侵入経路になり得ます','ベンダー任せだと社内側で異常に気づけません','リモート経路自体を把握できておらず、最大のリスク要因になっている可能性があります'] },
  { cat:'ot_net', q:'制御システムへのログイン認証は、個人単位のID/パスワードで行われていますか？（共有アカウントの有無）',
    opts:['個人ID管理を徹底している','一部で共有アカウントがある','現場では共有アカウントが常態化している','認証自体を設定していない機器がある'], sc:[3,2,1,0],
    risk:['','一部の共有でも操作主体の特定が難しくなる場面があります','共有アカウントの常態化は不正操作の追跡を困難にします','認証がない機器は誰でも操作できる状態にあります'] },
  { cat:'ot_net', q:'制御ネットワーク内の通信ログ・アクセスログを取得し、確認できる体制がありますか？',
    opts:['取得・定期確認の仕組みがある','取得はしているが確認は不定期','一部機器のみログを取得している','ログを取得していない'], sc:[3,2,1,0],
    risk:['','不定期確認では異常の発見が遅れます','取得範囲外の機器で異常があっても気づけません','ログがないため、事後の原因調査ができない状態です'] },

  { cat:'ot_cont', q:'制御システムの設定情報・プログラム（PLCロジック等）のバックアップを取得していますか？',
    opts:['定期的に取得し、世代管理もしている','導入時に一度取得したのみ','担当者の端末に個別に保存されている','取得していない'], sc:[3,2,1,0],
    risk:['','古いバックアップは復旧時に現状と食い違うおそれがあります','個人管理では紛失・散逸のリスクがあります','設定喪失時にゼロから再構築が必要になるおそれがあります'] },
  { cat:'ot_cont', q:'バックアップから実際に制御システムを復元できるか、テストしたことがありますか？',
    opts:['定期的に復元テストをしている','過去に一度試したことがある','試したことはない','バックアップ自体していない'], sc:[3,2,1,0],
    risk:['','テスト頻度が低いと復元手順の陳腐化に気づけません','未テストのバックアップは復元できない可能性があります','有事の際に復旧できない可能性が高い状態です'] },
  { cat:'ot_cont', q:'サイバー攻撃や制御システム障害により生産ラインが停止した場合の対応手順（BCP）は整備されていますか？',
    opts:['手順書があり、訓練も実施している','手順書はあるが訓練はしていない','口頭での申し合わせ程度','手順自体が存在しない'], sc:[3,2,1,0],
    risk:['','訓練がないと実際の対応で手順通りに動けない可能性があります','口頭のみでは担当者不在時に対応が滞ります','停止時の対応が場当たり的になり、復旧が長期化するおそれがあります'] },
  { cat:'ot_cont', q:'生産設備の冗長化（予備機・代替手段）は検討・実施されていますか？',
    opts:['重要設備は冗長化・代替手段を確保している','一部の設備のみ検討済み','検討したことはあるが未実施','検討したことがない'], sc:[3,2,1,0],
    risk:['','未対応の設備は依然として単一障害点です','未実施のままでは検討が形骸化するおそれがあります','単一障害点が多く、停止時の影響が広範囲に及ぶ可能性があります'] },
  { cat:'ot_cont', q:'セキュリティインシデントや異常発生時に、安全側（フェイルセーフ）に停止できる設計・運用になっていますか？',
    opts:['安全側停止の設計・運用ルールが明確','一部設備のみ確認できている','設計思想として意識されていない','わからない'], sc:[3,2,1,0],
    risk:['','未確認の設備で挙動が想定と異なる可能性があります','意識されていない場合、異常時に危険側への挙動リスクがあります','安全側停止が担保されておらず、人身・設備への重大な影響につながるおそれがあります'] },

  { cat:'ot_vendor', q:'制御システムの保守・改修を行う外部ベンダーとの契約で、責任範囲やセキュリティ要件が明確になっていますか？',
    opts:['契約書に明記され、定期的に見直している','契約はあるがセキュリティ要件は曖昧','口頭・慣例での取引が中心','契約書自体が存在しない'], sc:[3,2,1,0],
    risk:['','見直しがないと現状の脅威に契約内容が追いつかなくなります','要件が曖昧だとインシデント時の責任分界が不明確になります','契約がないため、トラブル時に対応を求める根拠がありません'] },
  { cat:'ot_vendor', q:'ベンダーが制御システムに変更を加える際の承認・変更管理プロセスはありますか？',
    opts:['承認フロー・変更記録が徹底されている','大きな変更のみ承認を得ている','ベンダーの判断に任せている','特にプロセスはない'], sc:[3,2,1,0],
    risk:['','小さな変更の積み重ねが把握外の構成変化を生みます','任せきりだと意図しない設定変更に気づけません','無断の変更が脆弱性や誤動作の原因になり得ます'] },
  { cat:'ot_vendor', q:'制御システムのセキュリティパッチ適用について、ベンダーと事前に影響確認・計画するプロセスがありますか？', hint:'OTでは稼働影響を理由にパッチが長期未適用のまま放置されがちな点が注意点です。',
    opts:['影響確認のうえ計画的に適用している','必要性は認識しているが後回しになりがち','ベンダー任せで社内では把握していない','パッチ適用自体を行っていない'], sc:[3,2,1,0],
    risk:['','後回しが続くと未適用期間が長期化します','社内で把握できないと適用状況の説明ができません','既知の脆弱性が放置され続けている可能性が高い状態です'] },
  { cat:'ot_vendor', q:'保守員・外部業者の入退室や作業内容の記録を管理していますか？',
    opts:['入退室・作業記録を一元管理している','入退室記録のみ管理している','特定の現場でのみ記録がある','記録していない'], sc:[3,2,1,0],
    risk:['','作業内容が記録されないと変更点の追跡ができません','現場によって記録有無がばらつくと管理の抜けが生じます','誰がいつ何をしたか説明できない状態です'] },
  { cat:'ot_vendor', q:'特定のベンダー・担当者にしか制御システムの構成や設定内容がわからない、属人化した状態になっていませんか？',
    opts:['複数名・複数社で内容を把握できている','主担当は決まっているが引継ぎ資料はある','特定の1名・1社に強く依存している','誰も全体像を把握できていない'], sc:[3,2,1,0],
    risk:['','引継ぎ資料があっても実運用の詳細は口伝の場合があります','特定個人・企業の離脱で対応不能になるリスクがあります','制御システムの全体像を把握する者がおらず、重大障害時に復旧手段を失うおそれがあります'] },

  { cat:'ot_org', q:'OT（制御システム）のセキュリティを誰が責任者として管理するか、組織上明確になっていますか？',
    opts:['責任者・役割分担が明文化されている','なんとなく決まっている','IT部門と生産部門の間で押し付け合いになりがち','責任の所在が誰にもない'], sc:[3,2,1,0],
    risk:['','明文化されていないと有事の意思決定が遅れます','押し付け合いの状態では平時の対策も進みません','責任者不在のため、リスクへの投資判断自体がなされない状態です'] },
  { cat:'ot_org', q:'現場の運転員・作業員に対し、不審なUSBメモリの使用禁止等、OT特有のセキュリティ教育を行っていますか？',
    opts:['定期的に実践的な教育を行っている','入社時など一度きりの説明のみ','資料配布のみで説明はしていない','教育を行っていない'], sc:[3,2,1,0],
    risk:['','一度きりの教育は形骸化しやすいです','資料配布のみでは実際の行動につながりにくいです','現場の理解が乏しく、ヒューマンエラー由来のインシデントが起きやすい状態です'] },
  { cat:'ot_org', q:'OTセキュリティインシデントを発見した際の報告フロー・連絡先は現場に周知されていますか？',
    opts:['フロー・連絡先が現場に掲示・周知されている','管理者は把握しているが現場への周知は薄い','明確なフローがない','わからない'], sc:[3,2,1,0],
    risk:['','周知が薄いと発見時の初動が遅れます','フローがないと現場の判断で対応が左右されます','異常の発見から報告までに大きな遅れが生じるおそれがあります'] },
  { cat:'ot_org', q:'IT部門と生産・現場部門の間で、セキュリティに関する情報共有や連携の場が定期的にありますか？',
    opts:['定期的な会議体・連携の場がある','必要に応じて都度連携している','ほとんど接点がない','連携の仕組みが存在しない'], sc:[3,2,1,0],
    risk:['','都度対応では重要な情報が抜け落ちることがあります','接点が少ないとIT側の知見がOTに活かされません','部門間の断絶により、対策の全体最適が図れない状態です'] },
  { cat:'ot_org', q:'経営層はOT（制御システム）のセキュリティリスクを、事業継続に関わるリスクとして認識・関与していますか？',
    opts:['経営課題として認識し、投資判断に関与している','報告は受けているが関与は限定的','現場任せで経営層への報告がない','経営層の認識がない'], sc:[3,2,1,0],
    risk:['','関与が限定的だと必要な投資判断が遅れがちです','経営層に届かない情報は予算化されません','事業継続に直結するリスクが経営レベルで把握されていない状態です'] },
];

// OT診断の結果テキスト：カテゴリ×スコア段階（ok/mid/ng）ごとに
// 「リスク把握」「運用ポリシー策定の視点」「リスクとの向き合い方」の3種を定義
const OT_RESULT = {
  ot_asset: {
    risk:   { ok:'制御機器の可視化は概ねできています。今後は変更が生じた際の台帳更新を継続することが重要です。',
              mid:'主要機器は把握できているものの、細部や周辺機器の情報が古くなっている可能性があります。攻撃や障害の起点になり得る「見えていない機器」がまだ残っていると考えられます。',
              ng:'制御機器の全体像が把握できておらず、インシデント発生時に影響範囲の特定ができないリスクが高い状態です。まず「何がどこにあるか」を把握することが最優先課題です。' },
    policy: { ok:'棚卸の頻度・更新トリガー（機器追加・更新時）をルール化し、台帳の正確性を維持する運用ポリシーを明文化しておきましょう。',
              mid:'まずは「新規導入時は必ず台帳登録する」というルールを明文化し、既存機器についても半年〜年1回の棚卸サイクルを運用ポリシーとして定めることが有効です。',
              ng:'完璧な台帳を目指す前に、「重要度の高い設備から棚卸を始める」という優先順位付けの方針を最初のポリシーとして定めましょう。' },
    stance: { ok:'把握できている前提のもと、定期的な妥当性確認（現物確認）を組み込み、台帳と実態の乖離を早期に検知する運用に発展させましょう。',
              mid:'完全な可視化には時間がかかるため、「重要設備から優先的に把握する」というリスクベースのアプローチで、段階的に精度を高める向き合い方が現実的です。',
              ng:'すぐに全設備を把握するのは難しいため、まず生産に直結する重要設備を特定し、そこだけでも確実に把握するという「小さく始める」姿勢で着手することをおすすめします。' } },
  ot_net: {
    risk:   { ok:'IT/OT間の分離は概ね機能しています。設定変更や新規接続の際に分離状態が崩れていないか、継続的な検証が課題です。',
              mid:'分離の仕組みはあるものの、設定の形骸化や想定外の経路が生じている可能性があります。IT側のインシデントがOT側に波及する経路が残っているかもしれません。',
              ng:'IT/OTネットワークの分離が不十分で、IT側で発生したセキュリティインシデントがそのまま制御システムに波及するリスクが高い状態です。' },
    policy: { ok:'境界の通信ルールを定期的に棚卸し、不要な許可設定を削除する見直しサイクルをポリシーとして定着させましょう。',
              mid:'IT-OT間の通信は「原則禁止・必要な通信のみ許可」というホワイトリスト方式の方針を定め、リモートアクセスは都度申請制とするポリシーの整備が有効です。',
              ng:'まずは「制御系ネットワークは業務ネットワークと分離する」という原則を経営層も含めて合意し、最低限の境界（ファイアウォール等）を設ける方針を最優先で定めましょう。' },
    stance: { ok:'分離ができている前提で、境界機器のログを継続的に監視し、異常な通信の兆候を早期に検知する体制へ発展させましょう。',
              mid:'完全な分離が難しい部分は、リモートアクセスの都度許可・時間制限などの「使う時だけ開ける」運用で残存リスクを管理する向き合い方が現実的です。',
              ng:'分離をすぐに実現するのは投資も時間もかかるため、暫定的にリモートアクセス経路の把握と制限だけでも先行して着手し、リスクを段階的に下げていく姿勢が重要です。' } },
  ot_cont: {
    risk:   { ok:'バックアップ・BCPの備えは概ねできています。訓練を継続し、実効性を維持できるかが今後の焦点です。',
              mid:'バックアップや手順は存在するものの、実際に機能するか検証されていない可能性があります。有事の際に「あるはずのものが使えない」事態が起こり得ます。',
              ng:'障害・攻撃発生時に復旧できる備えがほとんどなく、生産停止が長期化するリスクが高い状態です。' },
    policy: { ok:'復旧テストを年1回以上実施することをルール化し、結果を経営層にも報告する運用ポリシーとして定着させましょう。',
              mid:'「バックアップは取得するだけでなく年1回は復元テストを行う」という運用ポリシーを明文化し、BCP文書の定期更新サイクルも定めましょう。',
              ng:'まず重要設備を特定し、その設定・プログラムのバックアップを取得するルールを最優先で定めることが出発点です。' },
    stance: { ok:'備えがある前提で、実際の障害シナリオを想定した訓練を重ね、想定外のパターンにも対応できる体制へ発展させましょう。',
              mid:'全設備を一度に対応するのは難しいため、生産影響の大きい設備から順にバックアップ・復旧手順を検証していく段階的な向き合い方が現実的です。',
              ng:'完璧な備えを最初から目指すのではなく、「止まったら困る設備トップ3」から着手するなど、小さく始めてリスクを下げていく姿勢が重要です。' } },
  ot_vendor: {
    risk:   { ok:'ベンダー管理は概ね整備されています。契約内容が実態と乖離しないよう、定期的な見直しが今後の課題です。',
              mid:'契約や変更管理の枠組みはあるものの、実際の運用がベンダー任せになっている部分があり、把握外の変更が生じるリスクがあります。',
              ng:'ベンダーへの依存度が高く、契約・変更管理・パッチ適用のいずれも社内で統制できていないリスクの高い状態です。' },
    policy: { ok:'ベンダー契約の定期レビュー（年1回等）と、セキュリティ要件の契約への明記をルール化し、複数社との関係を維持する方針を定めましょう。',
              mid:'ベンダーによる変更は事前申請・事後報告を必須とする変更管理ポリシーを定め、パッチ適用も「影響確認→計画→適用」のプロセスを明文化しましょう。',
              ng:'まず主要ベンダーとの契約書を確認・締結し、責任範囲とセキュリティ要件を明記することを最優先の方針としましょう。' },
    stance: { ok:'ベンダー管理ができている前提で、特定企業・担当者への過度な依存が生じていないか定期的に点検する運用へ発展させましょう。',
              mid:'パッチ未適用等の残存リスクは、ネットワーク側での監視強化など「パッチが当たらない前提での代替対策」で補う向き合い方が現実的です。',
              ng:'全てのベンダーを一度に統制するのは難しいため、最も重要な制御システムを担当するベンダーから優先的に契約・体制を整理していく姿勢が重要です。' } },
  ot_org: {
    risk:   { ok:'組織的な体制・教育は概ね機能しています。形骸化しないよう、継続的な改善サイクルの維持が今後の課題です。',
              mid:'責任体制や教育の枠組みはあるものの、現場への浸透や経営層の関与が十分でない可能性があり、有事の初動対応に遅れが生じるリスクがあります。',
              ng:'OTセキュリティの責任所在が不明確で、現場への教育も行き届いておらず、インシデントの発見・報告自体が遅れる高リスクな状態です。' },
    policy: { ok:'責任者・役割分担を定期的に見直し、IT部門と生産部門の連携会議を制度化する運用ポリシーとして維持しましょう。',
              mid:'OTセキュリティの責任者（IT部門か生産部門か、または共同か）を明文化し、現場教育を年1回以上の定例業務として位置づけるポリシー整備が有効です。',
              ng:'まず「誰がOTセキュリティに責任を持つか」を経営層を交えて決定することが、すべての土台となる最優先の方針です。' },
    stance: { ok:'体制ができている前提で、インシデント対応訓練を定期的に実施し、組織としての対応力を継続的に検証しましょう。',
              mid:'完全な体制構築には時間がかかるため、まずは報告フローの周知など「すぐできること」から着手し、並行して責任体制を固めていく向き合い方が現実的です。',
              ng:'組織的な対応は一朝一夕には進まないため、経営層への現状報告からスタートし、小さな一歩から関与を引き出していく姿勢が重要です。' } },
};

// ============================================================
// 状態管理
// ============================================================
let currentUser = null;
let sAnswers = {}, sCur = 0;
let oAnswers = {}, oCur = 0;
let radarChart = null;
let allResults = [];

// ============================================================
// 画面制御
// ============================================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function showAdminLogin() {
  showScreen('sc-admin-login');
  document.getElementById('admin-pw').value = '';
  document.getElementById('admin-err').style.display = 'none';
}

// ============================================================
// 企業情報入力
// ============================================================
function validateField(id, errMsg) {
  const el = document.getElementById(id);
  const val = el.value.trim();
  const wrap = el.parentElement;
  if (!val) {
    el.style.borderColor = 'var(--red)';
    let e = wrap.querySelector('.field-err');
    if (!e) { e = document.createElement('p'); e.className = 'field-err err-msg'; wrap.appendChild(e); }
    e.textContent = errMsg;
    return false;
  }
  el.style.borderColor = '';
  const e = wrap.querySelector('.field-err');
  if (e) e.remove();
  return true;
}

async function entryNext() {
  const company = document.getElementById('f-company').value.trim();

  let ok = true;
  if (!validateField('f-company', '会社名を入力してください')) ok = false;
  if (!validateField('f-size',    '従業員数を選択してください')) ok = false;
  if (!validateField('f-industry','業種を選択してください')) ok = false;
  if (!ok) return;

  document.getElementById('entry-err').style.display = 'none';

  currentUser = {
    name: company,  // 管理画面等での表示用
    company,
    email: '',
    employee_size: document.getElementById('f-size').value,
    industry:      document.getElementById('f-industry').value,
  };

  document.getElementById('banner-name').textContent = company;

  // formspreeで通知
  const FORMSPREE_URL = 'https://formspree.io/f/mykadwdl';
  try {
    await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        subject: '【IT診断】新規診断開始：' + company,
        company,
        employee_size: currentUser.employee_size,
        industry:      currentUser.industry,
        message: company + 'がIT診断を開始しました。\n従業員数：' + currentUser.employee_size + '\n業種：' + currentUser.industry,
      })
    });
  } catch(e) { /* 通知失敗しても診断は続行 */ }

  sAnswers = {}; sCur = 0; oAnswers = {}; oCur = 0;
  resetSimpleUI();
  resetOTUI();
  showScreen('sc-mode');
  switchMode('simple');
}


function goEntry() { showScreen('sc-entry'); }

// ============================================================
// モード切替
// ============================================================
function switchMode(m) {
  document.getElementById('tab-s').classList.toggle('active', m === 'simple');
  document.getElementById('tab-o').classList.toggle('active', m === 'ot');
  document.getElementById('mode-simple').style.display = m === 'simple' ? 'block' : 'none';
  document.getElementById('mode-ot').style.display = m === 'ot' ? 'block' : 'none';
}

function resetSimpleUI() {
  document.getElementById('ss-start').style.display = 'block';
  document.getElementById('ss-quiz').style.display = 'none';
  document.getElementById('ss-result').style.display = 'none';
}

function resetOTUI() {
  document.getElementById('os-start').style.display = 'block';
  document.getElementById('os-quiz').style.display = 'none';
  document.getElementById('os-result').style.display = 'none';
}

// ============================================================
// 簡易診断
// ============================================================
function sStart() {
  document.getElementById('ss-start').style.display = 'none';
  document.getElementById('ss-quiz').style.display = 'block';
  sRenderQ();
}

function sRenderQ() {
  const q = SQS[sCur];
  const pct = Math.round((sCur / SQS.length) * 100);
  document.getElementById('s-prog').style.width = pct + '%';
  const cat = SCATS.find(c => c.id === q.cat);
  document.getElementById('s-cat').textContent = cat.icon + ' ' + cat.name;
  document.getElementById('s-cat-label').textContent = cat.name;
  document.getElementById('s-q').textContent = q.q;
  const hint = document.getElementById('s-hint');
  if (q.hint) { hint.textContent = q.hint; hint.style.display = 'block'; }
  else hint.style.display = 'none';
  document.getElementById('s-num').textContent = (sCur + 1) + ' / ' + SQS.length;
  document.getElementById('s-back').disabled = sCur === 0;
  const saved = sAnswers[sCur];
  const c = document.getElementById('s-choices'); c.innerHTML = '';
  q.opts.forEach((o, i) => {
    const b = document.createElement('button');
    b.className = 'choice-btn' + (saved === i ? ' selected' : '');
    b.innerHTML = '<span class="choice-dot"></span>' + o;
    b.onclick = () => {
      sAnswers[sCur] = i;
      document.querySelectorAll('.choice-btn').forEach((x, j) => x.classList.toggle('selected', j === i));
      document.getElementById('s-next').disabled = false;
    };
    c.appendChild(b);
  });
  document.getElementById('s-next').disabled = saved === undefined;
  document.getElementById('s-next').textContent = sCur === SQS.length - 1 ? '結果を見る' : '次へ →';
}

function sBack() { if (sCur > 0) { sCur--; sRenderQ(); } }
function sNext() {
  if (sAnswers[sCur] === undefined) return;
  if (sCur < SQS.length - 1) { sCur++; sRenderQ(); }
  else sShowResult();
}

function calcSScores() {
  const catPct = {};
  SCATS.forEach(c => {
    const qs = SQS.filter(q => q.cat === c.id);
    const tot = qs.reduce((a, q) => { const idx = SQS.indexOf(q); return a + (q.sc[sAnswers[idx] ?? 0]); }, 0);
    catPct[c.id] = Math.round((tot / (qs.length * 3)) * 100);
  });
  return { catPct, total: Math.round(Object.values(catPct).reduce((a, b) => a + b) / SCATS.length) };
}

function sShowResult() {
  const { catPct, total } = calcSScores();
  const risk = total >= 75 ? '低リスク' : total >= 50 ? '中リスク' : '高リスク';
  const scoreColor = total >= 75 ? '#1D9E75' : total >= 50 ? '#BA7517' : '#E24B4A';
  const riskStyle = total >= 75
    ? 'color:#085041;background:#9FE1CB'
    : total >= 50 ? 'color:#412402;background:#FAC775'
    : 'color:#501313;background:#F7C1C1';

  saveResult('簡易診断', total, risk, catPct);

  const el = document.getElementById('ss-result');
  el.innerHTML = `
<div class="score-display">
  <p style="font-size:13px;color:var(--text-muted);margin-bottom:6px">総合スコア</p>
  <div class="score-num" style="color:${scoreColor}">${total}<span class="score-unit">点</span></div>
  <div class="risk-pill" style="${riskStyle}">${risk}</div>
  <p class="saved-note">✓ この結果は保存されました</p>
</div>
<div class="chart-wrap"><canvas id="s-radar" role="img" aria-label="IT診断レーダーチャート"></canvas></div>
<div class="fb-list" id="s-fb"></div>
<div id="s-hints"></div>
<div class="flex-row flex-center flex-wrap mb-2">
  <button class="btn btn-dark" onclick="sPDF()">📥 PDFで保存</button>
  <button class="btn btn-primary" onclick="switchMode('ot');oStart()">🏭 OT診断もやる</button>
  <button class="btn btn-secondary" onclick="sAnswers={};sCur=0;resetSimpleUI();sStart()">↺ もう一度</button>
</div>
<div class="cta-box">
  <h3>この結果、専門家に見てもらいませんか？</h3>
  <p>IT担当がいなくても大丈夫。まず話を聞かせてください。</p>
  <a href="mailto:s.nakata@mergevision.co.jp?subject=IT診断の結果について相談したい&body=診断結果：総合スコア${total}点（${risk}）%0D%0A会社名：${currentUser?.company}" class="btn btn-primary">メールで相談する</a>
</div>`;

  document.getElementById('ss-quiz').style.display = 'none';
  el.style.display = 'block';

  const fbEl = document.getElementById('s-fb');
  SCATS.forEach(c => {
    const p = catPct[c.id];
    const lv = p >= 75 ? 'green' : p >= 50 ? 'yellow' : 'red';
    const ic = p >= 75 ? '✓' : p >= 50 ? '⚠' : '✕';
    const msg = p >= 75 ? '管理は概ね良好です。' : p >= 50 ? '改善の余地があります。' : 'リスクが高い状態です。早急な整備をおすすめします。';
    const d = document.createElement('div');
    d.className = 'fb-item ' + lv;
    d.innerHTML = `<span style="font-size:15px;flex-shrink:0">${ic}</span><div><strong>${c.name} ${p}点</strong>　${msg}</div>`;
    fbEl.appendChild(d);
  });

  // 改善のヒント（回答した質問の中で減点された項目だけ抽出）
  const hints = [];
  SQS.forEach((q, idx) => {
    const ansIdx = sAnswers[idx];
    if (ansIdx === undefined || ansIdx === 0) return; // 最良回答はスキップ
    const action = q.actions && q.actions[ansIdx];
    if (!action) return;
    const cat = SCATS.find(c => c.id === q.cat);
    hints.push({ catName: cat.name, catIcon: cat.icon, q: q.q, action });
  });

  const hintsEl = document.getElementById('s-hints');
  if (hints.length > 0) {
    hintsEl.innerHTML = `
      <div style="margin-bottom:1.5rem">
        <p style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:10px">📌 改善のヒント（${hints.length}件）</p>
        ${hints.map(h => `
          <div style="background:var(--bg);border-radius:8px;padding:10px 14px;margin-bottom:8px;border-left:3px solid var(--teal)">
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:3px">${h.catIcon} ${h.catName}</div>
            <div style="font-size:13px;color:var(--text);line-height:1.5">${h.action}</div>
          </div>`).join('')}
      </div>`;
  } else {
    hintsEl.innerHTML = '';
  }

  setTimeout(() => {
    if (radarChart) radarChart.destroy();
    radarChart = new Chart(document.getElementById('s-radar'), {
      type: 'radar',
      data: {
        labels: SCATS.map(c => c.name),
        datasets: [{ label: 'スコア', data: SCATS.map(c => catPct[c.id]), backgroundColor: 'rgba(29,158,117,0.15)', borderColor: '#1D9E75', borderWidth: 2, pointBackgroundColor: '#1D9E75', pointRadius: 4 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, font: { size: 10 }, color: '#7A9CA8', backdropColor: 'transparent' }, grid: { color: 'rgba(0,0,0,0.08)' }, angleLines: { color: 'rgba(0,0,0,0.08)' }, pointLabels: { font: { size: 12, family: "'Noto Sans JP', sans-serif" }, color: '#1a2e35' } } }
      }
    });
  }, 100);
}

// ============================================================
// OT診断
// ============================================================
function oStart() {
  document.getElementById('os-start').style.display = 'none';
  document.getElementById('os-quiz').style.display = 'block';
  oRenderQ();
}

function oRenderQ() {
  const q = OQS[oCur];
  const pct = Math.round((oCur / OQS.length) * 100);
  document.getElementById('o-prog').style.width = pct + '%';
  const cat = OT_CATS.find(c => c.id === q.cat);
  document.getElementById('o-cat').textContent = cat.icon + ' ' + cat.name;
  document.getElementById('o-cat-label').textContent = cat.name;
  document.getElementById('o-q').textContent = q.q;
  const hint = document.getElementById('o-hint');
  if (q.hint) { hint.textContent = q.hint; hint.style.display = 'block'; }
  else hint.style.display = 'none';
  document.getElementById('o-num').textContent = (oCur + 1) + ' / ' + OQS.length;
  document.getElementById('o-back').disabled = oCur === 0;
  const saved = oAnswers[oCur];
  const c = document.getElementById('o-choices'); c.innerHTML = '';
  q.opts.forEach((o, i) => {
    const b = document.createElement('button');
    b.className = 'choice-btn' + (saved === i ? ' selected' : '');
    b.innerHTML = '<span class="choice-dot"></span>' + o;
    b.onclick = () => {
      oAnswers[oCur] = i;
      document.querySelectorAll('#o-choices .choice-btn').forEach((x, j) => x.classList.toggle('selected', j === i));
      document.getElementById('o-next').disabled = false;
    };
    c.appendChild(b);
  });
  document.getElementById('o-next').disabled = saved === undefined;
  document.getElementById('o-next').textContent = oCur === OQS.length - 1 ? '結果を見る' : '次へ →';
}

function oBack() { if (oCur > 0) { oCur--; oRenderQ(); } }
function oNext() {
  if (oAnswers[oCur] === undefined) return;
  if (oCur < OQS.length - 1) { oCur++; oRenderQ(); }
  else oShowResult();
}

function calcOScores() {
  const catPct = {};
  OT_CATS.forEach(c => {
    const qs = OQS.filter(q => q.cat === c.id);
    const tot = qs.reduce((a, q) => { const idx = OQS.indexOf(q); return a + (q.sc[oAnswers[idx] ?? 0]); }, 0);
    catPct[c.id] = Math.round((tot / (qs.length * 3)) * 100);
  });
  return { catPct, total: Math.round(Object.values(catPct).reduce((a, b) => a + b) / OT_CATS.length) };
}

function oShowResult() {
  const { catPct, total } = calcOScores();
  const risk = total >= 75 ? '低リスク' : total >= 50 ? '中リスク' : '高リスク';
  const scoreColor = total >= 75 ? '#1D9E75' : total >= 50 ? '#BA7517' : '#E24B4A';
  const riskStyle = total >= 75
    ? 'color:#085041;background:#9FE1CB'
    : total >= 50 ? 'color:#412402;background:#FAC775'
    : 'color:#501313;background:#F7C1C1';

  saveResult('OT診断', total, risk, catPct);

  // カテゴリごとの詳細カード（リスク把握／運用ポリシー策定の視点／リスクとの向き合い方）
  const tierOf = p => p >= 75 ? 'ok' : p >= 50 ? 'mid' : 'ng';
  const catCards = OT_CATS.map(c => {
    const p = catPct[c.id];
    const tier = tierOf(p);
    const bc = p >= 75 ? '#1D9E75' : p >= 50 ? '#BA7517' : '#E24B4A';
    const r = OT_RESULT[c.id];
    // このカテゴリで減点された設問の個別リスクを抽出
    const subRisks = [];
    OQS.forEach((q, idx) => {
      if (q.cat !== c.id) return;
      const ansIdx = oAnswers[idx];
      if (ansIdx === undefined || ansIdx === 0) return;
      const t = q.risk && q.risk[ansIdx];
      if (t) subRisks.push(t);
    });
    return `
    <div class="ot-cat-card">
      <div class="ot-cat-hd"><span>${c.icon} ${c.name}</span><span style="color:${bc}">${p}点</span></div>
      <div class="ot-block"><b>🔍 リスク把握：</b>${r.risk[tier]}</div>
      ${subRisks.length ? `<ul class="ot-sub-list">${subRisks.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
      <div class="ot-block"><b>📜 運用ポリシー策定の視点：</b>${r.policy[tier]}</div>
      <div class="ot-block"><b>🧭 リスクとの向き合い方：</b>${r.stance[tier]}</div>
    </div>`;
  }).join('');

  const el = document.getElementById('os-result');
  el.innerHTML = `
<div class="score-display">
  <p style="font-size:13px;color:var(--text-muted);margin-bottom:6px">総合スコア</p>
  <div class="score-num" style="color:${scoreColor}">${total}<span class="score-unit">点</span></div>
  <div class="risk-pill" style="${riskStyle}">${risk}</div>
  <p class="saved-note">✓ この結果は保存されました</p>
</div>
<div class="chart-wrap"><canvas id="o-radar" role="img" aria-label="OT診断レーダーチャート"></canvas></div>
<div style="margin-bottom:1.5rem">${OT_CATS.map(c => {
  const p = catPct[c.id];
  const bc = p >= 75 ? '#1D9E75' : p >= 50 ? '#BA7517' : '#E24B4A';
  return `<div class="ot-bar-row">
    <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px">
      <span>${c.icon} ${c.name}</span>
      <span style="color:${bc};font-weight:500">${p}点</span>
    </div>
    <div style="height:6px;background:#dde8e8;border-radius:3px">
      <div style="height:6px;border-radius:3px;background:${bc};width:${p}%;transition:width .6s"></div>
    </div></div>`;
}).join('')}</div>
<p style="font-size:14px;font-weight:700;margin-bottom:10px;color:var(--text)">📋 カテゴリ別サマリー</p>
${catCards}
<div class="flex-row flex-center flex-wrap mb-2 mt-2">
  <button class="btn btn-dark" onclick="oPDF()">📥 PDFで保存</button>
  <button class="btn btn-primary" onclick="switchMode('simple');sStart()">⚡ IT簡易診断もやる</button>
  <button class="btn btn-secondary" onclick="oAnswers={};oCur=0;resetOTUI();oStart()">↺ もう一度</button>
</div>
<div class="cta-box">
  <h3>OTリスクとの向き合い方、専門家に相談しませんか？</h3>
  <p>制御システムは止められない前提があるからこそ、段階的なリスク低減の設計が重要です。</p>
  <a href="mailto:s.nakata@mergevision.co.jp?subject=OT診断の結果について相談したい&body=診断結果：総合スコア${total}点（${risk}）%0D%0A会社名：${currentUser?.company}" class="btn btn-primary">メールで相談する</a>
</div>`;

  document.getElementById('os-quiz').style.display = 'none';
  el.style.display = 'block';

  setTimeout(() => {
    if (radarChart) radarChart.destroy();
    radarChart = new Chart(document.getElementById('o-radar'), {
      type: 'radar',
      data: {
        labels: OT_CATS.map(c => c.name),
        datasets: [{ label: 'スコア', data: OT_CATS.map(c => catPct[c.id]), backgroundColor: 'rgba(29,158,117,0.15)', borderColor: '#1D9E75', borderWidth: 2, pointBackgroundColor: '#1D9E75', pointRadius: 4 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, font: { size: 10 }, color: '#7A9CA8', backdropColor: 'transparent' }, grid: { color: 'rgba(0,0,0,0.08)' }, angleLines: { color: 'rgba(0,0,0,0.08)' }, pointLabels: { font: { size: 12, family: "'Noto Sans JP', sans-serif" }, color: '#1a2e35' } } }
      }
    });
  }, 100);
}

// ============================================================
// Supabase保存
// ============================================================
async function saveResult(type, score, risk, details) {
  if (!currentUser) return;
  try {
    const { error } = await db.from('results').insert({
      name: currentUser.company,
      company: currentUser.company,
      email: '',
      employee_size: currentUser.employee_size || null,
      industry: currentUser.industry || null,
      type, score, risk,
      details,
    });
    if (error) console.error('保存エラー:', error);
  } catch (e) {
    console.error('Supabase接続エラー:', e);
  }
}

// ============================================================
// PDF出力（大型canvas一括描画方式）
// A4を2480×3508px(300dpi)相当のcanvasに全部描いてPDFに貼る
// ============================================================

// SVGテキストをcanvasに描画するヘルパー
function drawSvgText(ctx, text, x, y, opts={}) {
  const { fontSize=28, bold=false, color='#1a2e35', align='left', maxWidth } = opts;
  const escaped = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const w = maxWidth || 1200;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${fontSize*2}">
    <text x="${align==='center'?w/2:align==='right'?w:0}" y="${fontSize*1.1}"
      font-size="${fontSize}" font-family="'Noto Sans JP',sans-serif"
      font-weight="${bold?'700':'500'}" fill="${color}"
      text-anchor="${align==='center'?'middle':align==='right'?'end':'start'}">${escaped}</text></svg>`;
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, x, y - fontSize*1.1, w, fontSize*2);
      res();
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

// 正多角形レーダーチャートをcanvasに描画
function drawRadarOnCanvas(ctx, cx, cy, size, catDefs, catData) {
  const maxR = size * 0.34;
  const labelR = size * 0.47;
  const n = catDefs.length;
  const angle = i => (Math.PI*2/n)*i - Math.PI/2;
  const pt = (r,i) => [cx + r*Math.cos(angle(i)), cy + r*Math.sin(angle(i))];

  // グリッド
  [25,50,75,100].forEach(lv => {
    const r = maxR*lv/100;
    ctx.beginPath();
    for(let i=0;i<n;i++){const [x,y]=pt(r,i);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
    ctx.closePath();
    ctx.strokeStyle='rgba(0,0,0,0.12)'; ctx.lineWidth=2; ctx.stroke();
    if(lv<100){
      ctx.fillStyle='#aac0c8'; ctx.font='22px sans-serif'; ctx.textAlign='center';
      ctx.fillText(String(lv), cx, cy-r+26);
    }
  });
  // 軸線
  for(let i=0;i<n;i++){
    const [x,y]=pt(maxR,i);
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);
    ctx.strokeStyle='rgba(0,0,0,0.12)';ctx.lineWidth=2;ctx.stroke();
  }
  // データ
  const vals = catDefs.map(c=>catData[c.id]??0);
  ctx.beginPath();
  vals.forEach((v,i)=>{const r=maxR*v/100;const [x,y]=pt(r,i);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
  ctx.closePath();
  ctx.fillStyle='rgba(29,158,117,0.18)';ctx.fill();
  ctx.strokeStyle='#1D9E75';ctx.lineWidth=4;ctx.stroke();
  // ドット
  vals.forEach((v,i)=>{
    const [x,y]=pt(maxR*v/100,i);
    ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);
    ctx.fillStyle='#1D9E75';ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();
  });
  // ラベル位置を返す
  return catDefs.map((cat,i)=>{
    const [lx,ly]=pt(labelR,i);
    return {cat, lx, ly};
  });
}

async function buildPDF(type, scoreVal, riskLabel, catData, catDefs) {
  // A4 300dpi相当
  const CW = 2480, CH = 3508;
  const PAD = 120;
  const cv = document.createElement('canvas');
  cv.width=CW; cv.height=CH;
  const ctx = cv.getContext('2d');

  // 背景白
  ctx.fillStyle='#f8fafa'; ctx.fillRect(0,0,CW,CH);

  // ========== ヘッダー ==========
  const pdfTitle = type==='OT診断' ? 'OT診断レポート' : type==='簡易診断' ? 'IT簡易診断レポート' : 'IT診断レポート';
  ctx.fillStyle='#0A2A35'; ctx.fillRect(0,0,CW,220);
  await drawSvgText(ctx,pdfTitle,PAD,150,{fontSize:72,bold:true,color:'#ffffff'});
  const d=new Date();
  const dateStr=d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate();
  const subText = currentUser ? currentUser.company+'　'+dateStr : dateStr;
  await drawSvgText(ctx,subText,PAD,195,{fontSize:36,color:'#9FE1CB',maxWidth:1800});

  let y = 280;

  // ========== 総合スコア ==========
  await drawSvgText(ctx,'総合スコア',PAD,y+48,{fontSize:44,bold:true,color:'#1a2e35'});
  y+=60;
  const [sr,sg,sb]=scoreVal>=75?[29,158,117]:scoreVal>=50?[186,117,22]:[226,75,74];
  ctx.fillStyle=`rgb(240,250,248)`; roundRect(ctx,PAD,y,CW-PAD*2,200,20,'fill');
  // スコア数字
  ctx.fillStyle=`rgb(${sr},${sg},${sb})`; ctx.font='bold 160px Arial,sans-serif'; ctx.textAlign='left';
  ctx.fillText(String(scoreVal), CW/2-160, y+148);
  ctx.fillStyle='#7a9ca8'; ctx.font='80px Arial,sans-serif';
  ctx.fillText('/100', CW/2+30, y+148);
  // リスクバッジ
  ctx.fillStyle=`rgb(${sr},${sg},${sb})`; roundRect(ctx,CW/2+220,y+60,260,80,16,'fill');
  await drawSvgText(ctx,riskLabel,CW/2+230,y+118,{fontSize:42,bold:true,color:'#ffffff',maxWidth:240});
  y+=240;

  // ========== レーダーチャート ==========
  await drawSvgText(ctx,'カテゴリ別レーダーチャート',PAD,y+48,{fontSize:44,bold:true,color:'#1a2e35'});
  y+=60;
  const radarSize=800;
  const rcx=CW/2, rcy=y+radarSize/2+30;
  const labelPositions = drawRadarOnCanvas(ctx,rcx,rcy,radarSize,catDefs,catData);
  // ラベル描画
  for(const {cat,lx,ly} of labelPositions){
    await drawSvgText(ctx,cat.name,lx-160,ly+20,{fontSize:42,bold:true,color:'#1a2e35',align:'center',maxWidth:320});
  }
  y += radarSize+80;

  // ========== カテゴリ別スコア ==========
  await drawSvgText(ctx,'カテゴリ別スコア',PAD,y+48,{fontSize:44,bold:true,color:'#1a2e35'});
  y+=60;
  const colW=(CW-PAD*2-40)/2;
  const unit='点';
  for(let i=0;i<catDefs.length;i++){
    const cat=catDefs[i];
    const p=catData[cat.id]??0;
    const [cr,cg,cb]=p>=75?[29,158,117]:p>=50?[186,117,22]:[226,75,74];
    const cx2=i%2===0?PAD:PAD+colW+40;
    if(i%2===0&&i>0) y+=130;
    ctx.fillStyle='#ffffff'; roundRect(ctx,cx2,y,colW,120,12,'fill');
    ctx.strokeStyle='#dde8e8'; ctx.lineWidth=2; roundRect(ctx,cx2,y,colW,120,12,'stroke');
    await drawSvgText(ctx,cat.name,cx2+20,y+58,{fontSize:34,color:'#506470',maxWidth:colW-200});
    // スコア数字をcanvas直接描画（SVGだと右寄せがはみ出すため）
    ctx.font = `bold 40px Arial,sans-serif`;
    ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
    ctx.textAlign = 'right';
    ctx.fillText(String(p)+unit, cx2+colW-30, y+70);
    ctx.textAlign = 'left';
    ctx.fillStyle='#dde8e8'; ctx.fillRect(cx2+20,y+75,colW-40,14);
    ctx.fillStyle=`rgb(${cr},${cg},${cb})`; ctx.fillRect(cx2+20,y+75,(colW-40)*p/100,14);
  }
  if(catDefs.length%2!==0) y+=130; else y+=130;
  y+=20;

  // ========== フィードバック ==========
  await drawSvgText(ctx,'フィードバック',PAD,y+48,{fontSize:44,bold:true,color:'#1a2e35'});
  y+=60;
  const fbMap={
    asset:   {ok:'資産管理は概ね良好です。',       mid:'資産管理に改善の余地があります。',   ng:'資産管理のリスクが高い状態です。'},
    sec:     {ok:'セキュリティは概ね良好です。',   mid:'セキュリティに改善の余地があります。',ng:'セキュリティリスクが高い状態です。'},
    backup:  {ok:'バックアップは概ね良好です。',   mid:'バックアップに改善の余地があります。',ng:'バックアップが不十分です。'},
    lic:     {ok:'ライセンス管理は良好です。',     mid:'ライセンス管理に改善が必要です。',    ng:'ライセンス管理が不十分です。'},
    dx:      {ok:'DX化は概ね進んでいます。',       mid:'紙業務が一部残っています。',          ng:'紙業務が多く残っています。'},
  };
  // OT診断用の短縮フィードバック（PDFは1行表示のため簡潔な文言にする）
  Object.assign(fbMap, {
    ot_asset:  {ok:'資産の可視化は良好です。',           mid:'資産の可視化に改善の余地があります。',       ng:'資産の可視化ができておらずリスクが高い状態です。'},
    ot_net:    {ok:'IT/OTのネットワーク分離は良好です。', mid:'IT/OTのネットワーク分離に改善の余地があります。', ng:'IT/OTのネットワーク分離が不十分でリスクが高い状態です。'},
    ot_cont:   {ok:'運用継続・復旧への備えは良好です。',   mid:'運用継続・復旧への備えに改善の余地があります。', ng:'運用継続・復旧への備えが乏しくリスクが高い状態です。'},
    ot_vendor: {ok:'ベンダー・保守管理は良好です。',       mid:'ベンダー・保守管理に改善の余地があります。',     ng:'ベンダー・保守管理が不十分でリスクが高い状態です。'},
    ot_org:    {ok:'組織体制・教育は良好です。',           mid:'組織体制・教育に改善の余地があります。',         ng:'組織体制・教育が不十分でリスクが高い状態です。'},
  });
  for(const cat of catDefs){
    const p=catData[cat.id]??0;
    const [fr,fg,fb2]=p>=75?[234,243,222]:p>=50?[250,238,218]:[252,235,235];
    const [lr,lg,lb]=p>=75?[99,153,34]:p>=50?[186,117,22]:[226,75,74];
    const fb=fbMap[cat.id]||{ok:'良好です。',mid:'改善の余地があります。',ng:'要対応です。'};
    const msg=p>=75?fb.ok:p>=50?fb.mid:fb.ng;
    ctx.fillStyle=`rgb(${fr},${fg},${fb2})`; roundRect(ctx,PAD,y,CW-PAD*2,95,10,'fill');
    ctx.fillStyle=`rgb(${lr},${lg},${lb})`; ctx.fillRect(PAD,y,14,95);
    await drawSvgText(ctx,cat.name,PAD+30,y+60,{fontSize:34,bold:true,color:'#28404a',maxWidth:280});
    await drawSvgText(ctx,msg,PAD+330,y+60,{fontSize:34,color:'#28404a',maxWidth:CW-PAD*2-360});
    y+=110;
  }
  y+=20;

  // ========== CTA ==========
  ctx.fillStyle='#0A2A35'; roundRect(ctx,PAD,y,CW-PAD*2,170,16,'fill');
  await drawSvgText(ctx,'この結果を専門家に見てもらいませんか？',PAD+60,y+80,{fontSize:46,bold:true,color:'#1D9E75',maxWidth:CW-PAD*2-120});
  await drawSvgText(ctx,'IT担当がいなくても大丈夫。まず話を聞かせてください。　s.nakata@mergevision.co.jp',PAD+60,y+136,{fontSize:34,color:'#9FE1CB',maxWidth:CW-PAD*2-120});

  // ========== PDFに変換 ==========
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation:'p', unit:'mm', format:'a4', compress:true });
  const imgData = cv.toDataURL('image/jpeg', 0.92);
  doc.addImage(imgData,'JPEG',0,0,210,297);
  doc.save('IT診断レポート.pdf');
}

// canvas角丸矩形ヘルパー
function roundRect(ctx, x, y, w, h, r, mode) {
  ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
  if(mode==='fill') ctx.fill(); else ctx.stroke();
}

function sPDF() {
  const { catPct, total } = calcSScores();
  const risk = total>=75?'低リスク':total>=50?'中リスク':'高リスク';
  buildPDF('簡易診断', total, risk, catPct, SCATS);
}

function oPDF() {
  const { catPct, total } = calcOScores();
  const risk = total>=75?'低リスク':total>=50?'中リスク':'高リスク';
  buildPDF('OT診断', total, risk, catPct, OT_CATS);
}

// ============================================================
// 管理画面
// ============================================================
function adminLogin() {
  const pw = document.getElementById('admin-pw').value;
  if (pw !== ADMIN_PASSWORD) {
    document.getElementById('admin-err').style.display = 'block'; return;
  }
  showScreen('sc-admin');
  loadAdminData();
}

function adminLogout() { showScreen('sc-entry'); }

async function loadAdminData() {
  document.getElementById('admin-loading').style.display = 'flex';
  document.getElementById('admin-content').style.display = 'none';
  try {
    const { data, error } = await db.from('results').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    allResults = data || [];
  } catch (e) {
    allResults = [];
    console.error('取得エラー:', e);
  }
  document.getElementById('admin-loading').style.display = 'none';
  document.getElementById('admin-content').style.display = 'block';

  const companies = new Set(allResults.map(r => r.company)).size;
  const avg = allResults.length ? Math.round(allResults.reduce((a, r) => a + r.score, 0) / allResults.length) : 0;
  const avgColor = avg >= 75 ? '#1D9E75' : avg >= 50 ? '#BA7517' : '#E24B4A';
  document.getElementById('admin-stats').innerHTML = `
    <div class="stat-card"><div class="stat-num">${allResults.length}</div><div class="stat-lbl">総診断数</div></div>
    <div class="stat-card"><div class="stat-num">${companies}</div><div class="stat-lbl">企業数</div></div>
    <div class="stat-card"><div class="stat-num" style="color:${avgColor}">${avg}</div><div class="stat-lbl">平均スコア</div></div>`;

  renderTable();
}

const ADMIN_SCATS = [
  {id:'asset',name:'資産管理'}, {id:'sec',name:'セキュリティ'},
  {id:'backup',name:'バックアップ'}, {id:'lic',name:'ライセンス'}, {id:'dx',name:'書類・DX'},
];
const ADMIN_OCATS = [
  {id:'ot_asset',name:'資産・可視化'}, {id:'ot_net',name:'ネットワーク分離'},
  {id:'ot_cont',name:'運用継続・復旧'}, {id:'ot_vendor',name:'ベンダー・保守'},
  {id:'ot_org',name:'組織・教育'},
];

let sortKey = 'created_at', sortAsc = false;

function renderTable() {
  const filterType = document.getElementById('filter-type').value;
  const filterIndustry = document.getElementById('filter-industry-admin') ? document.getElementById('filter-industry-admin').value : '';
  const filterSize = document.getElementById('filter-size-admin') ? document.getElementById('filter-size-admin').value : '';

  let filtered = allResults.filter(r => {
    if (filterType && r.type !== filterType) return false;
    if (filterIndustry && r.industry !== filterIndustry) return false;
    if (filterSize && r.employee_size !== filterSize) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    let va = a[sortKey], vb = b[sortKey];
    if (sortKey === 'created_at') { va = new Date(va); vb = new Date(vb); }
    if (sortKey === 'score') { va = Number(va); vb = Number(vb); }
    if (va < vb) return sortAsc ? -1 : 1;
    if (va > vb) return sortAsc ? 1 : -1;
    return 0;
  });

  document.getElementById('admin-count').textContent = '全' + filtered.length + '件';

  const arrow = (k) => sortKey===k ? (sortAsc?'↑':'↓') : '↕';
  document.querySelector('.results-tbl thead tr').innerHTML = `
    <th style="width:28px"><input type="checkbox" id="chk-all" onchange="toggleAllCheck(this)"></th>
    <th style="cursor:pointer" onclick="setSort('created_at')">日時 ${arrow('created_at')}</th>
    <th style="cursor:pointer" onclick="setSort('company')">会社名 ${arrow('company')}</th>
    <th style="cursor:pointer" onclick="setSort('industry')">業種 ${arrow('industry')}</th>
    <th style="cursor:pointer" onclick="setSort('employee_size')">従業員数 ${arrow('employee_size')}</th>
    <th>種別</th>
    <th style="cursor:pointer" onclick="setSort('score')">スコア ${arrow('score')}</th>
    <th>判定</th>
    <th>カテゴリ別</th>`;

  const tbody = document.getElementById('admin-tbody'); tbody.innerHTML = '';
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:2rem">データがありません</td></tr>';
    return;
  }

  filtered.forEach(r => {
    const d = new Date(r.created_at);
    const ds = d.getFullYear()+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+String(d.getDate()).padStart(2,'0')
      +' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
    const sc = r.score>=75?'#1D9E75':r.score>=50?'#BA7517':'#E24B4A';
    const rb = r.risk==='低リスク'||r.risk==='管理良好'?'background:#E1F5EE;color:#085041'
      :r.risk==='中リスク'||r.risk==='要改善'?'background:#FAEEDA;color:#412402'
      :'background:#FCEBEB;color:#501313';
    const unit = '点';
    const cats = r.type==='OT診断' ? ADMIN_OCATS : ADMIN_SCATS;
    const details = r.details || {};

    const miniBars = cats.map(c => {
      const p = details[c.id] ?? null;
      if (p === null) return '';
      const bc = p>=75?'#1D9E75':p>=50?'#BA7517':'#E24B4A';
      return `<div style="margin-bottom:3px">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-bottom:1px">
          <span>${c.name}</span><span style="color:${bc};font-weight:500">${p}${unit}</span>
        </div>
        <div style="height:4px;background:#dde8e8;border-radius:2px">
          <div style="height:4px;border-radius:2px;background:${bc};width:${p}%"></div>
        </div>
      </div>`;
    }).join('');

    const tr = document.createElement('tr');
    tr.dataset.id = r.id;
    tr.innerHTML = `
      <td onclick="event.stopPropagation()"><input type="checkbox" class="row-chk" data-id="${r.id}" onchange="updateSelectBanner()" style="width:15px;height:15px;cursor:pointer;accent-color:#E24B4A"></td>
      <td style="white-space:nowrap;color:var(--text-muted);font-size:11px">${ds}</td>
      <td style="font-weight:500;font-size:13px">${r.company}</td>
      <td style="font-size:12px">${r.industry||'—'}</td>
      <td style="font-size:12px">${r.employee_size||'—'}</td>
      <td><span class="pill" style="background:#E6F1FB;color:#185FA5">${r.type}</span></td>
      <td style="text-align:center;font-size:20px;font-weight:700;color:${sc}">${r.score}<span style="font-size:11px;font-weight:400;color:var(--text-muted)">${unit}</span></td>
      <td><span class="pill" style="${rb}">${r.risk}</span></td>
      <td style="min-width:150px">${miniBars||'<span style="font-size:11px;color:var(--text-muted)">詳細なし</span>'}</td>`;
    tr.style.cursor = 'pointer';
    tr.onclick = (e) => { if(e.target.type!=='checkbox') openDetail(r); };
    tbody.appendChild(tr);
  });
}

function setSort(key) {
  if (sortKey === key) sortAsc = !sortAsc;
  else { sortKey = key; sortAsc = false; }
  renderTable();
}

function toggleAllCheck(el) {
  document.querySelectorAll('.row-chk').forEach(c => c.checked = el.checked);
  updateSelectBanner();
}

function updateSelectBanner() {
  const checked = document.querySelectorAll('.row-chk:checked');
  const banner = document.getElementById('select-banner');
  const label = document.getElementById('select-count-label');
  if (checked.length > 0) {
    banner.style.display = 'flex';
    label.textContent = checked.length + '件を選択中';
  } else {
    banner.style.display = 'none';
  }
}

async function deleteChecked() {
  const ids = [...document.querySelectorAll('.row-chk:checked')].map(c => c.dataset.id);
  if (ids.length === 0) { alert('削除するデータを選択してください'); return; }
  if (!confirm(ids.length + '件のデータを削除しますか？')) return;
  try {
    const { error } = await db.from('results').delete().in('id', ids);
    if (error) throw error;
    document.getElementById('select-banner').style.display = 'none';
    await loadAdminData();
  } catch(e) { alert('削除に失敗しました: ' + e.message); }
}

async function clearAllData() {
  if (!confirm('全データを削除しますか？この操作は取り消せません。')) return;
  try {
    const ids = allResults.map(r => r.id);
    if (ids.length === 0) { alert('削除するデータがありません'); return; }
    const { error } = await db.from('results').delete().in('id', ids);
    if (error) throw error;
    await loadAdminData();
  } catch(e) { alert('削除に失敗しました: ' + e.message); }
}


function exportCSV() {
  if (!allResults.length) { alert('データがありません'); return; }

  // 簡易診断用カテゴリ
  const sCatDefs = [
    {id:'asset', name:'資産管理'},
    {id:'sec',   name:'セキュリティ'},
    {id:'backup',name:'バックアップ'},
    {id:'lic',   name:'ライセンス'},
    {id:'dx',    name:'書類・DX'},
  ];
  // OT診断用カテゴリ
  const oCatDefs = [
    {id:'ot_asset',  name:'資産・可視化'},
    {id:'ot_net',    name:'ネットワーク分離'},
    {id:'ot_cont',   name:'運用継続・復旧'},
    {id:'ot_vendor', name:'ベンダー・保守'},
    {id:'ot_org',    name:'組織・教育'},
  ];

  const judgement = (p) => p >= 75 ? '良好' : p >= 50 ? '要改善' : '高リスク';

  // 全カテゴリ名をヘッダーに（IT簡易診断+OT診断の全カテゴリ）
  const sHeaders = sCatDefs.flatMap(c => [c.name+'_スコア', c.name+'_判定']);
  const oHeaders = oCatDefs.flatMap(c => [c.name+'_スコア', c.name+'_判定']);

  const headers = [
    '日時', '名前', '会社名', 'メール', '従業員数', '業種', '種別', '総合スコア', '総合判定',
    ...sHeaders, ...oHeaders
  ];

  const rows = allResults.map(r => {
    const d = new Date(r.created_at);
    const ds = d.getFullYear() + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + String(d.getDate()).padStart(2,'0')
      + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    const details = r.details || {};
    const isSimple = r.type === '簡易診断';
    const isOT = r.type === 'OT診断';

    // IT簡易診断カテゴリ列（OT診断の場合は空欄）
    const sCols = sCatDefs.flatMap(c => {
      if (!isSimple) return ['', ''];
      const p = details[c.id] ?? '';
      return [p, p !== '' ? judgement(p) : ''];
    });
    // OT診断カテゴリ列（IT簡易診断の場合は空欄）
    const oCols = oCatDefs.flatMap(c => {
      if (!isOT) return ['', ''];
      const p = details[c.id] ?? '';
      return [p, p !== '' ? judgement(p) : ''];
    });

    return [
      ds, r.name, r.company, r.email,
      r.employee_size || '', r.industry || '',
      r.type, r.score, r.risk,
      ...sCols, ...oCols
    ].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',');
  });

  const csv = '﻿' + [headers.join(','), ...rows].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'it-shindan-results.csv';
  a.click();
}
