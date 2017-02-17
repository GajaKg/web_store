/*
sessionStorage.setItem('isActiveSession', true);
sessionStorage.setItem('user', username);
*/
if(!sessionStorage.getItem('isActiveSession')){
   window.location = 'login.html';
} 

var customer = sessionStorage.getItem("user");
var products = getServiceData("GET", "https://services.odata.org/V3/Northwind/Northwind.svc/Products?&$format=json", false).value;
var categories = getServiceData("GET", "https://services.odata.org/V3/Northwind/Northwind.svc/Categories?&$format=json", false).value; 
var employees = getServiceData("GET", 'https://services.odata.org/V3/Northwind/Northwind.svc/Employees?$format=json', false).value;
var orders = getServiceData("GET", "https://services.odata.org/V3/Northwind/Northwind.svc/Orders?$expand=Order_Details&$format=json", false).value;

function getServiceData(method, url, bool){
    
    try{
        var result, req;
        /*
        if(window.XMLHttpRequest()){
            req = new XMLHttpRequest();
        } else {
            req = new ActiveXObject("Microsoft.XMLHTTP");
        }
        */
        
        req = new XMLHttpRequest();
        
        req.onreadystatechange = function(){
            if(req.readyState == 4 && req.status == 200){
                result = JSON.parse(req.response);
            }
        }
        
        req.open(method, url, bool);
        req.send();
        return result;
    }
    catch(error){
        return error;
    }
}


// ********************** on WINDOW LOAD *********************** \\
$(document).ready(function(){
    
   //checkingIfUserLogedin();
    
enableProductSearch();
    
$("#customer-name").html("<span class='wellcome'>wellcome, </span>" + customer);
    
/*
    $('#myTable').DataTable({
        data: products,
        columns: [
            { data: 'ProductName' },
            { data: 'UnitPrice' },
            { data: 'QuantityPerUnit' },
            { data: 'UnitsInStock' }
        ]
    });
*/
    
// displaying categories for modal
for(var c in categories){
    $("#categoriesModal").append("<option value='"+categories[c].CategoryName+"'>"+categories[c].CategoryName+"</option>");
}
    // modal input validity
$("#addModal").click(function(){
    if(!document.getElementById("productPriceModal").validity.rangeUnderflow  && !document.getElementById("productNameModal").validity.valueMissing){
        
        if(!inOrders){
            inBasket ? alert("Can't add!") : newProduct();
        } else {
            alert("Can't add!");
        }
        
        
    } else {
    
        alert("Name of product can't be blank and price of product must be at least 0!");
    }
});
    
//* search category 
$("#searchCategory").append("<option value='All categories'>All categories</option>");
for(var c in categories){
    $("#searchCategory").append("<option value='"+categories[c].CategoryName+"'>"+categories[c].CategoryName+"</option>");
}    

    
displayAllProducts();
    
    
}); ///

function displayAllProducts(){
    $("section").html("");
    inBasket = false;
    disableOrdersSearch()
    enableProductSearch();
    
    for(var p in products){
        products[p].CategoryName = getCategoryNameByProductCategoryId(products[p].CategoryID);
        HTMLproductBox(products[p]);
    }
}

function createProductObject(ProductID, ProductName, CategoryName, UnitPrice, /*Quantity,*/ Image){
    this.ProductID = ProductID;
    this.ProductName = ProductName;
    this.CategoryName = CategoryName;
    this.UnitPrice = UnitPrice;
    //this.Quantity = Quantity;
    this.Image = Image;
}

function newProduct(){
    var ProductID = $("article").size()+1; 
    var ProductName = $("#productNameModal").val();
    var CategoryName = $("#categoriesModal").val();
    var UnitPrice = $("#productPriceModal").val();
    var Image = "";
    
    var addedProduct = new createProductObject(ProductID, ProductName, CategoryName, UnitPrice, /*Quantity,*/ Image);
    HTMLproductBox(addedProduct);
}



function getCategoryNameByProductCategoryId(categoryId){
    for(var i in categories){ 
        if(categories[i].CategoryID == categoryId){
            return categories[i].CategoryName;
        }
    } 
}

// displaying products
function HTMLproductBox(product){
    //var section = $("section");
    $("section").append("<article id='article"+product.ProductID+"'>");
    $("#article"+product.ProductID).append("<div id='box"+product.ProductID+"'>");
    
    $("#box"+product.ProductID).append("<div id='productName"+product.ProductID+"'>"+product.ProductName+"</div>");

    $("#box"+product.ProductID).append("<div class='productCategory'>Category: <span>"+product.CategoryName+"</span></div>");    
    
    $("#box"+product.ProductID).append("<div class='productImage"+product.ProductID+"'>");
        $(".productImage"+product.ProductID).append("<img id='img"+product.ProductID+"' src='images/proizvodi/1.jpg'>");

    $("#box"+product.ProductID).append("<div class='productPrice"+product.ProductID+"'><span>"+product.UnitPrice+"</span> $</div>");

    $("#box"+product.ProductID).append("<div class='q"+product.ProductID+"'></div>");

    $("#box"+product.ProductID).append("<div id='productDetails"+product.ProductID+"'>"+
// buttons                                    
"<input type='number' id='quantity"+product.ProductID+"' style='width:55px'; value='1' min='1' />"+                  
"<button class='glyphicon glyphicon-plus button-style' id='p"+product.ProductID+"' onclick='addProductToCart(this)'></button>"+
"<button class='glyphicon glyphicon-minus button-style' id='p"+product.ProductID+"' onclick='removeProductFromCart(this)' ></button>"+
"<button class='glyphicon glyphicon-info-sign info-style' id='info"+product.ProductID+"' onclick='productInfo(this)'></button>"

                                       +"</div>");
    // show info button only if we are in basket
    if(!inBasket){
        $("#info"+product.ProductID).hide();
    }
}

function productInfo(e){
    var btnId = e.id; 
    var ProductID = btnId.slice(4);

    var foundProduct = findProductInBasket(ProductID);

    var productInfo = "Quantity: "+foundProduct.Quantity+" <br/> Category: "+foundProduct.CategoryName+"";

    $(".q"+ProductID).notify(productInfo);
    
    
}

function findProductByID(ProductID){  
    for(product in products){
        if(ProductID == products[product].ProductID){
            return products[product];
        }  
    }  
}





/****************** CONFIRM ORDER ********************/
function findOrdersByCustomerID(){
    var customerOrders = [];
    for(var o in orders){
        if(orders[o].CustomerID == customer){
            customerOrders.push(orders[o]);
        }
    }
    return customerOrders;
}

// customer orders
var customerOrders = findOrdersByCustomerID();

function orderObject(CustomerID, Order_Details, ShipCity, ShipCountry, OrderDate){
    this.CustomerID = CustomerID;
    this.Order_Details = Order_Details;
    this.ShipCity = ShipCity;
    this.ShipCountry = ShipCountry;
    this.OrderDate = OrderDate;
}

function confirmOrder(){
    var confirmed = confirm("Are you sure?");
    var Order_Details = [];
    
    if(confirmed && basket.length > 0){
        var CustomerID = customer;
        var ShipCity = customerOrders[0].ShipCity;
        var ShipCountry = customerOrders[0].ShipCountry;
        var OrderDate = todayDate();
        var Order_Details; 
        
        // insert objects in array
        for(var p in basket){
            Order_Details.push({
                    UnitPrice: basket[p].UnitPrice,
                    Quantity: basket[p].Quantity
                }
            )
        }
                
        var createOrder = new orderObject(CustomerID, Order_Details, ShipCity, ShipCountry, OrderDate); console.log(createOrder);
            
        customerOrders.push(createOrder);
        
        bill = 0; // reset js counter
        $("#bill").html("0"); // reset price on screen
        inBasket ? $("section").html("") : null; // reset basket screen if in basket
        basket = []; // reset basket    
        
    } else {
        alert("Basket is empty");
    }

    
}





/**************************** SEARCH PRODUCTS *********************************/
function getProductsByCategoryName(categoriesFilter, searchPlace){
    
    var productsByCategory = [];
    
    for(var p in searchPlace){
        
        searchPlace[p].CategoryName = getCategoryNameByProductCategoryId(searchPlace[p].CategoryID);
        
        if(searchPlace[p].CategoryName == categoriesFilter){
            
            productsByCategory.push(searchPlace[p]);
            
        }  
        
    }
   
    return productsByCategory;
}

function getProductsByWord(word, searchPlace){
    var productsByWordCat = [];
    for(var p in searchPlace){
        if(searchPlace[p].ProductName.toLowerCase().indexOf(word) > -1 || searchPlace[p].ProductName.indexOf(word) > -1){
            productsByWordCat.push(searchPlace[p]);
        } 
    }
      
    return productsByWordCat;    
}

function getProductsByPrice(selectedPrice, selectedRange, searchPlace){
    var byPrice = [];
    
    if(selectedRange == "largerEqual"){
        for(var p in searchPlace){
            if(parseInt(searchPlace[p].UnitPrice, 10) >= selectedPrice){
                byPrice.push(searchPlace[p]);
            }
        } 
    }

    if(selectedRange == "equal"){
        for(var p in searchPlace){
            if(parseInt(searchPlace[p].UnitPrice, 10) == selectedPrice){
                byPrice.push(searchPlace[p]);
            }
        } 
    }

    if(selectedRange == "smallerEqual"){
        for(var p in searchPlace){
            if(parseInt(searchPlace[p].UnitPrice, 10) <= selectedPrice){
                byPrice.push(searchPlace[p]);
            }
        } 
    }
    
    return byPrice;
}

function searchProducts(){
    
    var word = $("#searchProduct").val(); //console.log(word);
    var selectedCategory = $("#searchCategory").val(); //console.log(selectedCategory);
    var selectedPrice = $("#searchPrice").val(); //console.log(selectedPrice);
    var selectedRange = $("#searchRange").val(); //console.log(selectedRange);
    $("section").html("");
    
    if(!inBasket){
        
        if(selectedCategory == "All categories"){
            
            if(word == ""){
                var foundProducts = getProductsByPrice(selectedPrice, selectedRange, products);
                
                if(selectedRange == "largerEqual"){
                    //console.log(foundProducts);
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }

                if(selectedRange == "equal"){
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }

                if(selectedRange == "smallerEqual"){
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }
                    
               
            } // if(word == "")
            
            if(word != ""){
                var productsByWord = getProductsByWord(word, products);
                
                if(selectedRange == "largerEqual"){
                    var foundProducts = getProductsByPrice(selectedPrice, selectedRange, productsByWord);
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }

                if(selectedRange == "equal"){
                    var foundProducts = getProductsByPrice(selectedPrice, selectedRange, productsByWord);
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }

                if(selectedRange == "smallerEqual"){
                    var foundProducts = getProductsByPrice(selectedPrice, selectedRange, productsByWord);
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }
                
            } // if(word != ""){
            
        } // if(selectedCategory == "All categories"){
        
        if(selectedCategory != "All categories"){
            
            var productsByCategory = getProductsByCategoryName(selectedCategory, products); 
            if(word == ""){
                
                var foundProducts = getProductsByPrice(selectedPrice, selectedRange, productsByCategory);
                if(selectedRange == "largerEqual"){
                    
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }

                if(selectedRange == "equal"){
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }

                if(selectedRange == "smallerEqual"){
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }
                
            } // if(word == ""){
            
            if(word != ""){
                var productsByWord = getProductsByWord(word, productsByCategory);
                var foundProducts = getProductsByPrice(selectedPrice, selectedRange, productsByWord);
                
                if(selectedRange == "largerEqual"){
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }

                if(selectedRange == "equal"){
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }

                if(selectedRange == "smallerEqual"){
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }
                
            } //if(word != ""){
        }
        
    } 
    
    if(inBasket){
        
        if(selectedCategory == "All categories"){
            
            if(word == ""){
                var foundProducts = getProductsByPrice(selectedPrice, selectedRange, basket);
                
                if(selectedRange == "largerEqual"){
                    //console.log(foundProducts);
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }

                if(selectedRange == "equal"){
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }

                if(selectedRange == "smallerEqual"){
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }
                    
               
            } // if(word == "")
            
            if(word != ""){
                var productsByWord = getProductsByWord(word, basket);
                var foundProducts = getProductsByPrice(selectedPrice, selectedRange, productsByWord);
                if(selectedRange == "largerEqual"){
                    
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }

                if(selectedRange == "equal"){
                    
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }

                if(selectedRange == "smallerEqual"){
                    
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }
                
            } // if(word != ""){
            
        } // if(selectedCategory == "All categories"){
        
        if(selectedCategory != "All categories"){
            
            var productsByCategory = getProductsByCategoryName(selectedCategory, basket); 
            if(word == ""){
                
                var foundProducts = getProductsByPrice(selectedPrice, selectedRange, productsByCategory);
                if(selectedRange == "largerEqual"){
                    
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }

                if(selectedRange == "equal"){
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }

                if(selectedRange == "smallerEqual"){
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }
                
            } // if(word == ""){
            
            if(word != ""){
                var productsByWord = getProductsByWord(word, productsByCategory);
                var foundProducts = getProductsByPrice(selectedPrice, selectedRange, productsByWord);
                
                if(selectedRange == "largerEqual"){
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }

                if(selectedRange == "equal"){
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }

                if(selectedRange == "smallerEqual"){
                    for(var p in foundProducts){
                        foundProducts[p].CategoryName = getCategoryNameByProductCategoryId(foundProducts[p].CategoryID);
                        HTMLproductBox(foundProducts[p]);
                    }
                }
                
            } //if(word != ""){
        }
    }
}





/******************* ADD, REMOVE --- BASKET ---- SHOW, FIND ************************/
function findProductInBasket(ProductID){
    for(var p in basket){
        if(basket[p].ProductID == ProductID){
            return basket[p];
        }
    }
}

// setting bill and basket
var bill = 0;
var basket = [];
function addProductToCart(e){
    var buttonId = e.id; //console.log(ProductID);
    var ProductID = buttonId.slice(1); //console.log(ProductID);
    var quantity = $("#quantity"+ProductID).val(); //console.log(quantity);
    
    var product = findProductByID(ProductID); //console.log(product); 
    // if can't find product in db then create new object
    if(!product){
        var ProductName = $("#productName"+ProductID).html();
        var CategoryName = $(".productCategory span").html(); //console.log(CategoryName);
        var UnitPrice = $(".productPrice"+ProductID+" span").html(); //console.log(CategoryName);
        var Image = "";
        product = new createProductObject(ProductID, ProductName, CategoryName, UnitPrice, /*Quantity,*/ Image);
        product.Quantity = parseInt(quantity, 10);
    }
    
    if(!document.getElementById("quantity"+ProductID).validity.rangeUnderflow){
        
        bill += quantity * product.UnitPrice;
        parseFloat(bill).toFixed(2);
        
        // adding product in the basket
        if(basket.length < 1){
            product.Quantity = parseInt(quantity, 10); //console.log(product.Quantity);
            basket.push(product);
            
        } else {
            
            var foundProduct = findProductInBasket(product.ProductID);
            
            if(foundProduct){
                foundProduct.Quantity += parseInt(quantity, 10);//console.log(foundProduct.Quantity);
            } else {
                product.Quantity = parseInt(quantity, 10);
                basket.push(product);                      
            }
  
        }
  /***********************************************************/
        
	
        var img = $("section").find('#img'+ProductID); //console.log(img);
		var imgDiv = $("section .productImage"+product.ProductID); //console.log(imgDiv);
		// add a copy of the image to the document
		var ghost = img.clone().appendTo(imgDiv).addClass('ghost'); //console.log(ghost);
		
		var imgCoords = img.offset(), 
			target = $('#basket'),
			targetCoords = target.offset();
		//console.log(imgCoords); console.log(targetCoords);
		ghost.animate({
			'left' : targetCoords.left - imgCoords.left + 40,
			'top' : targetCoords.top - imgCoords.top - 10,
			'opacity' : 0,
			'width' : '30px'
		}, 1500,  function(){
			ghost.remove(); // remove ghost image
		});
    
 
  //***************************************\\      
        
        $("#bill").html(bill + " $");
        
    } else {
        alert("qu");
    }
    console.log(basket);
    $("#quantity"+ProductID).val("1"); // reset quantity to 1
}

function removeProductFromCart(e){
    var buttonId = e.id; //console.log(ProductID);
    var ProductID = buttonId.slice(1); //console.log(ProductID);
    var quantity = $("#quantity"+ProductID).val(); //console.log(quantity);
    
    if(!document.getElementById("quantity"+ProductID).validity.rangeUnderflow){
        
        if(basket.length < 1){
            alert("Basket is empty!");
        } else {
            
            var foundProduct = findProductInBasket(ProductID);
            
            if(foundProduct){
                
                if(foundProduct.Quantity > quantity){
                    
                    foundProduct.Quantity -= parseInt(quantity, 10);
                    bill -= quantity * foundProduct.UnitPrice;
                    
                } else if(foundProduct.Quantity == quantity){ 

                    for(var p in basket){
                        if(basket[p].ProductName == foundProduct.ProductName){
                            var ind = basket.indexOf(basket[p]);
                            basket.splice(ind,1);
                        }
                    }
                    bill -= quantity * foundProduct.UnitPrice;
                    //<article id='article"+product.ProductID+"'>
                    // delete node from DOM
                    if(inBasket){
                        $("#article"+foundProduct.ProductID).fadeOut("slow");
                    }
                    
                } else {
                    alert("Cant't delete more then you have product");
                }
                
            } else {
                alert("no such a product in basket");                     
            }
  
        }      
    
        $("#bill").html(bill + " $");
        
    } else {
        alert("qu");
    }
    console.log(basket);
    $("#quantity"+ProductID).val("1"); // reset quantity to 1
}

var inBasket = false;
function showBasket(){
    
    if(basket.length > 0){
        $("section").html("");
        inBasket = true;
        
        disableOrdersSearch()
        enableProductSearch();
        
        for(var p in basket){
            HTMLproductBox(basket[p]);  
        }   
        
    } else {
        alert("Basket is empty!");
    }

}
    
    
    
// format date 
function todayDate(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd;
    } 

    if(mm<10) {
        mm='0'+mm;
    } 

    today = yyyy+"-"+mm+"-"+dd;
    return today;

}

function logout(){
    //var customer = sessionStorage.getItem("user");
    localStorage.removeItem("user");
    window.location = 'login.html';
}