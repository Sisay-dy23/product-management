function getProducts() {

    let savedProducts =
        localStorage.getItem("products");

    if (savedProducts === null) {

        let defaultProducts = [

            {
                id: generateId(),
                name: "Laptop",
                price: 50000,
                quantity: 20,
                reorderLevel: 5
            },

            {
                id: generateId(),
                name: "Phone",
                price: 22000,
                quantity: 50,
                reorderLevel: 10
            },

            {
                id: generateId(),
                name: "Charger",
                price: 200,
                quantity: 65,
                reorderLevel: 15
            }

        ];

        localStorage.setItem(
            "products",
            JSON.stringify(defaultProducts)
        );

        return defaultProducts;
    }

    let products = JSON.parse(savedProducts);

    // Backfill reorderLevel for products saved before this feature existed
    products.forEach(function (p) {

        if (p.reorderLevel === undefined) {

            p.reorderLevel = 5;

        }

    });

    return products;
}


// ========================================
// GENERATE UNIQUE ID
// ========================================
// Using an id instead of array index fixes the bug where
// duplicate products (same name/price/quantity) would
// confuse indexOf() on the search results page.

function generateId() {

    return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2, 8)
    );

}


// ========================================
// SAVE PRODUCTS
// ========================================

function saveProducts(products) {

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

    // Refresh whatever is visible on THIS page immediately
    refreshCurrentPage();

}


// ========================================
// ESCAPE HTML
// ========================================
// Prevents product names like <img src=x onerror=alert(1)>
// from being executed when inserted into innerHTML.

function escapeHtml(text) {

    let div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ========================================
// VALIDATE PRODUCT INPUT
// ========================================

function validateProductInput(name, price, quantity, reorderLevel) {

    if (
        name === "" ||
        price === "" ||
        quantity === ""
    ) {

        alert("Please enter all information.");

        return false;
    }

    if (
        isNaN(price) ||
        isNaN(quantity) ||
        (reorderLevel !== "" && reorderLevel !== undefined && isNaN(reorderLevel))
    ) {

        alert("Price, quantity, and reorder level must be numbers.");

        return false;
    }

    if (
        Number(price) < 0 ||
        Number(quantity) < 0 ||
        Number(reorderLevel) < 0
    ) {

        alert("Price, quantity, and reorder level cannot be negative.");

        return false;
    }

    return true;

}


// ========================================
// ADD PRODUCT
// ========================================

function addProduct() {

    let products = getProducts();


    let name =
        document.getElementById("productName").value.trim();

    let price =
        document.getElementById("productPrice").value;

    let quantity =
        document.getElementById("productQuantity").value;

    let reorderInput =
        document.getElementById("productReorder");

    let reorderLevel =
        reorderInput !== null && reorderInput.value !== ""
            ? reorderInput.value
            : "5";


    if (!validateProductInput(name, price, quantity, reorderLevel)) {

        return;
    }


    let product = {

        id: generateId(),

        name: name,

        price: Number(price),

        quantity: Number(quantity),

        reorderLevel: Number(reorderLevel)

    };


    // Add product to array
    products.push(product);


    // Save updated array (this also refreshes the current page)
    saveProducts(products);


    // Clear inputs
    document.getElementById("productName").value = "";

    document.getElementById("productPrice").value = "";

    document.getElementById("productQuantity").value = "";

    if (reorderInput !== null) {

        reorderInput.value = "";

    }


    alert("Product added!");

}


// ========================================
// BUILD A PRODUCT LIST ITEM (shared by
// displayProducts and displaySearchResults)
// ========================================

function buildProductListItem(product) {

    let isLowStock =
        Number(product.quantity) <= Number(product.reorderLevel);

    let lowStockBadge =
        isLowStock
            ? "<span class='low-stock-badge'>Low stock</span>"
            : "";

    return (

        "<li class='" + (isLowStock ? "low-stock" : "") + "'>" +

        "<span class='product-info'>" +

        escapeHtml(product.name) +

        " - " +

        product.price +

        " ETB - " +

        product.quantity +

        " units " +

        lowStockBadge +

        "</span>" +

        "<button onclick='editProduct(\"" +

        product.id +

        "\")'>Edit</button>" +

        "<button class='delete' onclick='deleteProduct(\"" +

        product.id +

        "\")'>Delete</button>" +

        "</li>"

    );

}


// ========================================
// DISPLAY PRODUCTS
// ========================================

function displayProducts() {

    let list =
        document.getElementById("productList");


    if (list === null) {

        return;

    }


    let products = getProducts();


    list.innerHTML = "";


    for (
        let i = 0;
        i < products.length;
        i++
    ) {

        list.innerHTML += buildProductListItem(products[i]);

    }

}


// ========================================
// EDIT PRODUCT
// ========================================

function editProduct(id) {

    let products = getProducts();


    let product = products.find(function (p) {

        return p.id === id;

    });


    if (!product) {

        return;

    }


    let newName =
        prompt(
            "Enter new product name:",
            product.name
        );


    if (newName === null) {

        return;

    }

    newName = newName.trim();


    let newPrice =
        prompt(
            "Enter new price:",
            product.price
        );


    if (newPrice === null) {

        return;

    }


    let newQuantity =
        prompt(
            "Enter new quantity:",
            product.quantity
        );


    if (newQuantity === null) {

        return;

    }


    let newReorderLevel =
        prompt(
            "Enter new reorder level (low-stock warning threshold):",
            product.reorderLevel
        );


    if (newReorderLevel === null) {

        return;

    }


    if (!validateProductInput(newName, newPrice, newQuantity, newReorderLevel)) {

        return;

    }


    product.name = newName;

    product.price = Number(newPrice);

    product.quantity = Number(newQuantity);

    product.reorderLevel = Number(newReorderLevel);


    saveProducts(products);


    alert("Product updated!");

}


// ========================================
// DELETE PRODUCT
// ========================================

function deleteProduct(id) {

    let confirmation =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (confirmation === false) {

        return;

    }


    let products = getProducts();


    products = products.filter(function (p) {

        return p.id !== id;

    });


    saveProducts(products);


    alert("Product deleted!");

}


// ========================================
// SEARCH PRODUCTS
// ========================================

function searchProducts() {

    let searchInput =
        document.getElementById("searchProduct");


    if (searchInput === null) {

        return;

    }


    let products = getProducts();


    let searchText =
        searchInput.value.toLowerCase();


    let results = [];


    for (
        let i = 0;
        i < products.length;
        i++
    ) {

        if (
            products[i].name
                .toLowerCase()
                .includes(searchText)
        ) {

            results.push(products[i]);

        }

    }


    displaySearchResults(results);

}


// ========================================
// DISPLAY SEARCH RESULTS
// ========================================

function displaySearchResults(results) {

    let list =
        document.getElementById("searchResults");


    if (list === null) {

        return;

    }


    list.innerHTML = "";


    if (results.length === 0) {

        list.innerHTML =
            "<li class='empty-state'>No products found.</li>";

        return;

    }


    for (
        let i = 0;
        i < results.length;
        i++
    ) {

        list.innerHTML += buildProductListItem(results[i]);

    }

}


// ========================================
// SHOW ALL PRODUCTS
// ========================================

function showAllProducts() {

    let products = getProducts();

    displaySearchResults(products);

}


// ========================================
// DASHBOARD
// ========================================

function calculateDashboard() {

    // Get the latest products from localStorage

    let products = getProducts();


    let totalProducts =
        products.length;


    let totalStock = 0;

    let totalValue = 0;

    let lowStockCount = 0;


    for (
        let i = 0;
        i < products.length;
        i++
    ) {

        totalStock +=
            Number(products[i].quantity);


        totalValue +=
            Number(products[i].price) *
            Number(products[i].quantity);


        if (
            Number(products[i].quantity) <=
            Number(products[i].reorderLevel)
        ) {

            lowStockCount++;

        }

    }


    // TOTAL PRODUCTS

    let totalProductsElement =
        document.getElementById("totalproducts");


    if (totalProductsElement !== null) {

        totalProductsElement.textContent =
            totalProducts;

    }


    // TOTAL STOCK

    let totalStockElement =
        document.getElementById("totalstock");


    if (totalStockElement !== null) {

        totalStockElement.textContent =
            totalStock;

    }


    // TOTAL VALUE

    let totalValueElement =
        document.getElementById("totalvalue");


    if (totalValueElement !== null) {

        totalValueElement.textContent =
            totalValue + " ETB";

    }


    // LOW STOCK COUNT

    let lowStockElement =
        document.getElementById("lowstock");


    if (lowStockElement !== null) {

        lowStockElement.textContent =
            lowStockCount;

    }

}


// ========================================
// EXPORT BACKUP
// ========================================

function exportProducts() {

    let products = getProducts();

    let jsonText = JSON.stringify(products, null, 2);

    let blob = new Blob([jsonText], { type: "application/json" });

    let url = URL.createObjectURL(blob);


    let dateStamp =
        new Date().toISOString().slice(0, 10);


    let link = document.createElement("a");

    link.href = url;

    link.download = "products-backup-" + dateStamp + ".json";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}


// ========================================
// IMPORT BACKUP
// ========================================

function importProducts(event) {

    let file = event.target.files[0];


    if (!file) {

        return;

    }


    let reader = new FileReader();


    reader.onload = function (e) {

        let importedProducts;


        try {

            importedProducts = JSON.parse(e.target.result);

        } catch (err) {

            alert("That file isn't valid backup data (couldn't be read as JSON).");

            event.target.value = "";

            return;

        }


        if (!Array.isArray(importedProducts)) {

            alert("That file doesn't look like a products backup.");

            event.target.value = "";

            return;

        }


        // Basic shape check on the first item, if present
        if (
            importedProducts.length > 0 &&
            (
                typeof importedProducts[0].name !== "string" ||
                typeof importedProducts[0].price !== "number" ||
                typeof importedProducts[0].quantity !== "number"
            )
        ) {

            alert("That file doesn't look like a products backup.");

            event.target.value = "";

            return;

        }


        let confirmation = confirm(
            "This will REPLACE your current " +
            getProducts().length +
            " product(s) with " +
            importedProducts.length +
            " product(s) from the backup file. Continue?"
        );


        if (!confirmation) {

            event.target.value = "";

            return;

        }


        // Ensure every imported product has an id and reorderLevel
        importedProducts.forEach(function (p) {

            if (!p.id) {

                p.id = generateId();

            }

            if (p.reorderLevel === undefined) {

                p.reorderLevel = 5;

            }

        });


        saveProducts(importedProducts);


        event.target.value = "";


        alert("Backup imported!");

    };


    reader.readAsText(file);

}


// ========================================
// REFRESH WHATEVER IS ON THE CURRENT PAGE
// ========================================
// Called after every save so Dashboard/Products/Search
// pages update immediately without needing a manual reload,
// as long as they are the active tab.

function refreshCurrentPage() {

    displayProducts();

    calculateDashboard();


    // If the search results list is present and already
    // showing something, refresh it too (keeps "Show All"
    // or an active search in sync after an edit/delete).

    let searchResultsList =
        document.getElementById("searchResults");

    let searchInput =
        document.getElementById("searchProduct");

    if (searchResultsList !== null) {

        if (
            searchInput !== null &&
            searchInput.value.trim() !== ""
        ) {

            searchProducts();

        } else {

            showAllProducts();

        }

    }

}


// ========================================
// SYNC ACROSS TABS
// ========================================
// localStorage changes made in ANOTHER tab (e.g. Products page
// open in one tab, Dashboard open in another) fire a "storage"
// event on other tabs. Without this listener, a page that is
// already open and idle in another tab never learns that the
// data changed underneath it.

window.addEventListener("storage", function (event) {

    if (event.key === "products") {

        refreshCurrentPage();

    }

});


// ========================================
// RUN WHEN PAGE LOADS
// ========================================

displayProducts();

calculateDashboard();