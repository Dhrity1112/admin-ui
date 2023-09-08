const rowsPerPage = 10;
let all_members = [];
let all_members_copy = [];
let preservedHtml = "";
let tbody = document.getElementsByTagName("tbody")[0];
const pagination = document.getElementById("pagination");
const searchBox = document.getElementById("search");
const modal = document.getElementById("deleteModal");
const deleteSelectedModal = document.getElementById("deleteSelectedModal");
const cancelBtn = document.getElementById("cancelBtn");
const deleteBtn = document.getElementById("deleteBtn");
const deleteSelected = document.getElementById("deleteSelected");
const tableData = document.getElementById("table-data");
const nodatafound = document.getElementById("nodatafound");
const selectAll = document.getElementById("selectAll");
let currentPage = 1;
const instance = M.Modal.init(modal);
let isSelectAllClicked = false;
let deleteMap = {};
let deleteIndex = -1;

window.onload = function () {
  fetchMembers();
};

function fetchMembers() {
  fetch(
    "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
  )
    .then((res) => res.json())
    .then((members) => {
      all_members = [...members];
      if (!all_members.length) {
        nodatafound.textContent = "No Data found. Please try after sometime";
        tableData.style.display = "none";
        pagination.style.display = "none";
        selectAll.style.display = "none";
        return;
      }
      createPaginationButtons(all_members);
      updateTable(1, all_members);
    })
    .catch((error) => {
      console.error("Something went wrong", error);
    });
}

function updateTable(page, members) {
  if (!members.length) {
    nodatafound.style.display = 'flex';
    tableData.style.display = "none";
    pagination.style.display = "none";
    selectAll.style.display = "none";
    return;
  }
  nodatafound.style.display = 'none';
  tableData.style.display = "table";
  pagination.style.display = "flex";
  selectAll.style.display = "block";
  tbody.innerHTML = "";

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  for (let i = startIndex; i < endIndex && i < members.length; i++) {
    const member = members[i];
    const tr = document.createElement("tr");
    // start of checkbox
    const pTag = document.createElement("p");
    const label = document.createElement("label");
    const input = document.createElement("input");
    const span = document.createElement("span");
    input.setAttribute("type", "checkbox");
    label.appendChild(input);
    label.appendChild(span);
    pTag.appendChild(label);

    // end of checkbox

    const check = document.createElement("td");
    const name = document.createElement("td");
    const email = document.createElement("td");
    const role = document.createElement("td");
    const action = document.createElement("td");
    action.style.cursor = "pointer";

    // start of actions
    const editIcon = document.createElement("i");
    editIcon.classList.add("material-icons");
    editIcon.innerHTML = "edit";

    editIcon.addEventListener("click", () => {
      alert("edit functionality");

      // to do to write code for edit
    });

    const deleteIcon = document.createElement("i");
    deleteIcon.classList.add("material-icons");
    deleteIcon.style.marginLeft = "1rem";
    deleteIcon.setAttribute("data-target", "deleteModal");
    deleteIcon.style.color = "lightcoral";
    deleteIcon.innerHTML = "delete";

    deleteIcon.addEventListener("click", () => {
      // modal.modal('open')
      instance.open();
      deleteIndex = i;
    });
    // end of actions

    check.appendChild(pTag);
    name.innerHTML = member.name;
    email.innerHTML = member.email;
    role.innerHTML = member.role;
    action.appendChild(editIcon);
    action.appendChild(deleteIcon);

    check.addEventListener("change", () => {
      if (deleteMap.hasOwnProperty(i)) {
        delete deleteMap[i];
      } else {
        deleteMap[i] = true;
      }

      if (Object.keys(deleteMap).length > 1) {
        deleteSelected.classList.remove("hidden");
      } else {
        deleteSelected.classList.add("hidden");
      }

      console.log(deleteMap);
    });

    tr.appendChild(check);
    tr.appendChild(name);
    tr.appendChild(email);
    tr.appendChild(role);
    tr.appendChild(action);

    tbody.appendChild(tr);
  }

  const buttons = pagination.querySelectorAll("li");
  buttons.forEach((button) => {
    button.classList.remove("active");
  });

  const activeButton = pagination.querySelector(`li:nth-child(${page + 1})`);
  activeButton.classList.add("active");

  currentPage = page;

  const prevPageButton = document.getElementById("prev-page");
  const nextPageButton = document.getElementById("next-page");

  if (currentPage === 1) {
    prevPageButton.classList.add("disabled");
  } else {
    prevPageButton.classList.remove("disabled");
  }

  if (currentPage === Math.ceil(all_members.length / rowsPerPage)) {
    nextPageButton.classList.add("disabled");
  } else {
    nextPageButton.classList.remove("disabled");
  }
}

function createPaginationButtons(members) {
  const totalPages = Math.ceil(members.length / rowsPerPage);
  pagination.innerHTML = "";

  const leftIcon = document.createElement("li");
  leftIcon.classList.add("disabled");
  leftIcon.id = "prev-page";

  const anchor = document.createElement("a");
  anchor.href = "#!";

  const icon = document.createElement("i");
  icon.classList.add("material-icons");
  icon.innerHTML = "chevron_left";

  anchor.appendChild(icon);

  leftIcon.appendChild(anchor);
  pagination.appendChild(leftIcon);

  for (let i = 1; i <= totalPages; i++) {
    const listItem = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#";
    link.innerText = i;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      deSelectAll();
      // currentPage = i;
      deleteIndex = -1;
      updateTable(i, members);
    });
    listItem.appendChild(link);
    pagination.appendChild(listItem);
  }

  const rightIcon = document.createElement("li");
  rightIcon.classList.add("disabled");
  rightIcon.id = "next-page";

  const anchorRight = document.createElement("a");
  anchorRight.href = "#!";

  const iconRight = document.createElement("i");
  iconRight.classList.add("material-icons");
  iconRight.innerHTML = "chevron_right";

  anchorRight.appendChild(iconRight);

  rightIcon.appendChild(anchorRight);
  pagination.appendChild(rightIcon);

  leftIcon.addEventListener("click", () => {
    if (currentPage > 1) {
      updateTable(currentPage - 1, all_members);
    }
  });

  rightIcon.addEventListener("click", () => {
    if (currentPage < Math.ceil(all_members.length / rowsPerPage)) {
      updateTable(currentPage + 1, all_members);
    }
  });

  const firstButton = pagination.querySelector("li:nth-child(2)");
  firstButton.classList.add("active");
}

function getSearchMember(members, searchText) {
  return members.filter((member) => {
    return (
      member.name.toLowerCase().includes(searchText.toLowerCase()) ||
      member.email.toLowerCase().includes(searchText.toLowerCase()) ||
      member.role.toLowerCase().includes(searchText.toLowerCase())
    );
  });
}

searchBox.addEventListener("input", (event) => {
  const searchMember = getSearchMember(all_members, event.target.value);
  createPaginationButtons(searchMember);
  updateTable(1, searchMember);
});

cancelBtn.addEventListener("click", () => {
  instance.close();
  deleteIndex = -1;
});

deleteBtn.addEventListener("click", () => {
  if (deleteIndex > -1) {
    all_members.splice(deleteIndex, 1);
    createPaginationButtons(all_members);
    updateTable(currentPage, all_members);
  } else if (Object.keys(deleteMap).length > 1) {
    const startIndex = Number(Object.keys(deleteMap)[0]);
    const endIndex = Number(
      Object.keys(deleteMap)[Object.keys(deleteMap).length - 1]
    );

    // const new_all_members = [all_members.slice(0, startIndex), all_members.slice(endIndex + 1, all_members.length - 1)]
    const new_all_members = [
      ...all_members.slice(0, startIndex),
      ...all_members.slice(endIndex + 1, all_members.length),
    ];
    all_members = [...new_all_members];
    // console.log(new_all_members)
    // Object.keys(deleteMap).forEach((data, index) => {
    // // all_members.splice(index, 1);
    // });
    deSelectAll();
    createPaginationButtons(all_members);
    updateTable(currentPage, all_members);
  }

  instance.close();
});

function deSelectAll() {
  const checkbox = document.querySelectorAll('input[type="checkbox"]');
  for (const check of checkbox) {
    check.checked = false;
  }
  deleteSelected.classList.add("hidden");
  deleteMap = {};
  deleteIndex = -1;
}

function handleSelectAll() {
  isSelectAllClicked = !isSelectAllClicked;
  deleteIndex = -1;
  const checkbox = document.querySelectorAll('input[type="checkbox"]');
  for (const check of checkbox) {
    check.checked = isSelectAllClicked;
  }

  if (isSelectAllClicked) {
    deleteSelected.classList.remove("hidden");
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    deleteMap = {};

    for (let i = startIndex; i < endIndex; i++) {
      deleteMap[i] = true;
    }
  } else {
    deleteSelected.classList.add("hidden");
    deleteMap = {};
  }
}

deleteSelected.addEventListener("click", () => {
  instance.open();
});