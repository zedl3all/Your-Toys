function createNav() {
  var myMenu = document.getElementById("myMenu");
}
function search() {
  // Declare variables
  var input, filter, ul, li, a, i;
  input = document.getElementById("mySearch");
  filter = input.value.toUpperCase();
  ul = document.getElementById("myMenu");
  li = ul.getElementsByTagName("li");

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("a")[0];
    if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

function toggleMenuDisplay() {
  const searchInput = document.getElementById("mySearch");
  const menu = document.getElementById("myMenu");

  searchInput.addEventListener("focus", function () {
    if (searchInput.value.trim() !== "") {
      menu.style.display = "block";
    }
  });

  searchInput.addEventListener("blur", function () {
    setTimeout(function () {
      menu.style.display = "none";
    }, 200);
  });

  searchInput.addEventListener("input", function () {
    if (searchInput.value.trim() !== "") {
      menu.style.display = "block";
    } else {
      menu.style.display = "none";
    }
  });
}

function handleLoginState() {
  if (localStorage.getItem("isLoggedIn")) {
    let sidenav = document.getElementById("Sidenav");
    const loginButton = document.querySelector(".login");
    loginButton.style.display = "none";

    // product
    if (
      localStorage.getItem("role_id") === "1" ||
      localStorage.getItem("role_id") === "0"
    ) {
      let product = document.createElement("a");
      product.href = "/manageProduct";
      product.innerHTML = '<i class="bi bi-gear"></i> จัดการสินค้า';
      product.style.cursor = "pointer";
      sidenav.appendChild(product);
    }
    // packing
    if (
      localStorage.getItem("role_id") === "2" ||
      localStorage.getItem("role_id") === "0"
    ) {
      let packing = document.createElement("a");
      packing.href = "/packing";
      packing.innerHTML = '<i class="bi bi-box-seam"></i> บรรจุภัณฑ์';
      packing.style.cursor = "pointer";
      sidenav.appendChild(packing);
    }
    // Normal User
    let logout = document.createElement("a");
    logout.onclick = function () {
      localStorage.clear();
      location.href = "/";
    };
    logout.innerHTML = '<i class="bi bi-box-arrow-right"></i> ออกจากระบบ';
    logout.style.color = "#818181";
    logout.style.cursor = "pointer";
    sidenav.appendChild(logout);

    const username = localStorage.getItem("username");
    if (username) {
      document
        .querySelector(".nav-right")
        .insertAdjacentHTML(
          "afterbegin",
          `<span class="welcome-message">ยินดีต้อนรับ, ${username}</span>`
        );
    }
  }
}

function openNav() {
  document.getElementById("Sidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("Sidenav").style.width = "0";
}

function blurHandler() {
  let search = document.getElementById("mySearch");
  setTimeout(function () {
    search.style.opacity = 0;
    search.style.height = "0";
    search.style.width = "0";
    search.style.overflow = "hidden";
    search.style.position = "static";
    search.style.zIndex = "0";
    search.style.padding = "0";
  }, 200);
}

function openSearch() {
  let search = document.getElementById("mySearch");
  closeNav();

  search.style.opacity = 1;
  search.style.height = "50px";
  search.style.width = "80%";
  search.style.overflow = "visible";
  search.style.position = "fixed";
  search.style.top = "5%";
  search.style.left = "50%";
  search.style.transform = "translate(-50%, -50%)";
  search.style.zIndex = "1001";
  search.style.backgroundColor = "white";
  search.style.border = "2px solid #33322B";
  search.style.padding = "10px";
  search.focus();

  // Add blur event listener to close the search bar when it loses focus
  if (window.innerWidth <= 800) {
    search.addEventListener("blur", blurHandler);
  }
}

function resetSearchBar() {
  let search = document.getElementById("mySearch");
  search.style.opacity = "";
  search.style.height = "";
  search.style.width = "100%";
  search.style.overflow = "";
  search.style.position = "";
  search.style.top = "";
  search.style.left = "";
  search.style.transform = "";
  search.style.zIndex = "";
  search.style.backgroundColor = "";
  search.style.border = "2px solid #33322B";
  search.style.padding = "11px";
  search.removeEventListener("blur", blurHandler); // Remove the blur event listener
  search.blur();
}

window.addEventListener("resize", function () {
  let search = document.getElementById("mySearch");
  if (window.innerWidth > 800) {
    resetSearchBar();
  } else {
    search.focus(); // Add focus when width is less than or equal to 800
  }
});

toggleMenuDisplay();
handleLoginState();

async function fetchCategories() {
  try {
    const response = await fetch("/categories");
    const data = await response.json();
    if (data.success) {
      const menu = document.getElementById("myMenu");
      data.categories.forEach((category) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `/ProductAll/${category.id}`;
        a.appendChild(document.createTextNode("Category :" + category.name));
        li.appendChild(a);
        menu.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

async function fetchProduct() {
  try {
    const response = await fetch("/products");
    const data = await response.json();
    if (data.success) {
      const menu = document.getElementById("myMenu");
      data.products.forEach((product) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `/Product/${product.id}`;
        a.appendChild(document.createTextNode("Product :" + product.name));
        li.appendChild(a);
        menu.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

document.addEventListener("DOMContentLoaded", fetchCategories);
document.addEventListener("DOMContentLoaded", fetchProduct);

function goToCartWithId() {
  // Get the user ID directly from localStorage when link is clicked
  const userId = localStorage.getItem("user_id");
  console.log("CART CLICK - User ID from localStorage:", userId);

  if (userId) {
    // Redirect to cart with userId parameter
    window.location.href = `/cart?userId=${userId}`;
  } else {
    alert("Please log in to view your cart");
    window.location.href = "/login";
  }
}

function goToAllOrderWithId() {
  const userId = localStorage.getItem("user_id");

  if (userId) {
    window.location.href = `/AllOrder/${userId}`;
  } else {
    alert("Please log in to view your orders");
    window.location.href = "/login";
  }
}
