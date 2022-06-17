// Simula la base de datos/API desde un archivo local
const RESOURCE_PATH = '../resources/products.json';

const keyItem = 'OganiProducts';

const productContainer = document.querySelector("#productContainer");
const divProducList = document.querySelector("#productList");
const search = document.querySelector("#search");
const cartCount = document.querySelector('#cart-count');
const floatCartCounter = document.querySelector('#float-counter-cart');
const floatCart = document.querySelector('#float-cart');
const modalProductContainer = document.querySelector('#modal-product-container');
const divTotal = document.querySelector('#total')

const btnVaciar = document.querySelector('#btn-vaciar');

let products


const loadProducts = async() => {
    if( !sessionStorage.getItem(keyItem) ) {
        const resp = await fetch(RESOURCE_PATH);
        products = await resp.json();
        sessionStorage.setItem(keyItem, JSON.stringify(products));
    }
    else {
        products = JSON.parse(sessionStorage.getItem(keyItem));
    }

    printProducts(products);
}


const printProducts = (products) => {
    productContainer.innerHTML = '';
    for (let product of products){
        const card = makeCardProduct(product);
        const div = document.createElement('div');
        div.innerHTML = card;
        productContainer.append(div.firstElementChild);
    }
    setNumberOfProductsInCart()
}


const makeCardProduct = (product) => {
    const { name, image, price, realPrice, id, added, discount, saleOff } = product;
    let card

    if (saleOff){
        card = `
            <div class="col-xs-12 col-md-3 card mx-3 my-4 offset-1 shadow">
                <img src="./img/product/${image}" class="card-img-top" alt="${name}">
                <div class="product__discount__percent shadow">-${discount}%</div>
                <div class="card-body">
                    <h5 class="card-title text-center">${name} </i></h5>
                    <div class="product__item__real__price text-center">$${realPrice}</div>
                    <div class="product__item__price mb-2 text-center">$${price}</div>
                    <a  id="${id}" 
                        class="btn btn-primary btn-hover ${added ? "added-to-cart" : "" }" 
                        onclick="addOrDeleteProduct(${id})"> 
                        ${ added ? "En carrito" : "Agregar al carrito"} | 
                        <i class="bi ${added ? "bi-cart-check-fill" : "bi-cart3"}"></i>
                    </a>
                </div>
            </div>`
    }
    else {
        card = `
            <div class="col-xs-12 col-md-3 card mx-3 my-4 offset-1 shadow">
                <img src="./img/product/${image}" class="card-img-top" alt="${name}">
                <div class="card-body">
                    <h5 class="card-title text-center">${name} </i></h5>
                    <div class="product__item__price mb-2 text-center mt-4">$${price}</div>
                    <a  id="${id}" 
                        class="btn btn-primary btn-hover ${added ? "added-to-cart" : "" }" 
                        onclick="addOrDeleteProduct(${id})"> 
                        ${ added ? "En carrito" : "Agregar al carrito"} | 
                        <i class="bi ${added ? "bi-cart-check-fill" : "bi-cart3"}"></i>
                    </a>
                </div>
            </div>`
    }
    return card
}


const setNumberOfProductsInCart = () => {
    const productsInCart = products.filter( prod => prod.added ).length;
    cartCount.innerText = productsInCart;
    floatCartCounter.innerText = productsInCart;
}

const addOrDeleteProduct = (element) => {
    const {id} = element;
    products.filter(prod => {
        if (prod.id === id){
            const btn = document.querySelector(`#${id}`);

            if (prod.added){
                prod.quantity = 0;
                btn.classList.remove('added-to-cart');
                btn.innerHTML = `Agregar al carrito | 
                <i class="bi bi-cart3"></i>`
            }
            else {
                btn.classList.add('added-to-cart');
                prod.quantity = 1;
                btn.innerHTML = `En carrito | 
                <i class="bi bi-cart-check-fill"></i>`
            }
            prod.added = !prod.added;
        }
    });
    sessionStorage.setItem(keyItem, JSON.stringify(products));
    setNumberOfProductsInCart();
}

const calculatedTotal = () => {
    let total = 0
    products.filter( (prod) => {
        if ( prod.added ){
            total += prod.quantity * prod.price;
        }
    })
    divTotal.innerText = total;
}


/*
    EVENT
    ***** 
*/

/* El evento tiene un delay de una tecla, por lo que filtra atrasado */
search.addEventListener('keypress', (event) => {
    const text = event.target.value.toLowerCase();
    let prodList
    if (text.length > 0){
        prodList = products.filter((prod) => {
        return prod.name.toLowerCase().indexOf(text) > -1 });
    }
    else {
        prodList = products;
    }
    printProducts(prodList);
});


floatCart.addEventListener('click', () => {
    modalProductContainer.innerHTML = '';
    const productList = products.filter( prod => prod.added );
    if ( !productList.length){
        return
    }
    for (const prod of productList){
        const tr = `<th scope="row">1</th>
                    <td>${prod.name}</td>
                    <td>$${prod.price}</td>
                    <td>
                        <input 
                            type="number" 
                            class="d-inline-block" 
                            size="2" 
                            value=${prod.quantity} 
                            min="0"
                            onChange="setQuantity(value,${prod.id})">
                    </td>
                    `

        const trow = document.createElement('tr');
        trow.innerHTML = tr;
        modalProductContainer.append(trow);
    }
    calculatedTotal();

})


btnVaciar.addEventListener('click', () => {
    sessionStorage.clear();
    location.reload();
});

const setQuantity = ( q, element) => {
    console.log(q,element)
    const {id} = element;
    products.filter(prod => {
        if ( prod.id === id ){
            prod.quantity = q;
        }
    })
     sessionStorage.setItem(keyItem, JSON.stringify(products));
     calculatedTotal();
}
/*  
        Al cargar la página ("loadProducts") verifico si existe la lista de productos en el "storage" 
    y de existir, no busco los datos en el JSON (base de datos) para mantener la persistencia de 
    informacion ante un refresh.
        A su vez, me interesa que los datos no persistan por mucho tiempo, ya que ante un cambio en
    la lista de productos y precios, no se veria reflejado en el navegador del cliente hasta forzar 
    el borrado del "storage".
        Por tal motivo, me parecio mas correcto utilizar SESSIONSTORAGE en lugar de localStorage. 
    */

        
/* 
    START
    *****
*/

loadProducts();