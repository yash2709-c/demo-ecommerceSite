// variables 

const cartBtn = document.querySelector(".cart-btn");
const productsDOM = document.querySelector(".products-center");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const cartOverlay = document.querySelector(".cart-overlay");
const cartDOM = document.querySelector(".cart");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
// cart
let cart = [];
let buttonsDOM = [];
let removeItemDOM = [];
// Classes

// Getting Products
class Products {
    async getProducts() {
        try {
            let result = await fetch("products.json");
            let data = await result.json();
            // return data;
            let products = data.items;
            // console.log(products);
            products = products.map((item)=>{
                const {title, price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title, price, id, image}
            });
            return products;
        }
        catch(error) {
            console.log(error);
        }
    }
}

// Display UI Class/products
class UI{
    displayProducts(products){
        let result = '';
        products.forEach(product => {
            result += `
            <!-- Single Product -->
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        Add to bag
                    </button>
                </div> 
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            <!-- end of Single Product -->`
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        // console.log(buttons);
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if(inCart){
                button.innerHTML = "In Cart";
                button.disabled = true;
            }
            button.addEventListener('click', (event)=>{
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                // get products from Products
                let cartItem = {...Storage.getProducts(id), amount: 1};
                // add product to  the cart
                cart = [...cart, cartItem];
                // console.log(cart);
                // save cart in local storage
                Storage.saveCart(cart);
                // set the cartvalue
                this.setCartValues(cart);
                // display cart item 
                this.addCartItem(cartItem);
                // show the cart
                this.showCart();
            })
        })
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
    addCartItem(item) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `<img src=${item.image} alt="product">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>Remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>` ;
        cartContent.appendChild(div);
    }
    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
        this.cartLogic();
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    cartLogic(){
        // clear cart function
        clearCartBtn.addEventListener('click', ()=> {this.clearCart()});
        // cart functionality
        cartContent.addEventListener('click', event => {
            console.log(event.target);
            if(event.target.classList === 'remove-item') {
                this.removeItem(event.dataset.id);
            };
        })
    }
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>
                        Add to Cart`;
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
    removeSingleItem(id) {

    }
}

// Setting up Local Storage
class Storage{
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProducts(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[];
    }
}

// At the time of loading the content 

document.addEventListener('DOMContentLoaded', ()=> {
    const products = new Products();
    // console.log(products);
    const ui = new UI();
    ui.setupAPP();
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(()=> {
        ui.getBagButtons();
    })
})