// HTMLの部品を取得する
const companyNameInput = document.getElementById("companyName");
const industryInput = document.getElementById("industry");
const deadlineInput = document.getElementById("deadline");
const statusInput = document.getElementById("status");
const memoInput = document.getElementById("memo");
const addButton = document.getElementById("addButton");
const companyList = document.getElementById("companyList");
const companyCount = document.getElementById("companyCount");
const nearestDeadline = document.getElementById("nearestDeadline");
const sortButton = document.getElementById("sortButton");

// 保存されている企業データを読み込む
let companies = JSON.parse(localStorage.getItem("companies")) || [];

// 編集中の企業番号を入れる箱
// -1 のときは「新規追加」
// 0以上の数字のときは「その番号の企業を編集中」
let editingIndex = -1;

// ページを開いたときに企業一覧を表示する
displayCompanies();
// 締切順に並び替えボタンが押されたときの処理
sortButton.addEventListener("click", function () {
  companies.sort(function (a, b) {
    // 締切が空の企業は後ろにする
    if (a.deadline === "") return 1;
    if (b.deadline === "") return -1;

    return new Date(a.deadline) - new Date(b.deadline);
  });

  saveCompanies();
  displayCompanies();
  sortButton.addEventListener("click", function () {
  companies.sort(function (a, b) {
    if (a.deadline === "") return 1;
    if (b.deadline === "") return -1;

    return new Date(a.deadline) - new Date(b.deadline);
  });

  saveCompanies();
  displayCompanies();
});
});

// 追加・更新ボタンが押されたときの処理
addButton.addEventListener("click", function () {
  const companyName = companyNameInput.value;
  const industry = industryInput.value;
  const deadline = deadlineInput.value;
  const status = statusInput.value;
  const memo = memoInput.value;

  // 企業名が空なら追加しない
  if (companyName === "") {
    alert("企業名を入力してください");
    return;
  }

  // 1社分のデータを作る
  const company = {
    name: companyName,
    industry: industry,
    deadline: deadline,
    status: status,
    memo: memo
  };

  // 新規追加か編集かを判断する
  if (editingIndex === -1) {
    // 新規追加
    companies.push(company);
  } else {
    // 編集中の企業を上書き
    companies[editingIndex] = company;

    // 編集状態を解除する
    editingIndex = -1;

    // ボタンの文字を戻す
    addButton.textContent = "追加する";
  }

  // データを保存する
  saveCompanies();

  // 入力欄を空にする
  clearInputs();

  // 画面を更新する
  displayCompanies();
});

// 企業一覧を表示する関数
function displayCompanies() {
  companyList.innerHTML = "";
  companyCount.textContent = companies.length;
  showNearestDeadline();

  companies.forEach(function (company, index) {
    const card = document.createElement("div");
    card.className = "company-card";
    card.classList.add(getStatusClass(company.status));

    card.innerHTML = `
      <h3>${company.name}</h3>
      <p><strong>業界：</strong>${company.industry}</p>
      <p><strong>ES締切：</strong>${company.deadline}</p>
      <p><strong>選考状況：</strong>${company.status}</p>
      <p><strong>メモ：</strong>${company.memo}</p>
      <button class="edit-button" onclick="editCompany(${index})">編集</button>
      <button class="delete-button" onclick="deleteCompany(${index})">削除</button>
    `;

    companyList.appendChild(card);
  });
}

// 企業を削除する関数
function deleteCompany(index) {
  companies.splice(index, 1);
  saveCompanies();
  displayCompanies();
}

// 企業を編集する関数
function editCompany(index) {
  const company = companies[index];

  // 選んだ企業の情報を入力欄に戻す
  companyNameInput.value = company.name;
  industryInput.value = company.industry;
  deadlineInput.value = company.deadline;
  statusInput.value = company.status;
  memoInput.value = company.memo;

  // 編集中の番号を覚える
  editingIndex = index;

  // ボタンの文字を変える
  addButton.textContent = "更新する";

  // 画面上部に移動する
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// 入力欄を空にする関数
function clearInputs() {
  companyNameInput.value = "";
  industryInput.value = "";
  deadlineInput.value = "";
  statusInput.value = "応募予定";
  memoInput.value = "";
}

// 企業データを保存する関数
function saveCompanies() {
  localStorage.setItem("companies", JSON.stringify(companies));
}

// 締切が一番近い企業を表示する関数
function showNearestDeadline() {
  // 今日の日付を作る
  const today = new Date();

  // 時間の情報を消して、日付だけで比べられるようにする
  today.setHours(0, 0, 0, 0);

  // 締切が入力されていて、今日以降の企業だけを取り出す
  const upcomingCompanies = companies.filter(function (company) {
    if (company.deadline === "") {
      return false;
    }

    const deadlineDate = new Date(company.deadline);
    return deadlineDate >= today;
  });

  // 今日以降の締切がない場合
  if (upcomingCompanies.length === 0) {
    nearestDeadline.textContent = "今後の締切はありません";
    return;
  }

  // 締切が近い順に並べ替える
  upcomingCompanies.sort(function (a, b) {
    return new Date(a.deadline) - new Date(b.deadline);
  });

  // 一番締切が近い企業を取り出す
  const nearest = upcomingCompanies[0];

  // 画面に表示する
  nearestDeadline.textContent = `${nearest.name}（${nearest.deadline}）`;
}

// 選考状況に合わせてカードの色を変えるための関数
function getStatusClass(status) {
  if (status === "応募予定") {
    return "status-plan";
  } else if (status === "ES準備中") {
    return "status-prepare";
  } else if (status === "ES提出済み") {
    return "status-submitted";
  } else if (status === "一次面接") {
    return "status-first";
  } else if (status === "最終面接") {
    return "status-final";
  } else if (status === "内定") {
    return "status-offer";
  } else if (status === "不合格") {
    return "status-rejected";
  } else {
    return "status-plan";
  }
}
