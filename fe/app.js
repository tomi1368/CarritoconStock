const template = document.getElementById("carro-template").content,
  fragment = document.createDocumentFragment(),
  container = document.querySelector(".container"),
  loader = document.querySelector(".loader");
let carrito = {},
lista= [];

const getData = async () => {
  try {
    let data = await fetch("/api/products"),
      response = await data.json();
    if (!data.ok) throw {status: res.status, statusText: res.statusText };
    lista = response;
    printData();
  } catch (e){
    console.error(e);
  }
};
//Recorro la lista de productos y los que tienen stock 0 los pinto de gris.
const checkStocks =  () => {
  lista.forEach(item=>{
    if (item.stock <= 0){
     let btns = document.querySelectorAll(".buy[data-id]")
     btns.forEach(btn => {
       btn.dataset.id == item.id ? btn.classList.add("disabled") : btn.classList.remove("disabled")
     })
    }
  })
}
//Cuando apreto el boton de comprar le envio al servidor el carrito con los productos y la cantidad de cada uno para que lo descuente del stock
const payProduct = async () => {
  try {
    const preference = await (await fetch("/api/pay",{
        method: "POST",
        body: JSON.stringify(Object.values(carrito)),
        headers: {
          "Content-Type": "application/json",
        }})
    ).json();
    var script = document.createElement("script");
    // The source domain must be completed according to the site for which you are integrating.
    // For example: for Argentina ".com.ar" or for Brazil ".com.br".
    script.src = "https://www.mercadopago.com.ar/integrations/v1/web-payment-checkout.js";
    script.type = "text/javascript";
    script.dataset.preferenceId = preference.preferenceId;
    script.setAttribute("data-button-label", "Pagar con Mercado Pago");
    document.getElementById("content").innerHTML = "";
    document.querySelector("#content").appendChild(script);
    /* lista = await preference */ //Esa respueta que viene con el stock del servidor guardo en lista para ver los productos y controlar el stock desde el front 
    console.log(lista);
    console.log(preference);
  } catch (e) {
    console.error(e);
  }
  //await getData()
  emptyCart() //Una vez realizo la compra vacio el carrito y el boton lo pongo sin productos
};

const emptyCart = ()=>{
  const btnCart = document.querySelector(".btn-cart");
  carrito = {};
  btnCart.textContent = `Products (0)`;
}
//Cuando clickeo en un producto envio el elemento y si no hay stock pongo el boton en gris.
const addProduct = (producto) => {
  let product = producto.parentElement;
  changeShoppingCart(product);
  checkStocks()
};
//Agrego las productos que eligio el usuario al boton de comprar
const printShoppingCart = (shopList) => {
  const btnCart = document.querySelector(".btn-cart");
  let size = 0;
  list = Object.values(shopList);
  list.forEach((el) => {
    size += el.quantity; //Recorro todos los productos y me fijo cuantas productos de cada uno eligio el usuario
  });
  btnCart.textContent = `Products (${size})`;//Al boton le pongo el total de productos elegidos
};
//Lleno el carrito usando el elemento padre del boton con un id correspondiente
const changeShoppingCart = (productList) => {
  const producto = {
    id: productList.querySelector("button").getAttribute("data-id"),
    image: productList.querySelector(".img img").getAttribute("src"),
    price: productList.querySelector("p").textContent,
    quantity: 1,
  };
  //Si aprieto el mismo producto la cantidad en el objeto producto va a aumentar en 1
  for (let i in carrito) {
    if (
      productList.querySelector("button").getAttribute("data-id") ===
      carrito[i].id
    ) {
      producto.quantity = carrito[carrito[i].id].quantity + 1;
    }
  } //Founda lo voy a usar cuando agrego al carro y quiero saber el stock del lado del front
  let founda = lista.find( p => p.id == producto.id) //Busco el elemento sumado al carrito lo coincido con el elemento de la lista traida del servidor y a ese elemento que coincide con el id le bajo el stock a ese elemento de lista
  founda.stock --; //Le al stock del lado del front
  carrito[producto.id] = {...producto};
  printShoppingCart(carrito);
};
//Pinto lo que me envia el servidor cuando cargo el html
const printData = () => {
  lista.forEach((el) => {
    template.querySelector(".card .img img").setAttribute("src", el.image);
    template.querySelector("h3").textContent = el.title;
    template.querySelector("p").textContent = `$${el.price}`;
    template.querySelector("button").dataset.id = el.id;
    let clone = document.importNode(template, true);
    fragment.appendChild(clone);
  });
  container.appendChild(fragment);
};

document.addEventListener("DOMContentLoaded", async (e) => {
  try {
    await getData();
  } catch (e) {
    console.log(e);
  } finally {
    loader.style.opacity = 0;
    loader.style.visibility = "hidden";
  }
});

document.addEventListener("click", (e) => {
  if (e.target.matches(".buy")) {
    addProduct(e.target);
  }
  if (e.target.matches(".btn-cart")) {
    payProduct()
  }
});
