const commander = document.querySelector("#open-cart");
commander.setAttribute("data-toggle", "modal")
commander.setAttribute("data-target", "#cart")

const body = document.querySelector("body");
const stylesheet = document.createElement("style")
stylesheet.innerHTML = ".global-container {margin: auto;margin-top: 10vh;width: 50vw;padding: 20px;background-color: white;border: 10px solid #ffffff;border-radius: 10px;}@media (max-width: 1000px) {.global-container {    width: 90vw;}}.product-pict {height: 100px;width: 4px;}.trash-pict {height: 10px;width: 10px;margin-bottom: 20%;}.product-pict {margin: auto;width: 69px;height: 69px;border-radius: 7px;}.container-receipe,.container-total {display: flex;padding: 16px 14px 16px 16px;flex-direction: row;align-items: flex-end;justify-content: space-between;}.container-receipe {border-top: 2px solid rgba(0, 0, 0, 0.30);border-bottom: 2px solid rgba(0, 0, 0, 0.30);}.container-product-bis {display: flex;align-items: flex-start;flex-direction: row;justify-content: center;}.container-product {display: flex;padding: 16px 14px 16px 16px;flex-direction: row;align-items: center;justify-content: space-between;border-radius: 15px;border: 2px solid rgba(0, 0, 0, 0.30);background: #FFF;gap: 10px;margin-bottom: 1%;}.reciep-text {color: rgba(0, 0, 0, 0.30);font-family: Source Sans 3;font-style: normal;font-weight: 600;line-height: normal;}.total-title {font-family: Stolzl;font-size: 24px;font-weight: 700;}.tital-price {font-size: 16px;}.product-name {margin-left: 10px;font-family: Stolzl;font-size: 15px;font-weight: 700;}.product-description {margin-left: 10px;font-size: 13px;}.product-price {margin-left: 10px;font-size: 16px;font-weight: 400;}.product-quantity {font-size: 13px;}p {color: #000;font-family: Source Sans 3;font-style: normal;font-weight: 600;line-height: normal;}.button {width: 84%;margin: auto;display: flex;padding: 16px 40px;justify-content: center;align-items: center;gap: 8px;border-radius: 5px;background: #000;color: #FFF;}"
body.appendChild(stylesheet)
console.log(body)
const modalDiv = document.createElement("div");
modalDiv.setAttribute("id", "cart")
modalDiv.setAttribute("index", "-1")
modalDiv.setAttribute("role", "dialog")
modalDiv.setAttribute("aria-labelledby", "exampleModalLabel")
modalDiv.setAttribute("aria-hidden", "true")
modalDiv.setAttribute("class", "modal fade")

modalDiv.innerHTML = '<div class="global-container"><p class="title">Panier</p><div class="container-product"><div class="container-product-bis"><img class="product-pict" src="collar.png" alt="product" /><div class="container-product-text"><p class="product-name">Jag GPS S2 - Jaune</p><p class="product-description">Abonnement start</p><p class="product-price">108,00 &euro;</p></div></div><p class="product-quantity">Qut : 1</p><img class="trash-pict" src="trash.png" alt="trash" /></div><div class="container-receipe"><div class="container-sub-reciepe"><p class="reciep-text">Frais D\'activitation</p><p class="reciep-text">5,00&euro;</p></div><div class="container-sub-reciepe"><p class="reciep-text">Livraison</p><p class="reciep-text">GRATUIT</p></div></div><div class="container-total"><p class="total-title">Total</p><p class="total-price">133,00&euro;</p></div><button id="validate-cart" class="button">Finaliser la commande</button></div>'
body.appendChild(modalDiv)

class Product {
    constructor(name, price, image, subscription) {
        this.name = name;
        this.price = price;
        this.image = image;
        this.subscription = subscription;
    }
}

class ProductCart extends Product {
    constructor(product, count) {
        super(product.name, product.price, product.image, product.subscription)
        this.count = count;
    }
}

class ShoppingCart {
    constructor() {
        if (localStorage.getItem("shoppingCart")) {
            this.items = JSON.parse(localStorage.getItem("shoppingCart"))
        } else {
            this.items = []
        }
    }

    findItemIndexByName(name) {
        const itemIndex = this.items.findIndex((item) => {
            return item.name === name
        })
        return itemIndex
    }

    addItem(item, count = 1) {
        const itemIndex = this.findItemIndexByName(item.name)
        if (itemIndex < 0) {
            const cardProduct = new ProductCart(item, count)
            this.items.push(cardProduct)
        } else {
            this.items[itemIndex].count++
        }
        this.saveCart()
    }

    removeItem(item, count = 1) {
        const itemIndex = this.findItemIndexByName(item.name)
        if (itemIndex < -1) {
            throw new Error();
        }
        this.items.count -= count
        if (this.items.count <= 0) {
            this.clearItem(item);
        }
    }

    setItemCount(item, count) {
        const itemIndex = this.findItemIndexByName(item.name)
        if (itemIndex < -1) {
            throw new Error();
        }
        if (count < 0) {
            throw new Error();
        }
        if (count === 0) {
            this.removeItem(item)
        } else {
            this.items[itemIndex].count = count
        }
    }

    clearItem(item) {
        const itemIndex = this.findItemIndexByName(item.name)
        if (itemIndex < -1) {
            throw new Error();
        }
        this.items.slice(itemIndex, 1)
    }

    countItems() {
        let total = 0
        this.items.forEach(item => {
            total += item.count
        })
        return total
    }

    getTotalPrice() {
        let price = 0;
        this.items.forEach(item => {
            price += item.price * item.count
        })
        return price;
    }

    listItems() {

    }

    clear() {
        this.items = []
        this.saveCart();
    }

    saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.items));
    }

    getCartStripeUrl() {
        const answer = fetch("http://0.0.0.0:3000/stripe/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cart: this.items, mode: 'payment' })
        })
        return answer
    }
}

const getProductsFromStripe = async () => {
    const answer = await fetch("http://0.0.0.0:3000/stripe/products?livemode=false", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
    return answer
}


const shoppingCart = new ShoppingCart();

const constructProductList = async () => {
    const products = await getProductsFromStripe()
    const productJSON = await products.json();
    console.log(productJSON)
    const divProductList = document.getElementsByClassName('product-list')[0];

    for (const product of productJSON) {
        const divCol = document.createElement('div');
        divCol.classList.add('col')
        const divCard = document.createElement('div');
        divCard.classList.add('card')
        divCard.style = "width: 20rem;"
        const img = document.createElement('img');
        img.classList.add('card-img-top')
        img.alt = 'Card image cap'
        img.src = product.image ?? ""
        const divCardBlock = document.createElement('div');
        divCardBlock.classList.add('card-block')
        const title = document.createElement('h4')
        title.classList.add('card-title')
        title.textContent = product.name
        const price = document.createElement('p')
        price.classList.add('card-text')
        price.textContent = product.prices[0].price + product.prices[0].currency
        const button = document.createElement('a')
        button.href = "#"
        button.setAttribute('data-name', product.metadata ? product.metadata.name : product.name)
        button.setAttribute('data-price', product.prices[0].price)
        button.setAttribute('data-image', product.image ?? "")
        button.classList.add("add-to-cart", "btn", "btn-primary")
        button.onclick = (event) => {
            addToCart(event)
        }
        button.textContent = "Add to cart"

        divProductList.appendChild(divCol)
        divCol.appendChild(divCard)
        divCard.appendChild(img)
        divCard.appendChild(divCardBlock)
        divCardBlock.appendChild(title)
        divCardBlock.appendChild(price)
        divCardBlock.appendChild(button)
    }
}
constructProductList()

const createCardTableProduct = (productCart) => {
    const divProductList = document.querySelector('.product-cart');
    const divProduct = document.createElement('div')
    divProduct.classList.add('product-cart-list')
    divProductList.appendChild(divProduct)
    const image = document.createElement('img')
    image.src = productCart.image;
    image.classList.add('cart-img')
    const productInfo = document.createElement('div')
    const name = document.createElement('div')
    name.textContent = productCart.name;
    const price = document.createElement('div')
    price.textContent = productCart.price + " &euro;";
    const countDiv = document.createElement('div')
    countDiv.classList.add('quantity')
    const buttonMinus = document.createElement('button')
    buttonMinus.textContent = "-"
    buttonMinus.classList.add('btn', 'minus1')
    const buttonPlus = document.createElement('button')
    buttonPlus.classList.add('btn', 'add1')
    buttonPlus.textContent = "+"
    const count = document.createElement('input')
    count.classList.add('quantity')
    count.setAttribute('id', 'id_form-0-quantity')
    count.setAttribute('min', '1')
    count.setAttribute('name', 'form-0-quantity')
    count.setAttribute('value', productCart.count)
    count.setAttribute('type', 'number')
    countDiv.append(buttonMinus)
    countDiv.append(count)
    countDiv.append(buttonPlus)
    divProduct.appendChild(image)
    divProduct.appendChild(productInfo)
    productInfo.appendChild(name)
    productInfo.appendChild(price)
    divProduct.appendChild(countDiv)
}

const addToCart = (event) => {
    event.preventDefault();
    var name = event.target.getAttribute('data-name');
    var price = Number(event.target.getAttribute('data-price'));
    var img = event.target.getAttribute('data-image');
    shoppingCart.addItem(new Product(name, price, img), 1)
}

const redirectToStripe = async (event) => {
    event.preventDefault();
    const apiRes = await shoppingCart.getCartStripeUrl()
    const apiResJson = await apiRes.json()
    window.location.href = apiResJson.url
}

const showCart = document.getElementById('open-cart');
showCart.onclick = (event) => {
    event.preventDefault();
    // const divProductList = document.querySelector('.product-cart');
    // console.log('divProductList =>', divProductList)
    // divProductList.innerHTML = ""
    let total = shoppingCart.getTotalPrice();
    shoppingCart.items.forEach((item) => {
        console.log('item')
        createCardTableProduct(item);
        if (item.name === 'collar_jl2') {
            const fees = document.querySelector('#activation-fees')
            fees.textContent = 5 * item.count + "eur"
            total += (5 * item.count)
        }
    })
    const totalSpan = document.querySelector('#total-cart')
    totalSpan.textContent = total + "eur"
}

const clearCart = document.getElementsByClassName('clear-cart')[0];
clearCart.onclick = (event) => {
    shoppingCart.clear();
}

const goToStripe = document.getElementById("validate-cart");
goToStripe.onclick = (event) => {
    redirectToStripe(event)
}